/**
 * Skill mesh network — bidirectional graph resolver
 * Builds relationships between skills from unidirectional manifest data
 */

import type { RelatedSkillEntry, ResourceManifestEntry } from "../types";
import { templateLoader } from "../core/template-loader";

interface GraphEdge {
  target: string;
  relationship: RelatedSkillEntry["relationship"];
}

/**
 * Bidirectional graph of skill relationships
 */
export class SkillGraph {
  private adjacency = new Map<string, GraphEdge[]>();
  private entries = new Map<string, ResourceManifestEntry>();

  constructor(manifestEntries: ResourceManifestEntry[]) {
    // Index entries by name
    for (const entry of manifestEntries) {
      this.entries.set(entry.name, entry);
    }

    // Build bidirectional adjacency map
    for (const entry of manifestEntries) {
      if (!entry.relatedSkills) continue;

      for (const rel of entry.relatedSkills) {
        // Forward edge: entry -> rel.name
        this.addEdge(entry.name, rel.name, rel.relationship);

        // Reverse edge: rel.name -> entry (same relationship type)
        this.addEdge(rel.name, entry.name, rel.relationship);
      }
    }
  }

  private addEdge(from: string, to: string, relationship: RelatedSkillEntry["relationship"]): void {
    const edges = this.adjacency.get(from) || [];
    // Avoid duplicate edges
    if (!edges.some(e => e.target === to)) {
      edges.push({ target: to, relationship });
      this.adjacency.set(from, edges);
    }
  }

  /**
   * Get all related skills for a given skill
   */
  getRelated(skillName: string): GraphEdge[] {
    return this.adjacency.get(skillName) || [];
  }

  /**
   * Get related skills that aren't already in the selection
   * Returns suggestions grouped with their relationship info
   */
  getSuggestionsForSelection(selectedSkills: string[]): Array<{
    name: string;
    displayName: string;
    description: string;
    relationships: Array<{ skill: string; type: RelatedSkillEntry["relationship"] }>;
  }> {
    const selectedSet = new Set(selectedSkills);
    const suggestions = new Map<string, {
      name: string;
      displayName: string;
      description: string;
      relationships: Array<{ skill: string; type: RelatedSkillEntry["relationship"] }>;
    }>();

    for (const selected of selectedSkills) {
      const related = this.getRelated(selected);
      for (const edge of related) {
        if (selectedSet.has(edge.target)) continue;

        const entry = this.entries.get(edge.target);
        if (!entry) continue;

        const existing = suggestions.get(edge.target);
        if (existing) {
          existing.relationships.push({ skill: selected, type: edge.relationship });
        } else {
          suggestions.set(edge.target, {
            name: edge.target,
            displayName: entry.displayName || edge.target,
            description: entry.description,
            relationships: [{ skill: selected, type: edge.relationship }],
          });
        }
      }
    }

    return Array.from(suggestions.values());
  }

  /**
   * Get a manifest entry by skill name
   */
  getEntry(skillName: string): ResourceManifestEntry | undefined {
    return this.entries.get(skillName);
  }
}

/**
 * Build a SkillGraph from the manifest
 */
export async function buildSkillGraph(): Promise<SkillGraph> {
  const manifest = await templateLoader.loadManifest("skills");
  return new SkillGraph(manifest.resources);
}
