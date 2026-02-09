import { sourceManager } from "../../core/source-manager";
import { logger, style, outputJson } from "../../utils/logger";

interface SourcesListOptions {
  json?: boolean;
}

export async function listSources(options: SourcesListOptions): Promise<void> {
  try {
    const results = await sourceManager.listSources();

    if (options.json) {
      outputJson(results);
      return;
    }

    if (results.length === 0) {
      logger.info("No sources configured. Add one with: codekit sources add <url>");
      return;
    }

    for (const { source, skills, cloned } of results) {
      const status = cloned ? style.installed : style.pending;
      const cloneStatus = cloned
        ? style.dim("(cloned)")
        : style.warning("(not cloned)");

      logger.section(`${status} ${style.bold(source.name)} ${cloneStatus}`);
      logger.log(`  ${style.dim(source.url)}`);

      if (cloned && skills.length > 0) {
        logger.log(`  ${style.dim(`${skills.length} skills:`)}`);
        for (const skill of skills) {
          const category = skill.category
            ? style.dim(` [${skill.category}]`)
            : "";
          logger.log(`    ${style.skill(skill.name)}${category}`);
        }
      } else if (cloned) {
        logger.log(`  ${style.dim("No skills found")}`);
      }
    }

    logger.newline();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to list sources");
    process.exit(1);
  }
}
