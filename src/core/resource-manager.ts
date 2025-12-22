import { readdir, rm, mkdir } from "fs/promises";
import { join, dirname } from "path";
import type {
  ResourceType,
  ResourceSource,
  GlobalOptions,
  ListOptions,
  AddOptions,
  RemoveOptions,
  ResourceListResult,
  ValidationResult,
  ResourceManifestEntry,
} from "../types";
import { getResourceDir, ensureDir, pathExists } from "../utils/paths";
import { templateLoader } from "./template-loader";
import { logger } from "../utils/logger";

/**
 * Abstract base class for managing resources (agents, skills, commands)
 */
export abstract class ResourceManager<T> {
  protected abstract resourceType: ResourceType;

  /**
   * Parse a file's content into a resource object
   */
  abstract parseFile(content: string, filePath: string, source: ResourceSource): T;

  /**
   * Validate a resource
   */
  abstract validateResource(resource: T): ValidationResult;

  /**
   * Get the file extension for this resource type
   */
  protected getFileExtension(): string {
    return ".md";
  }

  /**
   * List all resources from bundled templates and installed locations
   */
  async list(options: ListOptions = {}): Promise<ResourceListResult<T>> {
    const [bundled, project, global] = await Promise.all([
      this.listBundled(),
      options.global ? Promise.resolve([]) : this.listFromDir(getResourceDir(this.resourceType, { global: false }), "project"),
      this.listFromDir(getResourceDir(this.resourceType, { global: true }), "global"),
    ]);

    return { bundled, project, global };
  }

  /**
   * List resources from bundled templates
   */
  protected async listBundled(): Promise<T[]> {
    const entries = await templateLoader.listAvailableTemplates(this.resourceType);
    const resources: T[] = [];

    for (const entry of entries) {
      try {
        const content = await templateLoader.loadTemplate(this.resourceType, entry.path);
        const resource = this.parseFile(content, entry.path, "bundled");
        resources.push(resource);
      } catch (error) {
        logger.debug(`Failed to load bundled template ${entry.name}: ${error}`);
      }
    }

    return resources;
  }

  /**
   * List resources from a directory
   */
  protected async listFromDir(dir: string, source: ResourceSource): Promise<T[]> {
    const resources: T[] = [];
    const self = this;

    const scanDir = async (currentDir: string): Promise<void> => {
      try {
        const entries = await readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(currentDir, entry.name);

          if (entry.isDirectory()) {
            await scanDir(fullPath);
          } else if (entry.name.endsWith(".md")) {
            // Skip manifest files
            if (entry.name === "index.md") continue;

            try {
              const content = await Bun.file(fullPath).text();
              const resource = self.parseFile(content, fullPath, source);
              resources.push(resource);
            } catch (error) {
              logger.debug(`Failed to parse ${fullPath}: ${error}`);
            }
          }
        }
      } catch {
        // Directory doesn't exist
      }
    }

    await scanDir(dir);
    return resources;
  }

  /**
   * Add a resource from bundled templates
   */
  async add(name: string, options: AddOptions = {}): Promise<void> {
    // Find the template
    const template = await templateLoader.findTemplate(this.resourceType, name);
    if (!template) {
      const similar = await this.findSimilar(name);
      throw new Error(
        `Template "${name}" not found.${similar.length > 0 ? ` Did you mean: ${similar.join(", ")}?` : ""}`
      );
    }

    // Determine target path
    const targetDir = getResourceDir(this.resourceType, options);
    const targetPath = join(targetDir, template.path);

    // Check if already installed
    if (await pathExists(targetPath)) {
      if (!options.force) {
        throw new Error(`"${name}" is already installed at ${targetPath}`);
      }
      logger.warn(`Overwriting existing ${this.resourceType} at ${targetPath}`);
    }

    // Load template content
    const content = await templateLoader.loadTemplate(this.resourceType, template.path);

    // Validate
    const resource = this.parseFile(content, template.path, "bundled");
    const validation = this.validateResource(resource);
    if (!validation.valid) {
      throw new Error(`Invalid template: ${validation.errors.join(", ")}`);
    }

    if (options.dryRun) {
      logger.info(`Would install "${name}" to ${targetPath}`);
      return;
    }

    // Ensure directory exists
    await ensureDir(dirname(targetPath));

    // Write file
    await Bun.write(targetPath, content);

    if (!options.quiet) {
      logger.success(`Installed "${name}" to ${targetPath}`);
    }

    // Handle dependencies
    if (template.dependencies && template.dependencies.length > 0 && !options.skipDeps) {
      for (const dep of template.dependencies) {
        try {
          await this.add(dep, { ...options, quiet: true });
          if (!options.quiet) {
            logger.success(`Installed dependency "${dep}"`);
          }
        } catch {
          logger.warn(`Dependency "${dep}" could not be installed`);
        }
      }
    }
  }

  /**
   * Remove an installed resource
   */
  async remove(name: string, options: RemoveOptions = {}): Promise<void> {
    // Find the installed resource
    const { project, global } = await this.list({ ...options, global: options.global });
    const allInstalled = options.global ? global : [...project, ...global];

    const resource = allInstalled.find((r) => this.getResourceName(r) === name);
    if (!resource) {
      throw new Error(`"${name}" is not installed`);
    }

    const filePath = this.getResourcePath(resource);

    if (options.dryRun) {
      logger.info(`Would remove "${name}" from ${filePath}`);
      return;
    }

    // Remove file
    await rm(filePath, { force: true });

    // Try to remove empty parent directories
    try {
      const parentDir = dirname(filePath);
      const entries = await readdir(parentDir);
      if (entries.length === 0) {
        await rm(parentDir, { recursive: true });
      }
    } catch {
      // Ignore errors when cleaning up directories
    }

    if (!options.quiet) {
      logger.success(`Removed "${name}"`);
    }
  }

  /**
   * Check if a resource is installed
   */
  async isInstalled(name: string, options: GlobalOptions = {}): Promise<boolean> {
    const { project, global } = await this.list(options);
    const allInstalled = [...project, ...global];
    return allInstalled.some((r) => this.getResourceName(r) === name);
  }

  /**
   * Find similar resource names (for suggestions)
   */
  async findSimilar(name: string, limit = 3): Promise<string[]> {
    const templates = await templateLoader.listAvailableTemplates(this.resourceType);
    const lowerName = name.toLowerCase();

    return templates
      .map((t) => ({
        name: t.name,
        score: this.similarityScore(lowerName, t.name.toLowerCase()),
      }))
      .filter((t) => t.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((t) => t.name);
  }

  /**
   * Simple similarity score between two strings
   */
  protected similarityScore(a: string, b: string): number {
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.8;

    // Count matching characters
    const aChars = new Set(a);
    const bChars = new Set(b);
    let matches = 0;
    for (const char of aChars) {
      if (bChars.has(char)) matches++;
    }

    return matches / Math.max(aChars.size, bChars.size);
  }

  /**
   * Get the name from a resource object
   */
  protected abstract getResourceName(resource: T): string;

  /**
   * Get the file path from a resource object
   */
  protected abstract getResourcePath(resource: T): string;
}
