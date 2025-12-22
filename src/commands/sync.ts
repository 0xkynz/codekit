import { Command } from "commander";
import * as prompts from "@clack/prompts";
import type { GlobalOptions } from "../types";
import { pathExists } from "../utils/paths";
import { logger, style } from "../utils/logger";
import { scanProject } from "../utils/project-scanner";
import {
  generateAllPlatformRules,
  getPlatformFilePath,
  ALL_PLATFORMS,
  PLATFORMS,
  type AIPlatform,
} from "../utils/platform-rules";

interface SyncOptions extends GlobalOptions {
  force?: boolean;
  dryRun?: boolean;
  yes?: boolean;
  platforms?: string;
}

export function createSyncCommand(): Command {
  return new Command("sync")
    .description("Sync AI assistant rules across Claude, Cursor, and Gemini platforms")
    .option("-f, --force", "Overwrite all existing files without prompting")
    .option("--dry-run", "Show what would be updated without writing")
    .option("-y, --yes", "Accept all defaults without prompting")
    .option("-p, --platforms <platforms>", "Comma-separated platforms to sync: claude,cursor,gemini")
    .action(syncPlatforms);
}

async function syncPlatforms(options: SyncOptions): Promise<void> {
  try {
    const rootDir = process.cwd();

    prompts.intro(style.bold("codekit sync"));

    // Determine which platforms to sync
    let targetPlatforms: AIPlatform[] = [];

    if (options.platforms) {
      targetPlatforms = options.platforms.split(",").map(p => p.trim().toLowerCase()) as AIPlatform[];
      // Validate platforms
      for (const p of targetPlatforms) {
        if (!ALL_PLATFORMS.includes(p)) {
          logger.error(`Unknown platform: ${p}. Valid platforms: ${ALL_PLATFORMS.join(", ")}`);
          process.exit(1);
        }
      }
    } else {
      // Default to all platforms
      targetPlatforms = [...ALL_PLATFORMS];
    }

    // Check which files already exist
    const existingFiles: Record<AIPlatform, boolean> = {
      claude: false,
      cursor: false,
      gemini: false,
    };

    for (const platform of ALL_PLATFORMS) {
      const filePath = getPlatformFilePath(platform, rootDir);
      existingFiles[platform] = await pathExists(filePath);
    }

    // Show current state
    logger.section("Current state:");
    for (const platform of ALL_PLATFORMS) {
      const status = existingFiles[platform] ? style.success("exists") : style.dim("missing");
      logger.log(`  ${PLATFORMS[platform].displayName}: ${status}`);
    }
    logger.newline();

    // Prompt for platforms to sync if not specified
    if (!options.yes && !options.platforms && !options.dryRun) {
      const platformChoices = ALL_PLATFORMS.map(p => ({
        value: p,
        label: PLATFORMS[p].displayName,
        hint: existingFiles[p] ? "will be updated" : "will be created",
      }));

      const selected = await prompts.multiselect({
        message: "Which platforms would you like to sync?",
        options: platformChoices,
        initialValues: targetPlatforms,
      });

      if (prompts.isCancel(selected)) {
        prompts.cancel("Cancelled");
        process.exit(0);
      }

      targetPlatforms = selected as AIPlatform[];
    }

    if (targetPlatforms.length === 0) {
      logger.warn("No platforms selected");
      prompts.outro("Nothing to sync");
      return;
    }

    // Scan project to get current context
    const spinner = prompts.spinner();
    spinner.start("Scanning project...");

    const context = await scanProject(rootDir);

    spinner.stop("Project scanned");

    // Confirm overwriting existing files
    if (!options.force && !options.dryRun && !options.yes) {
      const existingToOverwrite = targetPlatforms.filter(p => existingFiles[p]);
      if (existingToOverwrite.length > 0) {
        const fileNames = existingToOverwrite.map(p => PLATFORMS[p].files[0]).join(", ");
        const confirm = await prompts.confirm({
          message: `Overwrite existing files (${fileNames})?`,
          initialValue: true,
        });

        if (prompts.isCancel(confirm) || !confirm) {
          prompts.cancel("Cancelled");
          process.exit(0);
        }
      }
    }

    // Dry run output
    if (options.dryRun) {
      logger.section("Would sync:");
      for (const platform of targetPlatforms) {
        const filePath = getPlatformFilePath(platform, rootDir);
        const action = existingFiles[platform] ? "update" : "create";
        logger.log(`  ${style.dim(action)} ${filePath}`);
      }
      prompts.outro("Dry run complete");
      return;
    }

    // Generate and write rules
    const allRules = generateAllPlatformRules(context);
    let updated = 0;
    let created = 0;

    for (const platform of targetPlatforms) {
      const filePath = getPlatformFilePath(platform, rootDir);
      const content = allRules[platform];
      const exists = existingFiles[platform];

      await Bun.write(filePath, content);

      if (exists) {
        logger.success(`Updated ${PLATFORMS[platform].files[0]}`);
        updated++;
      } else {
        logger.success(`Created ${PLATFORMS[platform].files[0]}`);
        created++;
      }
    }

    // Summary
    const summary: string[] = [];
    if (created > 0) summary.push(`${created} created`);
    if (updated > 0) summary.push(`${updated} updated`);

    prompts.outro(`Synced ${targetPlatforms.length} platform${targetPlatforms.length !== 1 ? "s" : ""} (${summary.join(", ")})`);

    // Show synced files
    logger.newline();
    logger.section("Synced files:");
    for (const platform of targetPlatforms) {
      logger.log(`  ${style.dim(PLATFORMS[platform].displayName + ":")} ${PLATFORMS[platform].files[0]}`);
    }
    logger.newline();

  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to sync platforms");
    process.exit(1);
  }
}
