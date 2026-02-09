import { Command } from "commander";
import { listSources } from "./list";
import { addSource } from "./add";
import { removeSource } from "./remove";
import { pullSources } from "./pull";
import { syncSources } from "./sync";

export function createSourcesCommand(): Command {
  const sources = new Command("sources")
    .description("Manage external skill source repositories")
    .alias("source");

  sources
    .command("list")
    .alias("ls")
    .description("List configured sources and their skills")
    .option("--json", "Output as JSON")
    .action(listSources);

  sources
    .command("add <url>")
    .description("Add a source repository")
    .option("-n, --name <name>", "Custom name for the source")
    .option("-b, --branch <branch>", "Git branch to track", "main")
    .option("--skills-dir <dir>", "Directory containing skills", "skills")
    .action(addSource);

  sources
    .command("remove <name>")
    .alias("rm")
    .description("Remove a source and its cloned directory")
    .option("-f, --force", "Skip confirmation")
    .action(removeSource);

  sources
    .command("pull")
    .description("Clone or update source repositories")
    .option("-s, --source <name>", "Pull only this source")
    .action(pullSources);

  sources
    .command("sync")
    .description("Scan sources and sync skills to templates")
    .option("-s, --source <name>", "Sync only this source")
    .option("--dry-run", "Show what would be synced without writing")
    .option("--json", "Output as JSON")
    .action(syncSources);

  return sources;
}
