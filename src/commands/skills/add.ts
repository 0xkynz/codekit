import type { AddOptions } from "../../types";
import { skillManager } from "../../core/skill-manager";
import { logger, style } from "../../utils/logger";
import { buildSkillGraph } from "../../utils/skill-graph";

export async function addSkill(
  name: string,
  options: AddOptions
): Promise<void> {
  try {
    await skillManager.add(name, options);

    // Show related skill suggestions
    if (!options.quiet) {
      try {
        const graph = await buildSkillGraph();
        const related = graph.getRelated(name);

        if (related.length > 0) {
          logger.newline();
          logger.log(`${style.dim("Related skills:")}`);
          for (const edge of related) {
            const entry = graph.getEntry(edge.target);
            const displayName = entry?.displayName || edge.target;
            logger.log(`  ${style.dim(edge.relationship)} ${displayName}`);
          }
          logger.log(`  ${style.dim("Install with:")} codekit skills add <name>`);
        }
      } catch {
        // Non-critical — skip hints if graph fails
      }
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to add skill");
    process.exit(1);
  }
}
