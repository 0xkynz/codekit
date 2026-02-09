import { readdir, rm, mkdir, cp } from "fs/promises";
import { join, relative } from "path";
import type {
  SourceConfig,
  SourcesManifest,
  SyncResult,
  ResourceManifestEntry,
  SkillFrontmatter,
} from "../types";
import { parseMarkdownWithFrontmatter } from "../utils/yaml-parser";
import { logger } from "../utils/logger";

const SOURCES_DIR = join(import.meta.dir, "../../sources");
const SOURCES_CONFIG = join(SOURCES_DIR, "sources.json");
const TEMPLATES_SKILLS_DIR = join(import.meta.dir, "../../templates/skills");
const SKILLS_INDEX_PATH = join(TEMPLATES_SKILLS_DIR, "index.json");

// Files/dirs to exclude when copying skills
const EXCLUDED_FILES = new Set([
  "AGENTS.md",
  "README.md",
  "metadata.json",
]);
const EXCLUDED_DIRS = new Set(["agents"]);
const EXCLUDED_EXTENSIONS = new Set([".zip"]);

interface ScannedSkill {
  name: string;
  description: string;
  dirPath: string;
  sourceName: string;
  tags?: string[];
  category?: string;
}

export class SourceManager {
  // Load sources.json config
  async loadConfig(): Promise<SourcesManifest> {
    try {
      const file = Bun.file(SOURCES_CONFIG);
      return await file.json();
    } catch {
      throw new Error(
        `Sources config not found at ${SOURCES_CONFIG}. Run from project root.`
      );
    }
  }

  // Save sources.json config
  async saveConfig(manifest: SourcesManifest): Promise<void> {
    await Bun.write(SOURCES_CONFIG, JSON.stringify(manifest, null, 2) + "\n");
  }

  // Add a new source to config
  async addSource(
    url: string,
    options: { name?: string; branch?: string; skillsDir?: string } = {}
  ): Promise<SourceConfig> {
    const manifest = await this.loadConfig();

    // Derive name from URL if not provided
    const name =
      options.name || url.replace(/\.git$/, "").split("/").pop() || "unknown";

    // Check for duplicates
    if (manifest.sources.find((s) => s.name === name)) {
      throw new Error(`Source "${name}" already exists`);
    }

    const source: SourceConfig = {
      name,
      url,
      branch: options.branch || "main",
      skillsDir: options.skillsDir || "skills",
      exclude: [],
      categoryMapping: {},
    };

    manifest.sources.push(source);
    await this.saveConfig(manifest);
    return source;
  }

  // Remove a source from config and optionally delete cloned dir
  async removeSource(name: string, deleteDir = false): Promise<void> {
    const manifest = await this.loadConfig();
    const idx = manifest.sources.findIndex((s) => s.name === name);
    if (idx === -1) {
      throw new Error(`Source "${name}" not found`);
    }

    manifest.sources.splice(idx, 1);
    await this.saveConfig(manifest);

    if (deleteDir) {
      const dir = join(SOURCES_DIR, name);
      try {
        await rm(dir, { recursive: true, force: true });
      } catch {
        // Already gone
      }
    }
  }

  // Git clone or pull a source repo
  async pull(source: SourceConfig): Promise<void> {
    const targetDir = join(SOURCES_DIR, source.name);

    const exists = await Bun.file(join(targetDir, ".git/HEAD"))
      .exists()
      .catch(() => false);

    if (exists) {
      // Pull
      logger.info(`Pulling ${source.name}...`);
      const proc = Bun.spawn(
        ["git", "pull", "--ff-only"],
        { cwd: targetDir, stdout: "pipe", stderr: "pipe" }
      );
      const exitCode = await proc.exited;
      if (exitCode !== 0) {
        const stderr = await new Response(proc.stderr).text();
        throw new Error(`git pull failed for ${source.name}: ${stderr}`);
      }
    } else {
      // Clone
      logger.info(`Cloning ${source.name} from ${source.url}...`);
      await mkdir(targetDir, { recursive: true });
      const args = ["git", "clone", "--depth", "1"];
      if (source.branch) {
        args.push("--branch", source.branch);
      }
      args.push(source.url, targetDir);

      const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
      const exitCode = await proc.exited;
      if (exitCode !== 0) {
        const stderr = await new Response(proc.stderr).text();
        throw new Error(`git clone failed for ${source.name}: ${stderr}`);
      }
    }

    logger.success(`${source.name} is up to date`);
  }

