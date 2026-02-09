import { sourceManager } from "../../core/source-manager";
import { logger, style, outputJson } from "../../utils/logger";

interface SourcesSyncOptions {
  source?: string;
  dryRun?: boolean;
  json?: boolean;
}

export async function syncSources(options: SourcesSyncOptions): Promise<void> {
  try {
    const result = await sourceManager.syncAll({
      filterName: options.source,
      dryRun: options.dryRun,
    });

    if (options.json) {
      outputJson(result);
      return;
    }

    if (options.dryRun) {
      logger.section("Dry run — no changes made");
    }

    if (result.added.length > 0) {
      logger.section(`Added (${result.added.length})`);
      for (const name of result.added) {
        logger.log(`  ${style.green("+")} ${style.skill(name)}`);
      }
    }

    if (result.updated.length > 0) {
      logger.section(`Updated (${result.updated.length})`);
      for (const name of result.updated) {
        logger.log(`  ${style.blue("~")} ${style.skill(name)}`);
      }
    }

    if (result.skipped.length > 0) {
      logger.section(`Skipped (${result.skipped.length})`);
      for (const name of result.skipped) {
        logger.log(`  ${style.dim("-")} ${name}`);
      }
    }

    logger.newline();
    logger.success(
      `Synced ${result.total} skills (${result.added.length} added, ${result.updated.length} updated)`
    );
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to sync sources");
    process.exit(1);
  }
}
