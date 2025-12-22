import { Command } from "commander";
import { setVerbose } from "./utils/logger";
import { createAgentsCommand } from "./commands/agents";
import { createSkillsCommand } from "./commands/skills";
import { createCommandsCommand } from "./commands/commands";
import { createInitCommand } from "./commands/init";
import { createLearnCommand } from "./commands/learn";
import { createSyncCommand } from "./commands/sync";

const VERSION = "0.1.0";

export function createCLI(): Command {
  const program = new Command();

  program
    .name("codekit")
    .description("CLI tool for managing Claude agent resources (agents, skills, commands)")
    .version(VERSION)
    .option("-v, --verbose", "Enable verbose output")
    .hook("preAction", (thisCommand) => {
      const opts = thisCommand.opts();
      if (opts.verbose) {
        setVerbose(true);
      }
    });

  // Add subcommands
  program.addCommand(createInitCommand());
  program.addCommand(createLearnCommand());
  program.addCommand(createSyncCommand());
  program.addCommand(createAgentsCommand());
  program.addCommand(createSkillsCommand());
  program.addCommand(createCommandsCommand());

  return program;
}
