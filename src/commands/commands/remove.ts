import type { RemoveOptions } from "../../types";
import { commandManager } from "../../core/command-manager";
import { logger } from "../../utils/logger";
import * as prompts from "@clack/prompts";

export async function removeCommand(
  name: string,
  options: RemoveOptions
): Promise<void> {
  try {
    // Confirm removal unless --force
    if (!options.force && !options.dryRun) {
      const confirmed = await prompts.confirm({
        message: `Remove command "/${name}"?`,
      });

      if (prompts.isCancel(confirmed) || !confirmed) {
        logger.info("Cancelled");
        return;
      }
    }

    await commandManager.remove(name, options);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to remove command");
    process.exit(1);
  }
}
