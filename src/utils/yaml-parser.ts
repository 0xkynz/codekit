import { parse as parseYaml } from "yaml";

export interface ParsedMarkdown<T> {
  frontmatter: T;
  content: string;
}

/**
 * Parse YAML frontmatter from a markdown string
 * Expects format:
 * ---
 * key: value
 * ---
 * Content here
 */
export function parseMarkdownWithFrontmatter<T>(
  markdown: string
): ParsedMarkdown<T> {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    throw new Error("Invalid markdown: missing YAML frontmatter");
  }

  const [, yamlContent, content] = match;

  try {
    const frontmatter = parseYaml(yamlContent) as T;
    return {
      frontmatter,
      content: content.trim(),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse YAML frontmatter: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Serialize frontmatter and content back to markdown
 */
export function serializeMarkdownWithFrontmatter<T extends Record<string, unknown>>(
  frontmatter: T,
  content: string
): string {
  const { stringify } = require("yaml");
  const yamlContent = stringify(frontmatter).trim();
  return `---\n${yamlContent}\n---\n\n${content}`;
}

/**
 * Validate command frontmatter
 */
export function validateCommandFrontmatter(
  frontmatter: { description?: unknown; [key: string]: unknown }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!frontmatter.description || typeof frontmatter.description !== "string") {
    errors.push("Missing required field: description");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate skill frontmatter (stricter requirements per agent-skills-overview.md)
 */
export function validateSkillFrontmatter(
  frontmatter: { name?: unknown; description?: unknown; [key: string]: unknown }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!frontmatter.name || typeof frontmatter.name !== "string") {
    errors.push("Missing required field: name");
  } else {
    const name = frontmatter.name as string;
    if (name.length > 64) {
      errors.push("name must be 64 characters or less");
    }
    if (!/^[a-z0-9-]+$/.test(name)) {
      errors.push("name must contain only lowercase letters, numbers, and hyphens");
    }
    if (name.includes("anthropic") || name.includes("claude")) {
      errors.push("name cannot contain reserved words: 'anthropic', 'claude'");
    }
  }

  if (!frontmatter.description || typeof frontmatter.description !== "string") {
    errors.push("Missing required field: description");
  } else {
    const description = frontmatter.description as string;
    if (description.length > 1024) {
      errors.push("description must be 1024 characters or less");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
