import * as prompts from "@clack/prompts";
import { sourceManager } from "../../core/source-manager";
import { logger } from "../../utils/logger";

interface SourcesRemoveOptions {
  force?: boolean;
}

export async function removeSource(
  name: string,
  options: SourcesRemoveOptions
): Promise<void> {
  try {
    if (!options.force) {
      const confirmed = await prompts.confirm({
        message: `Remove source "${name}" and its cloned directory?`,
      });

      if (prompts.isCancel(confirmed) || !confirmed) {
        logger.info("Cancelled");
        return;
      }
    }

    await sourceManager.removeSource(name, true);
    logger.success(`Removed source "${name}"`);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to remove source");
    process.exit(1);
  }
}
