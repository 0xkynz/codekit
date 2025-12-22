import { Command } from "commander";
import { listCommands } from "./list";
import { addCommand } from "./add";
import { removeCommand } from "./remove";

export function createCommandsCommand(): Command {
  const commands = new Command("commands")
    .description("Manage slash command definitions")
    .alias("command")
    .alias("cmd");

  commands
    .command("list")
    .alias("ls")
    .description("List available and installed commands")
    .option("-g, --global", "List from global ~/.claude directory")
    .option("-i, --installed", "Show only installed commands")
    .option("-a, --available", "Show only available (not installed) commands")
    .option("--json", "Output as JSON")
    .action(listCommands);

  commands
    .command("add <name>")
    .alias("install")
    .description("Add a command from bundled templates")
    .option("-g, --global", "Install to global ~/.claude directory")
    .option("-f, --force", "Overwrite if already installed")
    .option("--dry-run", "Show what would be installed without writing")
    .action(addCommand);

  commands
    .command("remove <name>")
    .alias("rm")
    .alias("uninstall")
    .description("Remove an installed command")
    .option("-g, --global", "Remove from global ~/.claude directory")
    .option("-f, --force", "Skip confirmation")
    .option("--dry-run", "Show what would be removed without deleting")
    .action(removeCommand);

  return commands;
}
