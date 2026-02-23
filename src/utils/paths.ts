import { homedir } from "os";
import { join, dirname, basename, relative } from "path";
import type { ResourceType, GlobalOptions } from "../types";

/**
 * Get the .claude directory path based on scope
 */
export function getClaudeDir(options: Pick<GlobalOptions, "global">): string {
  if (options.global) {
    return join(homedir(), ".claude");
  }
  return join(process.cwd(), ".claude");
}

/**
 * Get the directory for a specific resource type
 */
export function getResourceDir(
  resourceType: ResourceType,
  options: Pick<GlobalOptions, "global">
): string {
  return join(getClaudeDir(options), resourceType);
}

/**
 * Get the path for a specific resource file
 */
export function getResourcePath(
  resourceType: ResourceType,
  name: string,
  options: Pick<GlobalOptions, "global">
): string {
  const resourceDir = getResourceDir(resourceType, options);

  // Handle nested paths (e.g., "database/postgres-expert" or "git/commit")
  if (name.includes("/")) {
    return join(resourceDir, `${name}.md`);
  }

  // Single file at root level
  return join(resourceDir, `${name}.md`);
}

/**
 * Get the Gemini Antigravity directory path based on scope
 * Project: .agent/  Global: ~/.gemini/antigravity/
 */
export function getGeminiDir(options: Pick<GlobalOptions, "global">): string {
  if (options.global) {
    return join(homedir(), ".gemini", "antigravity");
  }
  return join(process.cwd(), ".agent");
}

/**
 * Get the Gemini directory for a specific resource type
 */
export function getGeminiResourceDir(
  resourceType: ResourceType,
  options: Pick<GlobalOptions, "global">
): string {
  return join(getGeminiDir(options), resourceType);
}

/**
 * Get the templates directory (for development)
 */
export function getTemplatesDir(): string {
  // In development, templates are relative to the source
  return join(dirname(import.meta.dir), "..", "templates");
}

/**
 * Extract resource name from file path
 */
export function extractResourceName(filePath: string, baseDir: string): string {
  const relativePath = filePath.replace(baseDir, "").replace(/^\//, "");
  // Remove .md extension and return
  return relativePath.replace(/\.md$/, "");
}

/**
 * Create a symlink using a relative path (for portability)
 */
export async function createSymlink(targetPath: string, linkPath: string): Promise<void> {
  const { symlink } = await import("fs/promises");
  const linkDir = dirname(linkPath);
  const relativeTarget = relative(linkDir, targetPath);
  await symlink(relativeTarget, linkPath);
}

/**
 * Check if a path exists (file or directory)
 */
export async function pathExists(path: string): Promise<boolean> {
  const { stat } = await import("fs/promises");
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  const { mkdir } = await import("fs/promises");
  await mkdir(dirPath, { recursive: true });
}

/**
 * Get the directory containing a file
 */
export function getParentDir(filePath: string): string {
  return dirname(filePath);
}

/**
 * Get just the filename from a path
 */
export function getFileName(filePath: string): string {
  return basename(filePath);
}
