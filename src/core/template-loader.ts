import { join, dirname } from "path";
import { readdir } from "fs/promises";
import type { ResourceType, ResourceManifest, ResourceManifestEntry } from "../types";
import { logger } from "../utils/logger";

// Import generated VFS (will be available after build:vfs runs)
import * as generatedVfs from "../templates.generated";

// Will be generated at build time - for now we'll use filesystem
let embeddedTemplates: Map<string, string> | null = null;
let embeddedManifests: Map<string, ResourceManifest> | null = null;

/**
 * Check if we're running from a compiled binary
 */
function isCompiled(): boolean {
  // In compiled mode, Bun embeds the executable differently
  // We check if we're running from a typical development path
  return !import.meta.dir.includes("src");
}

/**
 * Get the templates directory path
 */
function getTemplatesBasePath(): string {
  if (isCompiled()) {
    // In compiled binary, templates would be embedded
    // This is a fallback that shouldn't normally be reached
    throw new Error("Templates not embedded in binary");
  }

  // Development mode: templates are at project root level
  // import.meta.dir is src/core, so we go up two levels to project root
  return join(dirname(dirname(import.meta.dir)), "templates");
}

/**
 * Template loader for bundled and local templates
 */
export class TemplateLoader {
  private basePath: string;
  private compiled: boolean;

  constructor() {
    this.compiled = isCompiled();
    this.basePath = this.compiled ? "" : getTemplatesBasePath();
  }

  /**
   * Load a template file by path
   */
  async loadTemplate(
    resourceType: ResourceType,
    templatePath: string
  ): Promise<string> {
    const key = `${resourceType}/${templatePath}`;

    // Try generated VFS first (works in both dev and compiled mode)
    if (generatedVfs.has(key)) {
      return generatedVfs.get(key);
    }

    if (this.compiled && embeddedTemplates) {
      const content = embeddedTemplates.get(key);
      if (!content) {
        throw new Error(`Template not found: ${key}`);
      }
      return content;
    }

    // Development fallback: read from filesystem
    const fullPath = join(this.basePath, resourceType, templatePath);
    try {
      return await Bun.file(fullPath).text();
    } catch {
      throw new Error(`Template not found: ${fullPath}`);
    }
  }

  /**
   * Check if a template exists
   */
  async hasTemplate(
    resourceType: ResourceType,
    templatePath: string
  ): Promise<boolean> {
    const key = `${resourceType}/${templatePath}`;

    // Check generated VFS first
    if (generatedVfs.has(key)) {
      return true;
    }

    if (this.compiled && embeddedTemplates) {
      return embeddedTemplates.has(key);
    }

    const fullPath = join(this.basePath, resourceType, templatePath);
    return await Bun.file(fullPath).exists();
  }

  /**
   * Load the manifest for a resource type
   */
  async loadManifest(resourceType: ResourceType): Promise<ResourceManifest> {
    // Try generated VFS first (works in both dev and compiled mode)
    const vfsManifest = generatedVfs.getManifest(resourceType) as ResourceManifest | undefined;
    if (vfsManifest && vfsManifest.resources && vfsManifest.resources.length > 0) {
      return vfsManifest;
    }

    if (this.compiled && embeddedManifests) {
      const manifest = embeddedManifests.get(resourceType);
      if (!manifest) {
        return { version: "1.0.0", resources: [] };
      }
      return manifest;
    }

    // Development fallback: read from filesystem
    const manifestPath = join(this.basePath, resourceType, "index.json");
    try {
      const content = await Bun.file(manifestPath).text();
      return JSON.parse(content) as ResourceManifest;
    } catch {
      logger.debug(`No manifest found at ${manifestPath}`);
      return { version: "1.0.0", resources: [] };
    }
  }

  /**
   * Get the filesystem path for a template (returns null when compiled)
   */
  getTemplatePath(resourceType: ResourceType, templatePath: string): string | null {
    if (this.compiled) return null;
    return join(this.basePath, resourceType, templatePath);
  }

  /**
   * List all available templates for a resource type
   */
  async listAvailableTemplates(
    resourceType: ResourceType
  ): Promise<ResourceManifestEntry[]> {
    const manifest = await this.loadManifest(resourceType);
    return manifest.resources;
  }

  /**
   * Find a template by name
   */
  async findTemplate(
    resourceType: ResourceType,
    name: string
  ): Promise<ResourceManifestEntry | null> {
    const manifest = await this.loadManifest(resourceType);
    return manifest.resources.find((r) => r.name === name) || null;
  }

  /**
   * Find templates that match a search query
   */
  async searchTemplates(
    resourceType: ResourceType,
    query: string
  ): Promise<ResourceManifestEntry[]> {
    const manifest = await this.loadManifest(resourceType);
    const lowerQuery = query.toLowerCase();

    return manifest.resources.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.description.toLowerCase().includes(lowerQuery) ||
        r.displayName?.toLowerCase().includes(lowerQuery) ||
        r.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * List templates by category
   */
  async listByCategory(
    resourceType: ResourceType,
    category: string
  ): Promise<ResourceManifestEntry[]> {
    const manifest = await this.loadManifest(resourceType);
    return manifest.resources.filter((r) => r.category === category);
  }

  /**
   * Get all unique categories for a resource type
   */
  async getCategories(resourceType: ResourceType): Promise<string[]> {
    const manifest = await this.loadManifest(resourceType);
    const categories = new Set<string>();

    for (const resource of manifest.resources) {
      if (resource.category) {
        categories.add(resource.category);
      }
    }

    return Array.from(categories).sort();
  }

  /**
   * List all VFS files under a skill directory (e.g., "skills/github/")
   * Returns relative paths within the skill directory
   */
  listTemplateFiles(resourceType: ResourceType, skillName: string): string[] {
    const prefix = `${resourceType}/${skillName}/`;
    const allKeys = generatedVfs.list();
    return allKeys
      .filter((key) => key.startsWith(prefix) && key !== `${prefix}SKILL.md`)
      .map((key) => key.slice(prefix.length));
  }

  /**
   * Scan filesystem for templates (development mode only)
   * This is used to generate the manifest
   */
  async scanTemplates(resourceType: ResourceType): Promise<string[]> {
    if (this.compiled) {
      throw new Error("Cannot scan templates in compiled mode");
    }

    const dir = join(this.basePath, resourceType);
    const files: string[] = [];

    async function scan(currentDir: string, prefix = ""): Promise<void> {
      try {
        const entries = await readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

          if (entry.isDirectory()) {
            await scan(join(currentDir, entry.name), relativePath);
          } else if (entry.name.endsWith(".md") && entry.name !== "index.md") {
            files.push(relativePath);
          }
        }
      } catch {
        // Directory doesn't exist, return empty
      }
    }

    await scan(dir);
    return files;
  }
}

// Singleton instance
export const templateLoader = new TemplateLoader();

/**
 * Initialize embedded templates (called from generated code in production)
 */
export function initializeEmbeddedTemplates(
  templates: Map<string, string>,
  manifests: Map<string, ResourceManifest>
): void {
  embeddedTemplates = templates;
  embeddedManifests = manifests;
}
