import { Command } from "commander";
import * as prompts from "@clack/prompts";
import type { GlobalOptions } from "../types";
import { ensureDir, pathExists } from "../utils/paths";
import { logger, style } from "../utils/logger";
import {
  scanProject,
  generateMemoryBankFiles,
  type ProjectContext,
} from "../utils/project-scanner";
import {
  generateAllPlatformRules,
  getPlatformFilePath,
  ALL_PLATFORMS,
  PLATFORMS,
  type AIPlatform,
} from "../utils/platform-rules";
import { join } from "path";

interface LearnOptions extends GlobalOptions {
  force?: boolean;
  dryRun?: boolean;
  yes?: boolean;
  claudeMd?: boolean;
  memoryBank?: boolean;
  platforms?: string;
  all?: boolean;
}

export function createLearnCommand(): Command {
  return new Command("learn")
    .description("Scan project and create AI assistant rules for Claude, Cursor, and Gemini")
    .option("-f, --force", "Overwrite existing files")
    .option("--dry-run", "Show what would be created without writing")
    .option("-y, --yes", "Accept all defaults without prompting")
    .option("--claude-md", "Only create/update CLAUDE.md (legacy option)")
    .option("--memory-bank", "Only create/update memory-bank")
    .option("-p, --platforms <platforms>", "Comma-separated platforms: claude,cursor,gemini")
    .option("-a, --all", "Generate rules for all supported platforms")
    .action(learnProject);
}

async function learnProject(options: LearnOptions): Promise<void> {
  try {
    const rootDir = process.cwd();

    prompts.intro(style.bold("codekit learn"));

    // Scan the project
    const spinner = prompts.spinner();
    spinner.start("Scanning project...");

    const context = await scanProject(rootDir);

    spinner.stop("Project scanned");

    // Display detected context
    displayContext(context);

    // Determine which platforms to generate for
    let selectedPlatforms: AIPlatform[] = [];

    if (options.all) {
      selectedPlatforms = [...ALL_PLATFORMS];
    } else if (options.platforms) {
      selectedPlatforms = options.platforms.split(",").map(p => p.trim().toLowerCase()) as AIPlatform[];
      // Validate platforms
      for (const p of selectedPlatforms) {
        if (!ALL_PLATFORMS.includes(p)) {
          logger.error(`Unknown platform: ${p}. Valid platforms: ${ALL_PLATFORMS.join(", ")}`);
          process.exit(1);
        }
      }
    } else if (options.claudeMd) {
      // Legacy option - just claude
      selectedPlatforms = ["claude"];
    }

    // Determine what to create
    let createMemoryBank = options.memoryBank || (!options.memoryBank && !options.claudeMd && !options.platforms && !options.all);

    // If no platforms specified and not memory-bank only, prompt user
    if (selectedPlatforms.length === 0 && !options.yes && !options.memoryBank) {
      const platformChoices = ALL_PLATFORMS.map(p => ({
        value: p,
        label: PLATFORMS[p].displayName,
        hint: PLATFORMS[p].description,
      }));

      const selected = await prompts.multiselect({
        message: "Which AI assistant rules would you like to generate?",
        options: platformChoices,
        initialValues: ["claude"] as AIPlatform[], // Default to Claude
      });

      if (prompts.isCancel(selected)) {
        prompts.cancel("Cancelled");
        process.exit(0);
      }

      selectedPlatforms = selected as AIPlatform[];
    } else if (selectedPlatforms.length === 0) {
      // Default to Claude if using --yes
      selectedPlatforms = ["claude"];
    }

    // Memory bank selection
    const memoryBankDir = join(rootDir, "memory-bank");
    const memoryBankExists = await pathExists(memoryBankDir);

    if (!options.yes && !options.dryRun && !options.memoryBank && !options.claudeMd && !options.platforms) {
      const createMB = await prompts.confirm({
        message: memoryBankExists
          ? "Update memory-bank with project context?"
          : "Create memory-bank for persistent context across sessions?",
        initialValue: !memoryBankExists,
      });

      if (prompts.isCancel(createMB)) {
        prompts.cancel("Cancelled");
        process.exit(0);
      }

      createMemoryBank = createMB as boolean;
    }

    // Check existing platform files
    const existingFiles: Record<AIPlatform, boolean> = {
      claude: false,
      cursor: false,
      gemini: false,
    };

    for (const platform of selectedPlatforms) {
      const filePath = getPlatformFilePath(platform, rootDir);
      existingFiles[platform] = await pathExists(filePath);
    }

    // Handle existing files
    if (!options.force && !options.dryRun && !options.yes) {
      for (const platform of [...selectedPlatforms]) {
        if (existingFiles[platform]) {
          const fileName = PLATFORMS[platform].files[0];
          const overwrite = await prompts.confirm({
            message: `${fileName} already exists. Overwrite?`,
          });

          if (prompts.isCancel(overwrite)) {
            prompts.cancel("Cancelled");
            process.exit(0);
          }

          if (!overwrite) {
            selectedPlatforms = selectedPlatforms.filter(p => p !== platform);
            logger.info(`Skipping ${fileName}`);
          }
        }
      }
    }

    // Handle memory-bank existing
    if (!options.force && !options.dryRun && createMemoryBank && memoryBankExists && !options.yes) {
      const overwrite = await prompts.confirm({
        message: "memory-bank/ already exists. Merge with existing files?",
      });

      if (prompts.isCancel(overwrite)) {
        prompts.cancel("Cancelled");
        process.exit(0);
      }

      if (!overwrite) {
        createMemoryBank = false;
        logger.info("Skipping memory-bank");
      }
    }

    // Dry run output
    if (options.dryRun) {
      logger.section("Would create:");

      for (const platform of selectedPlatforms) {
        const filePath = getPlatformFilePath(platform, rootDir);
        logger.log(`  ${style.dim(filePath)}`);
      }

      if (createMemoryBank) {
        logger.log(`  ${style.dim(memoryBankDir + "/")}`);
        const memoryFiles = generateMemoryBankFiles(context);
        for (const fileName of Object.keys(memoryFiles)) {
          logger.log(`    ${style.dim(fileName)}`);
        }
      }

      prompts.outro("Dry run complete");
      return;
    }

    // Generate and write platform rules
    let created = 0;
    const allRules = generateAllPlatformRules(context);

    for (const platform of selectedPlatforms) {
      const filePath = getPlatformFilePath(platform, rootDir);
      const content = allRules[platform];
      const exists = existingFiles[platform];

      await Bun.write(filePath, content);
      logger.success(`${exists ? "Updated" : "Created"} ${PLATFORMS[platform].files[0]}`);
      created++;
    }

    // Create memory-bank
    if (createMemoryBank) {
      await ensureDir(memoryBankDir);

      const memoryFiles = generateMemoryBankFiles(context);

      for (const [fileName, content] of Object.entries(memoryFiles)) {
        const filePath = join(memoryBankDir, fileName);
        const exists = await pathExists(filePath);

        // For existing memory-bank, only write if file doesn't exist or force is set
        if (!exists || options.force) {
          await Bun.write(filePath, content);
          logger.success(`${exists ? "Updated" : "Created"} memory-bank/${fileName}`);
          created++;
        } else {
          logger.info(`Skipped memory-bank/${fileName} (already exists)`);
        }
      }
    }

    // Summary
    const platformNames = selectedPlatforms.map(p => PLATFORMS[p].displayName).join(", ");
    prompts.outro(
      `Generated rules for ${platformNames || "no platforms"} (${created} file${created !== 1 ? "s" : ""})`
    );

    // Next steps hint
    logger.newline();
    logger.section("Generated files:");
    for (const platform of selectedPlatforms) {
      logger.log(`  ${style.dim(PLATFORMS[platform].displayName + ":")} ${PLATFORMS[platform].files[0]}`);
    }
    if (createMemoryBank) {
      logger.log(`  ${style.dim("Memory Bank:")} memory-bank/`);
    }

    if (createMemoryBank) {
      logger.newline();
      logger.section("Next steps:");
      logger.log("  1. Review and customize memory-bank/projectbrief.md");
      logger.log("  2. Update memory-bank/productContext.md with product details");
      logger.log("  3. Document patterns in memory-bank/systemPatterns.md");
      logger.log("  4. Keep memory-bank/activeContext.md updated as you work");
    }

    logger.newline();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to learn project");
    process.exit(1);
  }
}

