import type { AddOptions } from "../../types";
import { commandManager } from "../../core/command-manager";
import { logger } from "../../utils/logger";

export async function addCommand(
  name: string,
  options: AddOptions
): Promise<void> {
  try {
    await commandManager.add(name, options);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to add command");
    process.exit(1);
  }
}
