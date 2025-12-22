import type { AddOptions } from "../../types";
import { agentManager } from "../../core/agent-manager";
import { logger } from "../../utils/logger";

export async function addAgent(
  name: string,
  options: AddOptions
): Promise<void> {
  try {
    await agentManager.add(name, options);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to add agent");
    process.exit(1);
  }
}
