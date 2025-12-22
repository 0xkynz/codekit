import { Command } from "commander";
import { listSkills } from "./list";
import { addSkill } from "./add";
import { removeSkill } from "./remove";

export function createSkillsCommand(): Command {
  const skills = new Command("skills")
    .description("Manage skill definitions")
    .alias("skill");

  skills
    .command("list")
    .alias("ls")
    .description("List available and installed skills")
    .option("-g, --global", "List from global ~/.claude directory")
    .option("-i, --installed", "Show only installed skills")
    .option("-a, --available", "Show only available (not installed) skills")
    .option("--json", "Output as JSON")
    .action(listSkills);

  skills
    .command("add <name>")
    .alias("install")
    .description("Add a skill from bundled templates")
    .option("-g, --global", "Install to global ~/.claude directory")
    .option("-f, --force", "Overwrite if already installed")
    .option("--dry-run", "Show what would be installed without writing")
    .action(addSkill);

  skills
    .command("remove <name>")
    .alias("rm")
    .alias("uninstall")
    .description("Remove an installed skill")
    .option("-g, --global", "Remove from global ~/.claude directory")
    .option("-f, --force", "Skip confirmation")
    .option("--dry-run", "Show what would be removed without deleting")
    .action(removeSkill);

  return skills;
}
