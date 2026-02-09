import { sourceManager } from "../../core/source-manager";
import { logger } from "../../utils/logger";

interface SourcesAddOptions {
  name?: string;
  branch?: string;
  skillsDir?: string;
}

export async function addSource(
  url: string,
  options: SourcesAddOptions
): Promise<void> {
  try {
    const source = await sourceManager.addSource(url, {
      name: options.name,
      branch: options.branch,
      skillsDir: options.skillsDir,
    });

    logger.success(`Added source "${source.name}"`);
    logger.info(`Run 'codekit sources pull' to clone the repo`);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to add source");
    process.exit(1);
  }
}
