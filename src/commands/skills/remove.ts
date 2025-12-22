import type { RemoveOptions } from "../../types";
import { skillManager } from "../../core/skill-manager";
import { logger } from "../../utils/logger";
import * as prompts from "@clack/prompts";

export async function removeSkill(
  name: string,
  options: RemoveOptions
): Promise<void> {
  try {
    // Confirm removal unless --force
    if (!options.force && !options.dryRun) {
      const confirmed = await prompts.confirm({
        message: `Remove skill "${name}"?`,
      });

      if (prompts.isCancel(confirmed) || !confirmed) {
        logger.info("Cancelled");
        return;
      }
    }

    await skillManager.remove(name, options);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to remove skill");
    process.exit(1);
  }
}
