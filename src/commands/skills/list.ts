import type { ListOptions, Skill } from "../../types";
import { skillManager } from "../../core/skill-manager";
import { logger, style, outputJson } from "../../utils/logger";

interface SkillListOptions extends ListOptions {
  installed?: boolean;
  available?: boolean;
}

export async function listSkills(options: SkillListOptions): Promise<void> {
  try {
    const result = await skillManager.list(options);

    // Combine all skills for deduplication
    const installedNames = new Set([
      ...result.project.map((s) => s.frontmatter.name),
      ...result.global.map((s) => s.frontmatter.name),
    ]);

    let bundled = result.bundled;
    let project = result.project;
    let global = result.global;

    // Filter by installed/available status
    if (options.installed) {
      bundled = [];
    }
    if (options.available) {
      bundled = bundled.filter((s) => !installedNames.has(s.frontmatter.name));
      project = [];
      global = [];
    }

    // JSON output
    if (options.json) {
      outputJson({ bundled, project, global });
      return;
    }

    // Human-readable output
    const hasAny = bundled.length > 0 || project.length > 0 || global.length > 0;

    if (!hasAny) {
      logger.info("No skills found");
      return;
    }

    if (bundled.length > 0) {
      logger.section("📦 Bundled Skills");

      for (const skill of bundled) {
        const installed = installedNames.has(skill.frontmatter.name);
        const status = installed ? style.installed : style.notInstalled;
        const name = style.skill(skill.frontmatter.name);
        const desc = style.dim(` - ${skill.frontmatter.description.slice(0, 60)}...`);
        logger.log(`  ${status} ${name}${desc}`);
      }
    }

    if (project.length > 0) {
      logger.section("📁 Project Skills (.claude/skills/)");
      for (const skill of project) {
        const name = style.skill(skill.frontmatter.name);
        const files = skill.files.length > 0
          ? style.dim(` (${skill.files.length + 1} files)`)
          : "";
        logger.log(`  ${style.installed} ${name}${files}`);
      }
    }

    if (global.length > 0) {
      logger.section("🌐 Global Skills (~/.claude/skills/)");
      for (const skill of global) {
        const name = style.skill(skill.frontmatter.name);
        const files = skill.files.length > 0
          ? style.dim(` (${skill.files.length + 1} files)`)
          : "";
        logger.log(`  ${style.installed} ${name}${files}`);
      }
    }

    logger.newline();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to list skills");
    process.exit(1);
  }
}
