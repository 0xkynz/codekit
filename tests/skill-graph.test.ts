import { describe, it, expect } from "bun:test";
import { SkillGraph } from "../src/utils/skill-graph";
import type { ResourceManifestEntry } from "../src/types";

/**
 * Test fixtures — minimal manifest entries for testing graph behavior
 */
function makeEntry(
  name: string,
  relatedSkills?: ResourceManifestEntry["relatedSkills"],
  overrides?: Partial<ResourceManifestEntry>
): ResourceManifestEntry {
  return {
    name,
    path: name,
    description: `${name} description`,
    displayName: name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    category: "test",
    relatedSkills,
    ...overrides,
  };
}

describe("SkillGraph", () => {
  describe("constructor", () => {
    it("indexes entries by name", () => {
      const graph = new SkillGraph([
        makeEntry("alpha"),
        makeEntry("beta"),
      ]);

      expect(graph.getEntry("alpha")).toBeDefined();
      expect(graph.getEntry("beta")).toBeDefined();
      expect(graph.getEntry("gamma")).toBeUndefined();
    });

    it("builds forward edges from relatedSkills", () => {
      const graph = new SkillGraph([
        makeEntry("typescript-expert", [
          { name: "react", relationship: "enhances" },
        ]),
        makeEntry("react"),
      ]);

      const related = graph.getRelated("typescript-expert");
      expect(related).toContainEqual({
        target: "react",
        relationship: "enhances",
      });
    });

    it("builds reverse edges automatically", () => {
      const graph = new SkillGraph([
        makeEntry("typescript-expert", [
          { name: "react", relationship: "enhances" },
        ]),
        makeEntry("react"),
      ]);

      // react should have reverse edge to typescript-expert
      const related = graph.getRelated("react");
      expect(related).toContainEqual({
        target: "typescript-expert",
        relationship: "enhances",
      });
    });

    it("deduplicates edges", () => {
      // Both entries declare each other as complementary
      const graph = new SkillGraph([
        makeEntry("alpha", [
          { name: "beta", relationship: "complementary" },
        ]),
        makeEntry("beta", [
          { name: "alpha", relationship: "complementary" },
        ]),
      ]);

      const alphaRelated = graph.getRelated("alpha");
      const betaEdges = alphaRelated.filter((e) => e.target === "beta");
      expect(betaEdges).toHaveLength(1);
    });

    it("handles entries with no relatedSkills", () => {
      const graph = new SkillGraph([
        makeEntry("standalone"),
      ]);

      expect(graph.getRelated("standalone")).toEqual([]);
    });

    it("handles empty manifest", () => {
      const graph = new SkillGraph([]);
      expect(graph.getRelated("anything")).toEqual([]);
      expect(graph.getEntry("anything")).toBeUndefined();
    });
  });

  describe("getRelated", () => {
    it("returns empty array for unknown skill", () => {
      const graph = new SkillGraph([makeEntry("alpha")]);
      expect(graph.getRelated("nonexistent")).toEqual([]);
    });

    it("returns all relationship types", () => {
      const graph = new SkillGraph([
        makeEntry("core", [
          { name: "enhancer", relationship: "enhances" },
          { name: "companion", relationship: "complementary" },
          { name: "alt", relationship: "alternative" },
        ]),
        makeEntry("enhancer"),
        makeEntry("companion"),
        makeEntry("alt"),
      ]);

      const related = graph.getRelated("core");
      expect(related).toHaveLength(3);

      const types = related.map((e) => e.relationship).sort();
      expect(types).toEqual(["alternative", "complementary", "enhances"]);
    });

    it("includes edges from other skills pointing to this skill", () => {
      // Only beta declares the relationship, but alpha should see it too
      const graph = new SkillGraph([
        makeEntry("alpha"),
        makeEntry("beta", [
          { name: "alpha", relationship: "complementary" },
        ]),
      ]);

      const alphaRelated = graph.getRelated("alpha");
      expect(alphaRelated).toContainEqual({
        target: "beta",
        relationship: "complementary",
      });
    });
  });

  describe("getEntry", () => {
    it("returns the manifest entry", () => {
      const entry = makeEntry("test-skill", [], {
        displayName: "Test Skill",
        category: "testing",
        description: "A test skill",
        tags: ["test"],
      });
      const graph = new SkillGraph([entry]);

      const result = graph.getEntry("test-skill");
      expect(result).toBeDefined();
      expect(result!.displayName).toBe("Test Skill");
      expect(result!.category).toBe("testing");
      expect(result!.description).toBe("A test skill");
    });
  });

  describe("getSuggestionsForSelection", () => {
    it("returns related skills not in selection", () => {
      const graph = new SkillGraph([
        makeEntry("alpha", [
          { name: "beta", relationship: "complementary" },
          { name: "gamma", relationship: "enhances" },
        ]),
        makeEntry("beta"),
        makeEntry("gamma"),
      ]);

      const suggestions = graph.getSuggestionsForSelection(["alpha"]);
      const names = suggestions.map((s) => s.name).sort();
      expect(names).toEqual(["beta", "gamma"]);
    });

    it("excludes skills already in selection", () => {
      const graph = new SkillGraph([
        makeEntry("alpha", [
          { name: "beta", relationship: "complementary" },
          { name: "gamma", relationship: "enhances" },
        ]),
        makeEntry("beta"),
        makeEntry("gamma"),
      ]);

      const suggestions = graph.getSuggestionsForSelection(["alpha", "beta"]);
      const names = suggestions.map((s) => s.name);
      expect(names).toEqual(["gamma"]);
      expect(names).not.toContain("beta");
    });

    it("aggregates relationships from multiple selected skills", () => {
      const graph = new SkillGraph([
        makeEntry("alpha", [
          { name: "gamma", relationship: "complementary" },
        ]),
        makeEntry("beta", [
          { name: "gamma", relationship: "enhances" },
        ]),
        makeEntry("gamma"),
      ]);

      const suggestions = graph.getSuggestionsForSelection(["alpha", "beta"]);
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].name).toBe("gamma");
      expect(suggestions[0].relationships).toHaveLength(2);
      expect(suggestions[0].relationships).toContainEqual({
        skill: "alpha",
        type: "complementary",
      });
      expect(suggestions[0].relationships).toContainEqual({
        skill: "beta",
        type: "enhances",
      });
    });

    it("returns empty array when no suggestions available", () => {
      const graph = new SkillGraph([
        makeEntry("alpha", [
          { name: "beta", relationship: "complementary" },
        ]),
        makeEntry("beta"),
      ]);

      // Both are selected, no suggestions
      const suggestions = graph.getSuggestionsForSelection(["alpha", "beta"]);
      expect(suggestions).toEqual([]);
    });

    it("returns empty array for empty selection", () => {
      const graph = new SkillGraph([
        makeEntry("alpha"),
      ]);

      expect(graph.getSuggestionsForSelection([])).toEqual([]);
    });

    it("includes displayName and description in suggestions", () => {
      const graph = new SkillGraph([
        makeEntry("alpha", [
          { name: "beta", relationship: "complementary" },
        ]),
        makeEntry("beta", [], {
          displayName: "Beta Expert",
          description: "Beta skill description",
        }),
      ]);

      const suggestions = graph.getSuggestionsForSelection(["alpha"]);
      expect(suggestions[0].displayName).toBe("Beta Expert");
      expect(suggestions[0].description).toBe("Beta skill description");
    });

    it("skips suggestions for skills not in manifest", () => {
      // alpha references "phantom" which is not in the manifest
      const graph = new SkillGraph([
        makeEntry("alpha", [
          { name: "phantom", relationship: "complementary" },
        ]),
      ]);

      const suggestions = graph.getSuggestionsForSelection(["alpha"]);
      expect(suggestions).toEqual([]);
    });
  });
});