/**
 * Display detected project context
 */
function displayContext(context: ProjectContext): void {
  logger.newline();
  logger.section(`Detected: ${context.name}`);

  // Tech stack
  if (context.techStack.languages.length > 0) {
    logger.log(`  ${style.dim("Languages:")} ${context.techStack.languages.join(", ")}`);
  }
  if (context.techStack.frameworks.length > 0) {
    logger.log(`  ${style.dim("Frameworks:")} ${context.techStack.frameworks.join(", ")}`);
  }
  if (context.techStack.buildTools.length > 0) {
    logger.log(`  ${style.dim("Build:")} ${context.techStack.buildTools.join(", ")}`);
  }
  if (context.techStack.testingTools.length > 0) {
    logger.log(`  ${style.dim("Testing:")} ${context.techStack.testingTools.join(", ")}`);
  }
  if (context.techStack.packageManager) {
    logger.log(`  ${style.dim("Package Manager:")} ${context.techStack.packageManager}`);
  }

  // Dependencies count
  const deps = context.dependencies;
  const depCounts: string[] = [];
  if (deps.javascript) {
    const count = Object.keys(deps.javascript.dependencies).length + Object.keys(deps.javascript.devDependencies).length;
    depCounts.push(`${count} npm packages`);
  }
  if (deps.python) {
    depCounts.push(`${deps.python.dependencies.length} Python packages`);
  }
  if (deps.rust) {
    depCounts.push(`${Object.keys(deps.rust.dependencies).length} Rust crates`);
  }
  if (deps.go) {
    depCounts.push(`${deps.go.dependencies.length} Go modules`);
  }
  if (depCounts.length > 0) {
    logger.log(`  ${style.dim("Dependencies:")} ${depCounts.join(", ")}`);
  }

  // Structure
  if (context.structure.srcDir || context.structure.testDir) {
    logger.log(
      `  ${style.dim("Structure:")} ${[
        context.structure.srcDir && `src=${context.structure.srcDir}`,
        context.structure.testDir && `test=${context.structure.testDir}`,
        context.structure.hasMonorepo && "monorepo",
      ]
        .filter(Boolean)
        .join(", ")}`
    );
  }

  // Patterns
  if (context.patterns.architecture.length > 0) {
    logger.log(`  ${style.dim("Patterns:")} ${context.patterns.architecture.join(", ")}`);
  }

  // Code style
  const styleInfo: string[] = [];
  if (context.patterns.codeStyle.usesTypeScript) styleInfo.push("TypeScript");
  if (context.patterns.codeStyle.hasLinter) styleInfo.push("ESLint");
  if (context.patterns.codeStyle.hasFormatter) styleInfo.push("Prettier");
  if (styleInfo.length > 0) {
    logger.log(`  ${style.dim("Code Style:")} ${styleInfo.join(", ")}`);
  }

  // Git
  if (context.gitInfo) {
    logger.log(
      `  ${style.dim("Git:")} ${context.gitInfo.branch || "detached"}${
        context.gitInfo.hasRemote ? " (has remote)" : ""
      }`
    );
  }

  logger.newline();
}
