import { Command } from "commander";
import * as prompts from "@clack/prompts";
import type { InitOptions, ResourceType } from "../types";
import { getClaudeDir, getGeminiDir, ensureDir, pathExists, displayHome } from "../utils/paths";
import { join } from "path";
import { logger, style } from "../utils/logger";
import { templateLoader } from "../core/template-loader";
import { skillManager } from "../core/skill-manager";
import { commandManager } from "../core/command-manager";
import { buildSkillGraph } from "../utils/skill-graph";
import { getInstalledSkillsInfo } from "../utils/installed-skills";
import type { InstalledSkillInfo } from "../types";

export function createInitCommand(): Command {
  return new Command("init")
    .description("Initialize a new Claude project with skills and commands")
    .option("-g, --global", `Initialize in global ${displayHome()}/.claude directory`)
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
      resourceTypes = ["skills", "commands"];
    } else {
      const selected = await prompts.multiselect({
        message: "What resources do you want to set up?",
        options: [
          { value: "skills", label: "Skills", hint: "Reusable capabilities" },
          { value: "commands", label: "Commands", hint: "Slash commands" },
        ],
        initialValues: ["skills", "commands"],
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
          initialValues: type === "skills" ? ["setup"] : ([] as string[]),
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

    // Phase 2: Suggest related skills based on selection
    const selectedSkills = toInstall.get("skills");
    if (selectedSkills && selectedSkills.length > 0 && !options.yes) {
      const graph = await buildSkillGraph();
      const suggestions = graph.getSuggestionsForSelection(selectedSkills);

      if (suggestions.length > 0) {
        const suggestionOptions = suggestions.map(s => {
          const hints = s.relationships
            .map(r => `${r.type} ${r.skill}`)
            .join(", ");
          return {
            value: s.name,
            label: s.displayName,
            hint: hints,
          };
        });

        const additional = await prompts.multiselect({
          message: "These related skills complement your selection. Add any?",
          options: suggestionOptions,
          required: false,
        });

        if (!prompts.isCancel(additional) && (additional as string[]).length > 0) {
          const merged = [...selectedSkills, ...(additional as string[])];
          toInstall.set("skills", merged);
        }
      }
    }

    // Show summary
    if (options.dryRun) {
      const geminiDir = getGeminiDir(options);

      logger.section("Would create:");
      logger.log(`  ${style.dim(targetDir)}`);

      for (const [type, names] of toInstall) {
        logger.log(`  ${style.dim(`├── ${type}/`)}`);
        for (const name of names) {
          logger.log(`  ${style.dim(`│   └── ${name}`)}`);
        }
      }

      logger.log(`  ${style.dim(geminiDir)}`);
      if (toInstall.has("skills")) {
        logger.log(`  ${style.dim("├── skills/")}`);
        for (const name of toInstall.get("skills")!) {
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
      await ensureDir(join(targetDir, type));
    }

    // Create Gemini Antigravity directories for skills
    if (resourceTypes.includes("skills")) {
      const geminiDir = getGeminiDir(options);
      await ensureDir(join(geminiDir, "skills"));
    }

    spinner.stop("Directories created");

    // Install selected templates
    let installed = 0;
    let failed = 0;

    for (const [type, names] of toInstall) {
      for (const name of names) {
        try {
          const manager =
            type === "skills"
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
      const claudeMdPath = join(process.cwd(), "CLAUDE.md");
      if (!(await pathExists(claudeMdPath))) {
        const createClaudeMd = options.yes
          ? true
          : await prompts.confirm({
              message: "Create CLAUDE.md project configuration file?",
            });

        if (!prompts.isCancel(createClaudeMd) && createClaudeMd) {
          // Scan installed skills to include in CLAUDE.md
          const installedSkills = await getInstalledSkillsInfo();
          const skillsSection = generateInitSkillsSection(installedSkills);

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
${skillsSection}`
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

/**
 * Generate an installed skills section for CLAUDE.md during init.
 * Tells Claude what skills are available and where to find them.
 */
function generateInitSkillsSection(skills: InstalledSkillInfo[]): string {
  if (skills.length === 0) return "";

  const lines: string[] = [
    "\n## Installed Skills\n",
    "The following skills are installed and available. Read the skill file when working on related tasks.\n",
  ];

  // Group by category
  const byCategory = new Map<string, InstalledSkillInfo[]>();
  for (const skill of skills) {
    const cat = skill.category || "general";
    const existing = byCategory.get(cat) || [];
    existing.push(skill);
    byCategory.set(cat, existing);
  }

  for (const category of Array.from(byCategory.keys()).sort()) {
    const categorySkills = byCategory.get(category)!;
    lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`);

    for (const skill of categorySkills) {
      lines.push(`- **${skill.displayName}** (\`${skill.path}/SKILL.md\`)`);
      lines.push(`  ${skill.description}`);

      if (skill.relatedSkills.length > 0) {
        const related = skill.relatedSkills
          .map(r => `${r.name} (${r.relationship})`)
          .join(", ");
        lines.push(`  Related: ${related}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}
