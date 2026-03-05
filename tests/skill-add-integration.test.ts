import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { rm, readdir, mkdir } from "fs/promises";
import { join } from "path";
import { skillManager } from "../src/core/skill-manager";
import { buildSkillGraph } from "../src/utils/skill-graph";
import { getInstalledSkillsInfo } from "../src/utils/installed-skills";
import { pathExists } from "../src/utils/paths";

/**
 * Integration tests for skill add, related skills, and installed skills.
 * Uses a temp directory to avoid polluting the real .claude/skills.
 */

const TEST_DIR = join(import.meta.dir, ".tmp-skills");

// Override target by using the global option pointing to our temp dir
// Skills get installed to <dir>/.claude/skills/ — we simulate by setting cwd
const originalCwd = process.cwd();

describe("skills add — integration", () => {
  beforeEach(async () => {
    // Clean temp dir before each test
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(join(TEST_DIR, ".claude", "skills"), { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("installs a skill with SKILL.md", async () => {
    // Use skillManager.add which resolves from template loader
    process.chdir(TEST_DIR);
    try {
      await skillManager.add("typescript-expert", { quiet: true });

      const skillDir = join(TEST_DIR, ".claude", "skills", "typescript-expert");
      expect(await pathExists(skillDir)).toBe(true);

      const skillMd = join(skillDir, "SKILL.md");
      expect(await pathExists(skillMd)).toBe(true);

      const content = await Bun.file(skillMd).text();
      expect(content).toContain("name: typescript-expert");
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("installs a skill with reference files", async () => {
    process.chdir(TEST_DIR);
    try {
      await skillManager.add("domain-driven-hexagon", { quiet: true });

      const skillDir = join(TEST_DIR, ".claude", "skills", "domain-driven-hexagon");
      expect(await pathExists(skillDir)).toBe(true);

      // Should have references directory
      const refsDir = join(skillDir, "references");
      const hasRefs = await pathExists(refsDir);

      if (hasRefs) {
        const refFiles = await readdir(refsDir);
        expect(refFiles).toContain("building-blocks.md");
        expect(refFiles).toContain("patterns-catalog.md");
      } else {
        // Symlink mode — follow the link and check
        const entries = await readdir(skillDir);
        expect(entries).toContain("SKILL.md");
        expect(entries).toContain("references");
      }
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("installs clean-architecture-ddd with reference files", async () => {
    process.chdir(TEST_DIR);
    try {
      await skillManager.add("clean-architecture-ddd", { quiet: true });

      const skillDir = join(TEST_DIR, ".claude", "skills", "clean-architecture-ddd");
      expect(await pathExists(skillDir)).toBe(true);

      const content = await Bun.file(join(skillDir, "SKILL.md")).text();
      expect(content).toContain("name: clean-architecture-ddd");
      expect(content).toContain("Dependency Rule");
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("throws when skill already installed without --force", async () => {
    process.chdir(TEST_DIR);
    try {
      await skillManager.add("typescript-expert", { quiet: true });

      expect(
        skillManager.add("typescript-expert", { quiet: true })
      ).rejects.toThrow("already installed");
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("overwrites with --force flag", async () => {
    process.chdir(TEST_DIR);
    try {
      await skillManager.add("typescript-expert", { quiet: true });
      // Should not throw
      await skillManager.add("typescript-expert", { quiet: true, force: true });

      const skillDir = join(TEST_DIR, ".claude", "skills", "typescript-expert");
      expect(await pathExists(skillDir)).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("throws for nonexistent skill", async () => {
    process.chdir(TEST_DIR);
    try {
      expect(
        skillManager.add("nonexistent-skill-xyz", { quiet: true })
      ).rejects.toThrow("not found");
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("reports isInstalled correctly", async () => {
    process.chdir(TEST_DIR);
    try {
      expect(await skillManager.isInstalled("typescript-expert")).toBe(false);
      await skillManager.add("typescript-expert", { quiet: true });
      expect(await skillManager.isInstalled("typescript-expert")).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("removes an installed skill", async () => {
    process.chdir(TEST_DIR);
    try {
      await skillManager.add("typescript-expert", { quiet: true });
      expect(await skillManager.isInstalled("typescript-expert")).toBe(true);

      await skillManager.remove("typescript-expert", { quiet: true });
      expect(await skillManager.isInstalled("typescript-expert")).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });
});

describe("skills related — integration with real manifest", () => {
  it("buildSkillGraph loads the real manifest", async () => {
    const graph = await buildSkillGraph();

    // Should have entries for known skills
    expect(graph.getEntry("typescript-expert")).toBeDefined();
    expect(graph.getEntry("react")).toBeDefined();
    expect(graph.getEntry("domain-driven-hexagon")).toBeDefined();
    expect(graph.getEntry("clean-architecture-ddd")).toBeDefined();
  });

  it("shows related skills after adding domain-driven-hexagon", async () => {
    const graph = await buildSkillGraph();
    const related = graph.getRelated("domain-driven-hexagon");

    expect(related.length).toBeGreaterThan(0);

    const targetNames = related.map((e) => e.target);
    expect(targetNames).toContain("clean-architecture-ddd");
    expect(targetNames).toContain("typescript-expert");
    expect(targetNames).toContain("testing-expert");
  });

  it("shows related skills after adding clean-architecture-ddd", async () => {
    const graph = await buildSkillGraph();
    const related = graph.getRelated("clean-architecture-ddd");

    expect(related.length).toBeGreaterThan(0);

    const targetNames = related.map((e) => e.target);
    expect(targetNames).toContain("domain-driven-hexagon");
    expect(targetNames).toContain("elysiajs-ddd");
  });

  it("relationship types are preserved correctly", async () => {
    const graph = await buildSkillGraph();

    // elysiajs-ddd and elysiajs-ddd-mongoose are alternatives
    const elysiaRelated = graph.getRelated("elysiajs-ddd");
    const mongooseEdge = elysiaRelated.find(
      (e) => e.target === "elysiajs-ddd-mongoose"
    );
    expect(mongooseEdge).toBeDefined();
    expect(mongooseEdge!.relationship).toBe("alternative");

    // domain-driven-hexagon and clean-architecture-ddd are complementary
    const ddhRelated = graph.getRelated("domain-driven-hexagon");
    const cadEdge = ddhRelated.find(
      (e) => e.target === "clean-architecture-ddd"
    );
    expect(cadEdge).toBeDefined();
    expect(cadEdge!.relationship).toBe("complementary");
  });

  it("can traverse from one DDD skill to find all related architecture skills", async () => {
    const graph = await buildSkillGraph();

    // Starting from domain-driven-hexagon, collect all reachable skills (1 hop)
    const related = graph.getRelated("domain-driven-hexagon");
    const reachable = new Set(related.map((e) => e.target));

    // Should reach the core architecture ecosystem
    expect(reachable.has("clean-architecture-ddd")).toBe(true);
    expect(reachable.has("elysiajs-ddd")).toBe(true);
    expect(reachable.has("elysiajs-ddd-mongoose")).toBe(true);
    expect(reachable.has("database-expert")).toBe(true);
  });
});

describe("getInstalledSkillsInfo — integration", () => {
  beforeEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(join(TEST_DIR, ".claude", "skills"), { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("returns installed skills with manifest metadata", async () => {
    process.chdir(TEST_DIR);
    try {
      await skillManager.add("typescript-expert", { quiet: true });
      await skillManager.add("domain-driven-hexagon", { quiet: true });

      const installed = await getInstalledSkillsInfo();

      // Filter to only our test-installed skills (ignore global skills)
      const tsSkill = installed.find((s) => s.name === "typescript-expert");
      const ddhSkill = installed.find(
        (s) => s.name === "domain-driven-hexagon"
      );

      expect(tsSkill).toBeDefined();
      expect(tsSkill!.displayName).toBe("TypeScript Expert");
      expect(tsSkill!.category).toBe("typescript");
      expect(tsSkill!.relatedSkills.length).toBeGreaterThan(0);

      expect(ddhSkill).toBeDefined();
      expect(ddhSkill!.displayName).toBe("Domain-Driven Hexagon");
      expect(ddhSkill!.category).toBe("architecture");
      expect(ddhSkill!.relatedSkills.length).toBeGreaterThan(0);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("returns relatedSkills for installed skills", async () => {
    process.chdir(TEST_DIR);
    try {
      await skillManager.add("clean-architecture-ddd", { quiet: true });

      const installed = await getInstalledSkillsInfo();
      const cadSkill = installed.find(
        (s) => s.name === "clean-architecture-ddd"
      );

      expect(cadSkill).toBeDefined();
      expect(cadSkill!.relatedSkills.length).toBeGreaterThan(0);

      const relatedNames = cadSkill!.relatedSkills.map((r) => r.name);
      expect(relatedNames).toContain("domain-driven-hexagon");
    } finally {
      process.chdir(originalCwd);
    }
  });
});
