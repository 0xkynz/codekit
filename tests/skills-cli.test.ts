import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { rm, mkdir, readdir } from "fs/promises";
import { join } from "path";
import { pathExists } from "../src/utils/paths";

/**
 * CLI integration tests — run codekit commands as a user would.
 * Each test creates a temp project directory, runs commands via `bun run dev`,
 * and verifies both stdout output and filesystem side effects.
 */

const PROJECT_ROOT = import.meta.dir.replace("/tests", "");
const CLI = `bun run ${join(PROJECT_ROOT, "src/index.ts")}`;
const TEST_DIR = join(import.meta.dir, ".tmp-project");

async function run(
  args: string,
  options?: { cwd?: string }
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(["sh", "-c", `${CLI} ${args}`], {
    cwd: options?.cwd ?? TEST_DIR,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, NO_COLOR: "1" },
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;

  return { stdout, stderr, exitCode: exitCode ?? 1 };
}

describe("codekit skills add — CLI", () => {
  beforeEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(join(TEST_DIR, ".claude", "skills"), { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("installs a skill and prints success message", async () => {
    const { stdout, exitCode } = await run("skills add typescript-expert");

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Installed skill "typescript-expert"');

    // Verify the skill directory was created
    const skillDir = join(TEST_DIR, ".claude", "skills", "typescript-expert");
    expect(await pathExists(skillDir)).toBe(true);
    expect(await pathExists(join(skillDir, "SKILL.md"))).toBe(true);
  });

  it("shows related skills after install", async () => {
    const { stdout, exitCode } = await run("skills add typescript-expert");

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Related skills:");
  });

  it("installs domain-driven-hexagon with reference files", async () => {
    const { stdout, exitCode } = await run("skills add domain-driven-hexagon");

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Installed skill "domain-driven-hexagon"');

    // Should show architecture-related skills
    expect(stdout).toContain("Clean Architecture");

    // Verify reference files exist
    const skillDir = join(TEST_DIR, ".claude", "skills", "domain-driven-hexagon");
    const entries = await readdir(skillDir);
    expect(entries).toContain("SKILL.md");
    expect(entries).toContain("references");

    const refs = await readdir(join(skillDir, "references"));
    expect(refs).toContain("building-blocks.md");
    expect(refs).toContain("patterns-catalog.md");
  });

  it("installs clean-architecture-ddd with reference files", async () => {
    const { stdout, exitCode } = await run("skills add clean-architecture-ddd");

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Installed skill "clean-architecture-ddd"');

    // Should suggest domain-driven-hexagon as related
    expect(stdout).toContain("Domain-Driven Hexagon");

    const skillDir = join(TEST_DIR, ".claude", "skills", "clean-architecture-ddd");
    const refs = await readdir(join(skillDir, "references"));
    expect(refs).toContain("building-blocks.md");
  });

  it("fails when skill already installed", async () => {
    await run("skills add typescript-expert");
    const { stdout, stderr, exitCode } = await run("skills add typescript-expert");

    expect(exitCode).toBe(1);
    const output = stdout + stderr;
    expect(output).toContain("already installed");
  });

  it("overwrites with --force", async () => {
    await run("skills add typescript-expert");
    const { exitCode } = await run("skills add typescript-expert --force");
    expect(exitCode).toBe(0);
  });

  it("fails for nonexistent skill with suggestions", async () => {
    const { stdout, stderr, exitCode } = await run("skills add typscript-expart");

    expect(exitCode).toBe(1);
    const output = stdout + stderr;
    expect(output).toContain("not found");
  });
});

describe("codekit skills related — CLI", () => {
  beforeEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(join(TEST_DIR, ".claude", "skills"), { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("shows related skills for domain-driven-hexagon", async () => {
    const { stdout, exitCode } = await run("skills related domain-driven-hexagon");

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Complementary:");
    expect(stdout).toContain("clean-architecture-ddd");
    expect(stdout).toContain("typescript-expert");
    expect(stdout).toContain("testing-expert");
  });

  it("shows related skills for clean-architecture-ddd", async () => {
    const { stdout, exitCode } = await run("skills related clean-architecture-ddd");

    expect(exitCode).toBe(0);
    expect(stdout).toContain("domain-driven-hexagon");
    expect(stdout).toContain("elysiajs-ddd");
  });

  it("shows alternative relationship for elysiajs-ddd", async () => {
    const { stdout, exitCode } = await run("skills related elysiajs-ddd");

    expect(exitCode).toBe(0);
    expect(stdout).toContain("Alternatives:");
    expect(stdout).toContain("elysiajs-ddd-mongoose");
  });

  it("shows enhances relationship for typescript-expert", async () => {
    const { stdout, exitCode } = await run("skills related typescript-expert");

    expect(exitCode).toBe(0);
    // typescript-expert enhances various framework skills
    expect(stdout).toContain("Enhances:");
  });

  it("outputs JSON with --json flag", async () => {
    const { stdout, exitCode } = await run("skills related domain-driven-hexagon --json");

    expect(exitCode).toBe(0);

    const data = JSON.parse(stdout);
    expect(data.name).toBe("domain-driven-hexagon");
    expect(data.displayName).toBe("Domain-Driven Hexagon");
    expect(Array.isArray(data.related)).toBe(true);

    const relatedNames = data.related.map((r: any) => r.name);
    expect(relatedNames).toContain("clean-architecture-ddd");
    expect(relatedNames).toContain("typescript-expert");

    // Each related entry should have relationship type and installed status
    const cadEntry = data.related.find((r: any) => r.name === "clean-architecture-ddd");
    expect(cadEntry.relationship).toBe("complementary");
    expect(typeof cadEntry.installed).toBe("boolean");
  });

  it("marks installed skills when viewing related", async () => {
    // Install typescript-expert first
    await run("skills add typescript-expert");

    const { stdout, exitCode } = await run(
      "skills related domain-driven-hexagon --json"
    );

    expect(exitCode).toBe(0);

    const data = JSON.parse(stdout);
    const tsEntry = data.related.find((r: any) => r.name === "typescript-expert");
    expect(tsEntry).toBeDefined();
    expect(tsEntry.installed).toBe(true);

    // clean-architecture-ddd should not be installed
    const cadEntry = data.related.find((r: any) => r.name === "clean-architecture-ddd");
    expect(cadEntry).toBeDefined();
    expect(cadEntry.installed).toBe(false);
  });

  it("fails for nonexistent skill", async () => {
    const { stdout, stderr, exitCode } = await run("skills related fake-skill-xyz");

    expect(exitCode).toBe(1);
    const output = stdout + stderr;
    expect(output).toContain("not found");
  });
});

describe("codekit skills list — CLI", () => {
  beforeEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(join(TEST_DIR, ".claude", "skills"), { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("lists all bundled skills", async () => {
    const { stdout, exitCode } = await run("skills list");

    expect(exitCode).toBe(0);
    expect(stdout).toContain("domain-driven-hexagon");
    expect(stdout).toContain("clean-architecture-ddd");
    expect(stdout).toContain("typescript-expert");
    expect(stdout).toContain("react");
  });

  it("marks installed skills in the list", async () => {
    await run("skills add typescript-expert");

    const { stdout, exitCode } = await run("skills list");

    expect(exitCode).toBe(0);
    // The list should show typescript-expert with a checkmark
    expect(stdout).toContain("typescript-expert");
  });

  it("outputs JSON with --json flag", async () => {
    await run("skills add domain-driven-hexagon");

    const { stdout, exitCode } = await run("skills list --json");

    expect(exitCode).toBe(0);

    const data = JSON.parse(stdout);
    expect(data.bundled).toBeDefined();
    expect(data.project).toBeDefined();
    expect(Array.isArray(data.bundled)).toBe(true);
    expect(Array.isArray(data.project)).toBe(true);

    // domain-driven-hexagon should appear in project (installed)
    const projectNames = data.project.map((s: any) => s.frontmatter.name);
    expect(projectNames).toContain("domain-driven-hexagon");
  });

  it("filters with --installed flag", async () => {
    await run("skills add typescript-expert");
    await run("skills add clean-architecture-ddd");

    const { stdout, exitCode } = await run("skills list --installed --json");

    expect(exitCode).toBe(0);

    const data = JSON.parse(stdout);
    // Should only have installed skills, no bundled
    expect(data.bundled).toHaveLength(0);
    const projectNames = data.project.map((s: any) => s.frontmatter.name);
    expect(projectNames).toContain("typescript-expert");
    expect(projectNames).toContain("clean-architecture-ddd");
  });
});

describe("codekit skills remove — CLI", () => {
  beforeEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(join(TEST_DIR, ".claude", "skills"), { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("removes an installed skill", async () => {
    await run("skills add typescript-expert");

    const skillDir = join(TEST_DIR, ".claude", "skills", "typescript-expert");
    expect(await pathExists(skillDir)).toBe(true);

    const { stdout, exitCode } = await run("skills remove typescript-expert --force");

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Removed skill "typescript-expert"');
    expect(await pathExists(skillDir)).toBe(false);
  });

  it("fails when skill not installed", async () => {
    const { stdout, stderr, exitCode } = await run("skills remove nonexistent --force");

    expect(exitCode).toBe(1);
    const output = stdout + stderr;
    expect(output).toContain("not installed");
  });
});

describe("user workflow — add skill then check related", () => {
  beforeEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(join(TEST_DIR, ".claude", "skills"), { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("full flow: add DDD skill, check related, add suggested, verify all installed", async () => {
    // Step 1: User adds clean-architecture-ddd
    const add1 = await run("skills add clean-architecture-ddd");
    expect(add1.exitCode).toBe(0);
    expect(add1.stdout).toContain("Domain-Driven Hexagon");

    // Step 2: User checks related skills
    const related = await run("skills related clean-architecture-ddd --json");
    expect(related.exitCode).toBe(0);

    const data = JSON.parse(related.stdout);
    const relatedNames = data.related.map((r: any) => r.name);
    expect(relatedNames).toContain("domain-driven-hexagon");

    // Step 3: User installs suggested skill
    const add2 = await run("skills add domain-driven-hexagon");
    expect(add2.exitCode).toBe(0);

    // Step 4: Verify both installed via list
    const list = await run("skills list --installed --json");
    expect(list.exitCode).toBe(0);

    const listData = JSON.parse(list.stdout);
    const installed = listData.project.map((s: any) => s.frontmatter.name);
    expect(installed).toContain("clean-architecture-ddd");
    expect(installed).toContain("domain-driven-hexagon");

    // Step 5: Related now shows domain-driven-hexagon as installed
    const related2 = await run("skills related clean-architecture-ddd --json");
    const data2 = JSON.parse(related2.stdout);
    const ddhEntry = data2.related.find((r: any) => r.name === "domain-driven-hexagon");
    expect(ddhEntry.installed).toBe(true);
  });

  it("full flow: add framework DDD skill, see alternatives", async () => {
    // Step 1: User adds elysiajs-ddd
    const add1 = await run("skills add elysiajs-ddd");
    expect(add1.exitCode).toBe(0);

    // Step 2: Check related — should show mongoose variant as alternative
    const related = await run("skills related elysiajs-ddd --json");
    expect(related.exitCode).toBe(0);

    const data = JSON.parse(related.stdout);
    const mongooseEntry = data.related.find(
      (r: any) => r.name === "elysiajs-ddd-mongoose"
    );
    expect(mongooseEntry).toBeDefined();
    expect(mongooseEntry.relationship).toBe("alternative");

    // Should also suggest the generic architecture skills
    const relatedNames = data.related.map((r: any) => r.name);
    expect(relatedNames).toContain("domain-driven-hexagon");
    expect(relatedNames).toContain("clean-architecture-ddd");
  });
});
