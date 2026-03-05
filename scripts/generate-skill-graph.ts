#!/usr/bin/env bun
/**
 * Generate a Mermaid graph from templates/skills/index.json
 *
 * Usage:
 *   bun run scripts/generate-skill-graph.ts              # print to stdout
 *   bun run scripts/generate-skill-graph.ts -o graph.md  # write to file
 *   bun run scripts/generate-skill-graph.ts --no-orphans  # hide skills with no relationships
 */

import { resolve, dirname } from "path";

const ROOT = dirname(dirname(import.meta.path));
const INDEX_PATH = resolve(ROOT, "templates/skills/index.json");

interface RelatedSkill {
  name: string;
  relationship: "enhances" | "complementary" | "alternative";
}

interface SkillEntry {
  name: string;
  displayName: string;
  category: string;
  description: string;
  relatedSkills: RelatedSkill[];
}

interface Manifest {
  resources: SkillEntry[];
}

// Category → Mermaid subgraph style
const CATEGORY_COLORS: Record<string, string> = {
  frontend: "#3b82f6",
  backend: "#ef4444",
  mobile: "#8b5cf6",
  database: "#f59e0b",
  workflow: "#10b981",
  architecture: "#ec4899",
  typescript: "#2563eb",
  testing: "#14b8a6",
  "code-quality": "#6366f1",
  git: "#f97316",
  devops: "#64748b",
  document: "#78716c",
  data: "#0ea5e9",
  auth: "#dc2626",
};

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  database: "Database",
  workflow: "Workflow",
  architecture: "Architecture",
  typescript: "TypeScript",
  testing: "Testing",
  "code-quality": "Code Quality",
  git: "Git / GitHub",
  devops: "DevOps / Tooling",
  document: "Document",
  data: "Data",
  auth: "Auth",
};

function sanitizeId(name: string): string {
  return name.replace(/-/g, "_");
}

function generate(manifest: Manifest, includeOrphans: boolean): string {
  const skills = manifest.resources;
  const skillMap = new Map(skills.map((s) => [s.name, s]));

  // Deduplicate edges: key = sorted pair + relationship
  const edgeSet = new Set<string>();
  const edges: { from: string; to: string; rel: string }[] = [];

  for (const skill of skills) {
    for (const rel of skill.relatedSkills) {
      if (!skillMap.has(rel.name)) continue;

      // Canonical edge key (alphabetical order) to avoid duplicates
      const [a, b] =
        skill.name < rel.name
          ? [skill.name, rel.name]
          : [rel.name, skill.name];
      const key = `${a}|${b}|${rel.relationship}`;

      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ from: skill.name, to: rel.name, rel: rel.relationship });
      }
    }
  }

  // Find connected skills
  const connected = new Set<string>();
  for (const e of edges) {
    connected.add(e.from);
    connected.add(e.to);
  }

  // Group skills by category
  const categories = new Map<string, SkillEntry[]>();
  for (const skill of skills) {
    if (!includeOrphans && !connected.has(skill.name)) continue;
    const cat = skill.category;
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(skill);
  }

  // Build Mermaid output
  const lines: string[] = [];
  lines.push("graph LR");
  lines.push("");

  // Edge styles legend
  lines.push("  %% Relationship types:");
  lines.push("  %%   ─── enhances (solid)");
  lines.push("  %%   - - complementary (dashed)");
  lines.push("  %%   ··· alternative (dotted)");
  lines.push("");

  // Subgraphs by category
  const sortedCategories = [...categories.keys()].sort();
  for (const cat of sortedCategories) {
    const catSkills = categories.get(cat)!;
    const label = CATEGORY_LABELS[cat] || cat;
    lines.push(`  subgraph ${sanitizeId(cat)}["${label}"]`);
    for (const skill of catSkills) {
      const id = sanitizeId(skill.name);
      lines.push(`    ${id}["${skill.displayName}"]`);
    }
    lines.push("  end");
    lines.push("");
  }

  // Edges grouped by relationship type
  const enhances = edges.filter((e) => e.rel === "enhances");
  const complementary = edges.filter((e) => e.rel === "complementary");
  const alternative = edges.filter((e) => e.rel === "alternative");

  if (enhances.length > 0) {
    lines.push("  %% Enhances (solid arrow)");
    for (const e of enhances) {
      lines.push(
        `  ${sanitizeId(e.from)} -->|enhances| ${sanitizeId(e.to)}`
      );
    }
    lines.push("");
  }

  if (complementary.length > 0) {
    lines.push("  %% Complementary (dashed)");
    for (const e of complementary) {
      lines.push(
        `  ${sanitizeId(e.from)} -.-|complementary| ${sanitizeId(e.to)}`
      );
    }
    lines.push("");
  }

  if (alternative.length > 0) {
    lines.push("  %% Alternative (dotted, red)");
    for (const e of alternative) {
      lines.push(
        `  ${sanitizeId(e.from)} -.->|alternative| ${sanitizeId(e.to)}`
      );
    }
    lines.push("");
  }

  // Style subgraphs
  lines.push("  %% Category styles");
  for (const cat of sortedCategories) {
    const color = CATEGORY_COLORS[cat] || "#94a3b8";
    lines.push(`  style ${sanitizeId(cat)} fill:${color}15,stroke:${color},stroke-width:2px`);
  }

  return lines.join("\n");
}

// --- Main ---

const manifest: Manifest = await Bun.file(INDEX_PATH).json();

const args = process.argv.slice(2);
const includeOrphans = !args.includes("--no-orphans");
const outIndex = args.indexOf("-o");
const outFile = outIndex !== -1 ? args[outIndex + 1] : null;

const mermaid = generate(manifest, includeOrphans);

// Stats
const skills = manifest.resources;
const edgeCount = mermaid.split("\n").filter((l) => l.includes("-->") || l.includes("-.-") || l.includes("-.->")).length;
const categories = new Set(skills.map((s) => s.category)).size;

if (outFile) {
  const content = `# Skill Mesh Network\n\n${skills.length} skills across ${categories} categories with ${edgeCount} relationships.\n\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n`;
  await Bun.write(resolve(ROOT, outFile), content);
  console.log(`Written to ${outFile} (${skills.length} skills, ${edgeCount} edges, ${categories} categories)`);
} else {
  console.log(mermaid);
  console.error(`\n${skills.length} skills, ${edgeCount} edges, ${categories} categories`);
}
