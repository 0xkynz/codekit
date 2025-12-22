import { Command } from "commander";
import { listAgents } from "./list";
import { addAgent } from "./add";
import { removeAgent } from "./remove";

export function createAgentsCommand(): Command {
  const agents = new Command("agents")
    .description("Manage agent definitions")
    .alias("agent");

  agents
    .command("list")
    .alias("ls")
    .description("List available and installed agents")
    .option("-g, --global", "List from global ~/.claude directory")
    .option("-c, --category <category>", "Filter by category")
    .option("-i, --installed", "Show only installed agents")
    .option("-a, --available", "Show only available (not installed) agents")
    .option("--json", "Output as JSON")
    .action(listAgents);

  agents
    .command("add <name>")
    .alias("install")
    .description("Add an agent from bundled templates")
    .option("-g, --global", "Install to global ~/.claude directory")
    .option("-f, --force", "Overwrite if already installed")
    .option("--skip-deps", "Skip installing dependencies")
    .option("--dry-run", "Show what would be installed without writing")
    .action(addAgent);

  agents
    .command("remove <name>")
    .alias("rm")
    .alias("uninstall")
    .description("Remove an installed agent")
    .option("-g, --global", "Remove from global ~/.claude directory")
    .option("-f, --force", "Skip confirmation")
    .option("--dry-run", "Show what would be removed without deleting")
    .action(removeAgent);

  return agents;
}