describe("SkillGraph — real manifest relationships", () => {
  /**
   * These tests verify that the actual skill relationships defined in
   * templates/skills/index.json are correctly resolved by the graph.
   */

  let graph: SkillGraph;

  // Load the real manifest once for all tests in this describe block
  const loadRealManifest = async (): Promise<ResourceManifestEntry[]> => {
    const content = await Bun.file("templates/skills/index.json").text();
    const manifest = JSON.parse(content);
    return manifest.resources;
  };

  it("loads the real manifest without errors", async () => {
    const entries = await loadRealManifest();
    graph = new SkillGraph(entries);
    expect(entries.length).toBeGreaterThan(0);
  });

  it("clean-architecture-ddd and domain-driven-hexagon are complementary", async () => {
    const entries = await loadRealManifest();
    graph = new SkillGraph(entries);

    const cadRelated = graph.getRelated("clean-architecture-ddd");
    expect(cadRelated).toContainEqual({
      target: "domain-driven-hexagon",
      relationship: "complementary",
    });

    const ddhRelated = graph.getRelated("domain-driven-hexagon");
    expect(ddhRelated).toContainEqual({
      target: "clean-architecture-ddd",
      relationship: "complementary",
    });
  });

  it("domain-driven-hexagon relates to framework-specific DDD skills", async () => {
    const entries = await loadRealManifest();
    graph = new SkillGraph(entries);

    const related = graph.getRelated("domain-driven-hexagon");
    const targetNames = related.map((e) => e.target);

    expect(targetNames).toContain("elysiajs-ddd");
    expect(targetNames).toContain("elysiajs-ddd-mongoose");
    expect(targetNames).toContain("typescript-expert");
    expect(targetNames).toContain("testing-expert");
    expect(targetNames).toContain("database-expert");
  });

  it("elysiajs-ddd and elysiajs-ddd-mongoose are alternatives", async () => {
    const entries = await loadRealManifest();
    graph = new SkillGraph(entries);

    const related = graph.getRelated("elysiajs-ddd");
    expect(related).toContainEqual({
      target: "elysiajs-ddd-mongoose",
      relationship: "alternative",
    });
  });

  it("react and nextjs are alternatives", async () => {
    const entries = await loadRealManifest();
    graph = new SkillGraph(entries);

    const reactRelated = graph.getRelated("react");
    expect(reactRelated).toContainEqual({
      target: "nextjs",
      relationship: "alternative",
    });

    const nextRelated = graph.getRelated("nextjs");
    expect(nextRelated).toContainEqual({
      target: "react",
      relationship: "alternative",
    });
  });

  it("typescript-expert enhances framework skills via reverse edges", async () => {
    const entries = await loadRealManifest();
    graph = new SkillGraph(entries);

    // typescript-expert declares it enhances react/nextjs
    // Those skills should see typescript-expert in their related list
    const reactRelated = graph.getRelated("react");
    const tsEdge = reactRelated.find((e) => e.target === "typescript-expert");
    expect(tsEdge).toBeDefined();
  });

  it("getSuggestionsForSelection works with real DDD skills", async () => {
    const entries = await loadRealManifest();
    graph = new SkillGraph(entries);

    // User has clean-architecture-ddd installed, what else should they get?
    const suggestions = graph.getSuggestionsForSelection(["clean-architecture-ddd"]);
    const names = suggestions.map((s) => s.name);

    expect(names).toContain("domain-driven-hexagon");
    expect(names).toContain("typescript-expert");
    expect(names).toContain("testing-expert");
  });

  it("getSuggestionsForSelection excludes already-installed skills", async () => {
    const entries = await loadRealManifest();
    graph = new SkillGraph(entries);

    const suggestions = graph.getSuggestionsForSelection([
      "clean-architecture-ddd",
      "domain-driven-hexagon",
      "typescript-expert",
    ]);
    const names = suggestions.map((s) => s.name);

    // These should NOT appear since they're already selected
    expect(names).not.toContain("clean-architecture-ddd");
    expect(names).not.toContain("domain-driven-hexagon");
    expect(names).not.toContain("typescript-expert");
  });
});
