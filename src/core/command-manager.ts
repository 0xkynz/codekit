import type {
  Command,
  CommandFrontmatter,
  ResourceSource,
  ValidationResult,
} from "../types";
import { ResourceManager } from "./resource-manager";
import {
  parseMarkdownWithFrontmatter,
  validateCommandFrontmatter,
} from "../utils/yaml-parser";

/**
 * Manager for command resources (slash commands)
 */
export class CommandManager extends ResourceManager<Command> {
  protected resourceType = "commands" as const;

  parseFile(content: string, filePath: string, source: ResourceSource): Command {
    const { frontmatter, content: body } = parseMarkdownWithFrontmatter<CommandFrontmatter>(content);

    return {
      frontmatter,
      content: body,
      filePath,
      source,
    };
  }

  validateResource(resource: Command): ValidationResult {
    const result = validateCommandFrontmatter(resource.frontmatter);

    return {
      valid: result.valid,
      errors: result.errors,
      warnings: [],
    };
  }

  protected getResourceName(resource: Command): string {
    // Extract command name from file path
    // e.g., "/Users/.../commands/git/commit.md" -> "git/commit"
    // e.g., "git/commit.md" -> "git/commit"
    // e.g., "validate-and-fix.md" -> "validate-and-fix"
    const path = resource.filePath.replace(/\.md$/, "");

    // Find the commands directory in the path
    const commandsIndex = path.lastIndexOf("/commands/");
    if (commandsIndex !== -1) {
      return path.slice(commandsIndex + "/commands/".length);
    }

    // Fallback: just use the filename parts
    return path.split("/").filter((p) => p && p !== "commands").pop() || path;
  }

  protected getResourcePath(resource: Command): string {
    return resource.filePath;
  }

  /**
   * Get commands grouped by category/prefix
   */
  async getByGroup(): Promise<Map<string, Command[]>> {
    const { bundled, project, global } = await this.list();
    const allCommands = [...bundled, ...project, ...global];

    const byGroup = new Map<string, Command[]>();

    for (const cmd of allCommands) {
      const name = this.getResourceName(cmd);
      const parts = name.split("/");
      const group = parts.length > 1 ? parts[0] : "root";

      const existing = byGroup.get(group) || [];
      existing.push(cmd);
      byGroup.set(group, existing);
    }

    return byGroup;
  }

  /**
   * Get the slash command syntax for a command
   */
  getSlashCommand(command: Command): string {
    const name = this.getResourceName(command);
    const hint = command.frontmatter["argument-hint"];
    return `/${name}${hint ? ` ${hint}` : ""}`;
  }
}

// Singleton instance
export const commandManager = new CommandManager();
