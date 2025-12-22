import type { ListOptions, Command as CmdType } from "../../types";
import { commandManager } from "../../core/command-manager";
import { logger, style, outputJson } from "../../utils/logger";

interface CommandListOptions extends ListOptions {
  installed?: boolean;
  available?: boolean;
}

export async function listCommands(options: CommandListOptions): Promise<void> {
  try {
    const result = await commandManager.list(options);

    // Combine all commands for deduplication
    const installedNames = new Set([
      ...result.project.map((c) => commandManager["getResourceName"](c)),
      ...result.global.map((c) => commandManager["getResourceName"](c)),
    ]);

    let bundled = result.bundled;
    let project = result.project;
    let global = result.global;

    // Filter by installed/available status
    if (options.installed) {
      bundled = [];
    }
    if (options.available) {
      bundled = bundled.filter(
        (c) => !installedNames.has(commandManager["getResourceName"](c))
      );
      project = [];
      global = [];
    }

    // JSON output
    if (options.json) {
      outputJson({ bundled, project, global });
      return;
    }

    // Human-readable output
    const hasAny = bundled.length > 0 || project.length > 0 || global.length > 0;

    if (!hasAny) {
      logger.info("No commands found");
      return;
    }

    // Group by prefix
    const groupByPrefix = (cmds: CmdType[]): Map<string, CmdType[]> => {
      const groups = new Map<string, CmdType[]>();
      for (const cmd of cmds) {
        const name = commandManager["getResourceName"](cmd);
        const parts = name.split("/");
        const group = parts.length > 1 ? parts[0] : "root";
        const existing = groups.get(group) || [];
        existing.push(cmd);
        groups.set(group, existing);
      }
      return groups;
    };

    if (bundled.length > 0) {
      logger.section("📦 Bundled Commands");

      const groups = groupByPrefix(bundled);
      for (const [group, cmds] of Array.from(groups).sort()) {
        if (group !== "root") {
          logger.log(`\n  ${style.bold(group + "/")}`);
        }

        for (const cmd of cmds) {
          const name = commandManager["getResourceName"](cmd);
          const installed = installedNames.has(name);
          const status = installed ? style.installed : style.notInstalled;
          const slashCmd = style.command(`/${name}`);
          const desc = style.dim(` - ${cmd.frontmatter.description.slice(0, 50)}...`);
          const indent = group !== "root" ? "    " : "  ";
          logger.log(`${indent}${status} ${slashCmd}${desc}`);
        }
      }
    }

    if (project.length > 0) {
      logger.section("📁 Project Commands (.claude/commands/)");
      for (const cmd of project) {
        const name = commandManager["getResourceName"](cmd);
        const slashCmd = style.command(`/${name}`);
        const hint = cmd.frontmatter["argument-hint"]
          ? style.dim(` ${cmd.frontmatter["argument-hint"]}`)
          : "";
        logger.log(`  ${style.installed} ${slashCmd}${hint}`);
      }
    }

    if (global.length > 0) {
      logger.section("🌐 Global Commands (~/.claude/commands/)");
      for (const cmd of global) {
        const name = commandManager["getResourceName"](cmd);
        const slashCmd = style.command(`/${name}`);
        const hint = cmd.frontmatter["argument-hint"]
          ? style.dim(` ${cmd.frontmatter["argument-hint"]}`)
          : "";
        logger.log(`  ${style.installed} ${slashCmd}${hint}`);
      }
    }

    logger.newline();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to list commands");
    process.exit(1);
  }
}
