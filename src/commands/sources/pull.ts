import { sourceManager } from "../../core/source-manager";
import { logger } from "../../utils/logger";

interface SourcesPullOptions {
  source?: string;
}

export async function pullSources(options: SourcesPullOptions): Promise<void> {
  try {
    await sourceManager.pullAll(options.source);
    logger.success("All sources up to date");
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to pull sources");
    process.exit(1);
  }
}
