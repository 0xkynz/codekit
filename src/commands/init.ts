import { Command } from "commander";
import * as prompts from "@clack/prompts";
import type { InitOptions, ResourceType } from "../types";
import { getClaudeDir, ensureDir, pathExists } from "../utils/paths";
import { logger, style } from "../utils/logger";
import { templateLoader } from "../core/template-loader";
import { agentManager } from "../core/agent-manager";
import { skillManager } from "../core/skill-manager";
import { commandManager } from "../core/command-manager";

export function createInitCommand(): Command {
  return new Command("init")
    .description("Initialize a new Claude project with agents, skills, and commands")
    .option("-g, --global", "Initialize in global ~/.claude directory")
    .option("-y, --yes", "Accept all defaults without prompting")
    .option("-f, --force", "Overwrite existing configuration")
    .option("--dry-run", "Show what would be created without writing")
    .action(initProject);
}

async function initProject(options: InitOptions): Promise<void> {
  try {
    const targetDir = getClaudeDir(options);
    const exists = await pathExists(targetDir);

    // Show intro
    prompts.intro(style.bold("codekit init"));

    // Check if already initialized
    if (exists && !options.force) {
      const overwrite = options.yes
        ? false
        : await prompts.confirm({
            message: `${targetDir} already exists. Reinitialize?`,
          });

      if (prompts.isCancel(overwrite)) {
        prompts.cancel("Cancelled");
        process.exit(0);
      }

      if (!overwrite) {
        logger.info("Use --force to overwrite existing configuration");
        prompts.outro("Done");
        return;
      }
    }

    // Select resource types to initialize
    let resourceTypes: ResourceType[];

    if (options.yes) {
      resourceTypes = ["agents", "commands"];
    } else {
      const selected = await prompts.multiselect({
        message: "What resources do you want to set up?",
        options: [
          { value: "agents", label: "Agents", hint: "AI expert personas" },
          { value: "skills", label: "Skills", hint: "Reusable capabilities" },
          { value: "commands", label: "Commands", hint: "Slash commands" },
        ],
        initialValues: ["agents", "commands"],
      });

      if (prompts.isCancel(selected)) {
        prompts.cancel("Cancelled");
        process.exit(0);
      }

      resourceTypes = selected as ResourceType[];
    }

    // For each resource type, select templates to install
    const toInstall: Map<ResourceType, string[]> = new Map();

    for (const type of resourceTypes) {
      const templates = await templateLoader.listAvailableTemplates(type);

      if (templates.length === 0) {
        logger.warn(`No ${type} templates available`);
        continue;
      }

      if (options.yes) {
        // Install all by default in non-interactive mode
        toInstall.set(type, templates.map((t) => t.name));
      } else {
        // Group templates by category for better UX
        const categories = new Map<string, typeof templates>();
        for (const t of templates) {
          const cat = t.category || "general";
          const existing = categories.get(cat) || [];
          existing.push(t);
          categories.set(cat, existing);
        }

        // Create options with category grouping
        const templateOptions = templates.map((t) => ({
          value: t.name,
          label: t.displayName || t.name,
          hint: t.description.slice(0, 50) + (t.description.length > 50 ? "..." : ""),
        }));

        const selected = await prompts.multiselect({
          message: `Select ${type} to install:`,
          options: templateOptions,
          required: false,
        });

        if (prompts.isCancel(selected)) {
          prompts.cancel("Cancelled");
          process.exit(0);
        }

        if ((selected as string[]).length > 0) {
          toInstall.set(type, selected as string[]);
        }
      }
    }

    // Show summary
    if (options.dryRun) {
      logger.section("Would create:");
      logger.log(`  ${style.dim(targetDir)}`);

      for (const [type, names] of toInstall) {
        logger.log(`  ${style.dim(`├── ${type}/`)}`);
        for (const name of names) {
          logger.log(`  ${style.dim(`│   └── ${name}`)}`);
        }
      }

      prompts.outro("Dry run complete");
      return;
    }

    // Create directories
    const spinner = prompts.spinner();
    spinner.start("Creating directories");

    await ensureDir(targetDir);
    for (const type of resourceTypes) {
      await ensureDir(`${targetDir}/${type}`);
    }

    spinner.stop("Directories created");

    // Install selected templates
    let installed = 0;
    let failed = 0;

    for (const [type, names] of toInstall) {
      for (const name of names) {
        try {
          const manager =
            type === "agents"
              ? agentManager
              : type === "skills"
                ? skillManager
                : commandManager;

          await manager.add(name, {
            ...options,
            quiet: true,
            skipDeps: false,
          });

          installed++;
          logger.success(`Installed ${type}/${name}`);
        } catch (error) {
          failed++;
          logger.warn(`Failed to install ${type}/${name}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    }

    // Create CLAUDE.md if not global and doesn't exist
    if (!options.global) {
      const claudeMdPath = `${process.cwd()}/CLAUDE.md`;
      if (!(await pathExists(claudeMdPath))) {
        const createClaudeMd = options.yes
          ? true
          : await prompts.confirm({
              message: "Create CLAUDE.md project configuration file?",
            });

        if (!prompts.isCancel(createClaudeMd) && createClaudeMd) {
          await Bun.write(
            claudeMdPath,
            `# Project Configuration for Claude

## Tech Stack
<!-- Describe your technology stack here -->

## Code Style
<!-- Describe your coding conventions -->

## Testing
<!-- Describe your testing requirements -->

## Architecture
<!-- Describe your project architecture -->
`
          );
          logger.success("Created CLAUDE.md");
        }
      }
    }

    // Summary
    prompts.outro(
      `Initialized ${style.bold(targetDir)} with ${installed} resources${failed > 0 ? ` (${failed} failed)` : ""}`
    );
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to initialize");
    process.exit(1);
  }
}
