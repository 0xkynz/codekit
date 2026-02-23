import { readdir, rm, mkdir, cp } from "fs/promises";
import { join, dirname } from "path";
import type {
  Skill,
  SkillFrontmatter,
  ResourceSource,
  ValidationResult,
  AddOptions,
  RemoveOptions,
  GlobalOptions,
} from "../types";
import { ResourceManager } from "./resource-manager";
import {
  parseMarkdownWithFrontmatter,
  validateSkillFrontmatter,
} from "../utils/yaml-parser";
import { getResourceDir, getGeminiResourceDir, ensureDir, pathExists, createSymlink } from "../utils/paths";
import { templateLoader } from "./template-loader";
import { logger } from "../utils/logger";

/**
 * Manager for skill resources
 * Skills are directories containing SKILL.md and optionally other files
 */
export class SkillManager extends ResourceManager<Skill> {
  protected resourceType = "skills" as const;

  parseFile(content: string, filePath: string, source: ResourceSource): Skill {
    const { frontmatter, content: body } = parseMarkdownWithFrontmatter<SkillFrontmatter>(content);

    // Extract directory from file path
    const directory = filePath.endsWith("SKILL.md")
      ? dirname(filePath)
      : filePath.replace(/\.md$/, "");

    return {
      frontmatter,
      content: body,
      directory,
      files: [], // Will be populated when scanning
      source,
    };
  }

  validateResource(resource: Skill): ValidationResult {
    const result = validateSkillFrontmatter(resource.frontmatter);

    return {
      valid: result.valid,
      errors: result.errors,
      warnings: [],
    };
  }

  protected getResourceName(resource: Skill): string {
    return resource.frontmatter.name;
  }

  protected getResourcePath(resource: Skill): string {
    return resource.directory;
  }

  /**
   * Override listBundled to handle skill directory structure
   * Skills are stored as skill-name/SKILL.md in the VFS
   */
  protected async listBundled(): Promise<Skill[]> {
    const entries = await templateLoader.listAvailableTemplates(this.resourceType);
    const skills: Skill[] = [];

    for (const entry of entries) {
      try {
        // Skills use path/SKILL.md structure
        const content = await templateLoader.loadTemplate(
          this.resourceType,
          `${entry.path}/SKILL.md`
        );
        const skill = this.parseFile(content, `${entry.path}/SKILL.md`, "bundled");
        skills.push(skill);
      } catch (error) {
        logger.debug(`Failed to load bundled skill ${entry.name}: ${error}`);
      }
    }

    return skills;
  }

  /**
   * Override list to handle skill directory structure
   */
  protected async listFromDir(dir: string, source: ResourceSource): Promise<Skill[]> {
    const skills: Skill[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;

        const skillDir = join(dir, entry.name);
        const skillFile = join(skillDir, "SKILL.md");

        try {
          const content = await Bun.file(skillFile).text();
          const skill = this.parseFile(content, skillFile, source);

          // Scan for additional files
          const files = await this.scanSkillFiles(skillDir);
          skill.files = files;

          skills.push(skill);
        } catch {
          logger.debug(`Skipping ${skillDir}: no valid SKILL.md found`);
        }
      }
    } catch {
      // Directory doesn't exist
    }

