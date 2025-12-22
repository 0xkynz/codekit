import type { AddOptions } from "../../types";
import { skillManager } from "../../core/skill-manager";
import { logger } from "../../utils/logger";

export async function addSkill(
  name: string,
  options: AddOptions
): Promise<void> {
  try {
    await skillManager.add(name, options);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to add skill");
    process.exit(1);
  }
}