  // Pull all sources
  async pullAll(filterName?: string): Promise<void> {
    const manifest = await this.loadConfig();
    const sources = filterName
      ? manifest.sources.filter((s) => s.name === filterName)
      : manifest.sources;

    if (sources.length === 0) {
      throw new Error(
        filterName
          ? `Source "${filterName}" not found`
          : "No sources configured"
      );
    }

    for (const source of sources) {
      await this.pull(source);
    }
  }

  // Scan a source repo for skills
  async scanSourceSkills(source: SourceConfig): Promise<ScannedSkill[]> {
    const baseDir = join(SOURCES_DIR, source.name, source.skillsDir || "skills");
    const skills: ScannedSkill[] = [];

    await this.walkForSkills(baseDir, baseDir, source, skills);
    return skills;
  }

  // Recursively walk looking for SKILL.md files
  private async walkForSkills(
    dir: string,
    baseDir: string,
    source: SourceConfig,
    skills: ScannedSkill[]
  ): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    // Check if this dir has SKILL.md
    const hasSkillMd = entries.some(
      (e) => !e.isDirectory() && e.name === "SKILL.md"
    );

    if (hasSkillMd) {
      // Check exclude list
      const relPath = relative(baseDir, dir);
      const excluded = (source.exclude || []).some((ex) =>
        relPath.startsWith(ex)
      );

      if (excluded) {
        logger.debug(`Skipping excluded: ${relPath}`);
        return;
      }

      try {
        const skillMdPath = join(dir, "SKILL.md");
        const content = await Bun.file(skillMdPath).text();
        const { frontmatter } =
          parseMarkdownWithFrontmatter<SkillFrontmatter>(content);

        const name = frontmatter.name;
        const tags = (frontmatter as Record<string, unknown>).metadata
          ? ((frontmatter as Record<string, unknown>).metadata as Record<string, unknown>).tags
          : undefined;

        const skill: ScannedSkill = {
          name,
          description: frontmatter.description,
          dirPath: dir,
          sourceName: source.name,
          category:
            source.categoryMapping?.[name] || source.defaultCategory,
        };

        if (typeof tags === "string") {
          skill.tags = tags.split(",").map((t) => t.trim());
        } else if (Array.isArray(tags)) {
          skill.tags = tags.map(String);
        }

        skills.push(skill);
      } catch (err) {
        logger.debug(`Failed to parse SKILL.md in ${dir}: ${err}`);
      }
      return;
    }