    return skills;
  }

  /**
   * Scan a skill directory for all files
   */
  private async scanSkillFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    async function scan(currentDir: string, prefix = ""): Promise<void> {
      try {
        const entries = await readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

          if (entry.isDirectory()) {
            await scan(join(currentDir, entry.name), relativePath);
          } else {
            files.push(relativePath);
          }
        }
      } catch {
        // Ignore errors
      }
    }

    await scan(dir);
    return files.filter((f) => f !== "SKILL.md");
  }

  /**
   * Override add to handle skill directory structure
   */
  async add(name: string, options: AddOptions = {}): Promise<void> {
    // Find the template
    const template = await templateLoader.findTemplate(this.resourceType, name);
    if (!template) {
      const similar = await this.findSimilar(name);
      throw new Error(
        `Skill "${name}" not found.${similar.length > 0 ? ` Did you mean: ${similar.join(", ")}?` : ""}`
      );
    }

    // Determine target directory
    const targetDir = getResourceDir(this.resourceType, options);
    const skillDir = join(targetDir, name);

    // Check if already installed
    if (await pathExists(skillDir)) {
      if (!options.force) {
        throw new Error(`Skill "${name}" is already installed at ${skillDir}`);
      }
      logger.warn(`Overwriting existing skill at ${skillDir}`);
      await rm(skillDir, { recursive: true, force: true });
    }

    if (options.dryRun) {
      const geminiSkillDir = join(getGeminiResourceDir(this.resourceType, options), name);
      logger.info(`Would install skill "${name}" to ${skillDir}`);
      logger.info(`Would mirror skill "${name}" to ${geminiSkillDir}`);
      return;
    }

    // Try symlink-first: link entire skill directory from templates
    let installed = false;
    const templatePath = templateLoader.getTemplatePath(this.resourceType, name);
    if (templatePath) {
      try {
        await ensureDir(targetDir);
        await createSymlink(templatePath, skillDir);
        installed = true;
      } catch {
        // Symlink failed, fall through to copy
        logger.debug(`Symlink failed for skill "${name}", falling back to copy`);
      }
    }

    if (!installed) {
      // Fallback: copy files individually (compiled mode or symlink failure)
      await ensureDir(skillDir);

      // Load and write SKILL.md
      const mainContent = await templateLoader.loadTemplate(
        this.resourceType,
        `${name}/SKILL.md`
      );
      await Bun.write(join(skillDir, "SKILL.md"), mainContent);

      // Copy additional bundled files (references, etc.)
      const additionalFiles = templateLoader.listTemplateFiles(this.resourceType, name);
      for (const relPath of additionalFiles) {
        const content = await templateLoader.loadTemplate(
          this.resourceType,
          `${name}/${relPath}`
        );
        const targetFilePath = join(skillDir, relPath);
        await ensureDir(dirname(targetFilePath));
        await Bun.write(targetFilePath, content);
      }
    }

    if (!options.quiet) {
      logger.success(`Installed skill "${name}" to ${skillDir}`);
    }

    // Mirror to Gemini Antigravity directory (best-effort)
    await this.mirrorToGemini(name, options);
  }

  /**
   * Override remove to handle skill directory structure
   */
  async remove(name: string, options: RemoveOptions = {}): Promise<void> {
    const targetDir = getResourceDir(this.resourceType, options);
    const skillDir = join(targetDir, name);

    if (!(await pathExists(skillDir))) {
      throw new Error(`Skill "${name}" is not installed`);
    }

    if (options.dryRun) {
      const geminiSkillDir = join(getGeminiResourceDir(this.resourceType, options), name);
      logger.info(`Would remove skill "${name}" from ${skillDir}`);
      logger.info(`Would remove Gemini mirror from ${geminiSkillDir}`);
      return;
    }

    await rm(skillDir, { recursive: true, force: true });

    // Remove from Gemini directory (best-effort)
    await this.removeFromGemini(name, options);

    if (!options.quiet) {
      logger.success(`Removed skill "${name}"`);
    }
  }

  /**
   * Mirror a skill installation to the Gemini Antigravity directory (best-effort)
   */
  private async mirrorToGemini(name: string, options: AddOptions): Promise<void> {
    try {
      const geminiDir = getGeminiResourceDir(this.resourceType, options);
      const geminiSkillDir = join(geminiDir, name);

      if (await pathExists(geminiSkillDir)) {
        if (!options.force) return;
        await rm(geminiSkillDir, { recursive: true, force: true });
      }

      // Try symlink-first, same as Claude install
      const templatePath = templateLoader.getTemplatePath(this.resourceType, name);
      if (templatePath) {
        try {
          await ensureDir(geminiDir);
          await createSymlink(templatePath, geminiSkillDir);
          logger.debug(`Mirrored skill "${name}" to ${geminiSkillDir}`);
          return;
        } catch {
          logger.debug(`Symlink failed for Gemini mirror of "${name}", falling back to copy`);
        }
      }

      // Fallback: copy files
      await ensureDir(geminiSkillDir);

      const mainContent = await templateLoader.loadTemplate(
        this.resourceType,
        `${name}/SKILL.md`
      );
      await Bun.write(join(geminiSkillDir, "SKILL.md"), mainContent);

      const additionalFiles = templateLoader.listTemplateFiles(this.resourceType, name);
      for (const relPath of additionalFiles) {
        const content = await templateLoader.loadTemplate(
          this.resourceType,
          `${name}/${relPath}`
        );
        const targetFilePath = join(geminiSkillDir, relPath);
        await ensureDir(dirname(targetFilePath));
        await Bun.write(targetFilePath, content);
      }

      logger.debug(`Mirrored skill "${name}" to ${geminiSkillDir}`);
    } catch (error) {
      logger.warn(`Failed to mirror skill "${name}" to Gemini directory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Remove a skill from the Gemini Antigravity directory (best-effort)
   */
  private async removeFromGemini(name: string, options: RemoveOptions): Promise<void> {
    try {
      const geminiDir = getGeminiResourceDir(this.resourceType, options);
      const geminiSkillDir = join(geminiDir, name);

      if (await pathExists(geminiSkillDir)) {
        await rm(geminiSkillDir, { recursive: true, force: true });
        logger.debug(`Removed Gemini mirror of skill "${name}"`);
      }
    } catch {
      // Silently ignore — Gemini dir may have been manually removed
    }
  }

  /**
   * Check if a skill is installed
   */
  async isInstalled(name: string, options: GlobalOptions = {}): Promise<boolean> {
    const targetDir = getResourceDir(this.resourceType, options);
    const skillDir = join(targetDir, name);
    return pathExists(skillDir);
  }
}

// Singleton instance
export const skillManager = new SkillManager();
