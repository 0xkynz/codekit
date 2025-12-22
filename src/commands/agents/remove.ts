import type { RemoveOptions } from "../../types";
import { agentManager } from "../../core/agent-manager";
import { logger } from "../../utils/logger";
import * as prompts from "@clack/prompts";

export async function removeAgent(
  name: string,
  options: RemoveOptions
): Promise<void> {
  try {
    // Confirm removal unless --force
    if (!options.force && !options.dryRun) {
      const confirmed = await prompts.confirm({
        message: `Remove agent "${name}"?`,
      });

      if (prompts.isCancel(confirmed) || !confirmed) {
        logger.info("Cancelled");
        return;
      }
    }

    await agentManager.remove(name, options);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to remove agent");
    process.exit(1);
  }
}