    // No SKILL.md — recurse into subdirs
    for (const entry of entries) {
      if (entry.isDirectory()) {
        await this.walkForSkills(join(dir, entry.name), baseDir, source, skills);
      }
    }
  }

  // Copy a skill directory to templates/skills/<name>/
  private async copySkillToTemplates(
    skill: ScannedSkill
  ): Promise<void> {
    const targetDir = join(TEMPLATES_SKILLS_DIR, skill.name);

    // Remove existing
    await rm(targetDir, { recursive: true, force: true });
    await mkdir(targetDir, { recursive: true });

    // Copy files recursively, filtering out excluded items
    await this.copyFiltered(skill.dirPath, targetDir);
  }

  // Copy directory contents with filtering
  private async copyFiltered(srcDir: string, destDir: string): Promise<void> {
    const entries = await readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip excluded dirs
      if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) continue;

      // Skip excluded files
      if (!entry.isDirectory() && EXCLUDED_FILES.has(entry.name)) continue;

      // Skip excluded extensions
      if (!entry.isDirectory()) {
        const ext = entry.name.substring(entry.name.lastIndexOf("."));
        if (EXCLUDED_EXTENSIONS.has(ext)) continue;
      }

      const srcPath = join(srcDir, entry.name);
      const destPath = join(destDir, entry.name);

      if (entry.isDirectory()) {
        await mkdir(destPath, { recursive: true });
        await this.copyFiltered(srcPath, destPath);
      } else {
        await cp(srcPath, destPath);
      }
    }
  }

  // Build an index entry for a scanned skill
  private buildIndexEntry(
    skill: ScannedSkill
  ): ResourceManifestEntry {
    const displayName = skill.name
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const entry: ResourceManifestEntry = {
      name: skill.name,
      path: skill.name,
      displayName,
      category: skill.category,
      description: skill.description,
      dependencies: [],
      tags: skill.tags,
      source: skill.sourceName,
    };

    return entry;
  }

  // Update templates/skills/index.json preserving manual entries
  private async updateIndexJson(
    scannedSkills: ScannedSkill[]
  ): Promise<void> {
    // Load current index
    let currentIndex: { version: string; resources: ResourceManifestEntry[] };
    try {
      currentIndex = await Bun.file(SKILLS_INDEX_PATH).json();
    } catch {
      currentIndex = { version: "1.0.0", resources: [] };
    }

    // Build new source entries from scanned skills
    const sourceEntries = scannedSkills.map((s) => this.buildIndexEntry(s));
    const sourceNames = new Set(sourceEntries.map((e) => e.name));

    // Separate manual vs source-synced entries, excluding manual entries
    // that are now covered by source-synced entries
    const manualEntries = currentIndex.resources.filter(
      (e) => !e.source && !sourceNames.has(e.name)
    );

    // Merge: manual first, then source-synced
    const merged = [...manualEntries, ...sourceEntries];

    const newIndex = {
      version: currentIndex.version,
      resources: merged,
    };

    await Bun.write(SKILLS_INDEX_PATH, JSON.stringify(newIndex, null, 2) + "\n");
  }

  // Full sync: scan all sources, copy skills, update index
  async syncAll(options: {
    filterName?: string;
    dryRun?: boolean;
  } = {}): Promise<SyncResult> {
    const manifest = await this.loadConfig();
    const sources = options.filterName
      ? manifest.sources.filter((s) => s.name === options.filterName)
      : manifest.sources;

    if (sources.length === 0) {
      throw new Error(
        options.filterName
          ? `Source "${options.filterName}" not found`
          : "No sources configured"
      );
    }

    const result: SyncResult = {
      added: [],
      updated: [],
      skipped: [],
      total: 0,
    };

    // Scan all sources for skills
    const allSkills: ScannedSkill[] = [];
    for (const source of sources) {
      const sourceDir = join(SOURCES_DIR, source.name);
      const exists = await Bun.file(join(sourceDir, ".git/HEAD"))
        .exists()
        .catch(() => false);

      if (!exists) {
        logger.warn(
          `Source "${source.name}" not cloned yet. Run 'codekit sources pull' first.`
        );
        continue;
      }

      const skills = await this.scanSourceSkills(source);
      allSkills.push(...skills);
      logger.debug(`Found ${skills.length} skills in ${source.name}`);
    }

    result.total = allSkills.length;

    if (options.dryRun) {
      for (const skill of allSkills) {
        const targetDir = join(TEMPLATES_SKILLS_DIR, skill.name);
        const exists = await Bun.file(join(targetDir, "SKILL.md"))
          .exists()
          .catch(() => false);

        if (exists) {
          result.updated.push(skill.name);
        } else {
          result.added.push(skill.name);
        }
      }
      return result;
    }

    // Copy each skill
    for (const skill of allSkills) {
      const targetDir = join(TEMPLATES_SKILLS_DIR, skill.name);
      const exists = await Bun.file(join(targetDir, "SKILL.md"))
        .exists()
        .catch(() => false);

      await this.copySkillToTemplates(skill);

      if (exists) {
        result.updated.push(skill.name);
      } else {
        result.added.push(skill.name);
      }
    }

    // Update index.json
    await this.updateIndexJson(allSkills);

    return result;
  }

  // List all sources and their scanned skills
  async listSources(): Promise<
    { source: SourceConfig; skills: ScannedSkill[]; cloned: boolean }[]
  > {
    const manifest = await this.loadConfig();
    const results = [];

    for (const source of manifest.sources) {
      const sourceDir = join(SOURCES_DIR, source.name);
      const cloned = await Bun.file(join(sourceDir, ".git/HEAD"))
        .exists()
        .catch(() => false);

      let skills: ScannedSkill[] = [];
      if (cloned) {
        skills = await this.scanSourceSkills(source);
      }

      results.push({ source, skills, cloned });
    }

    return results;
  }
}

// Singleton
export const sourceManager = new SourceManager();
