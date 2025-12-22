import type {
  Agent,
  AgentFrontmatter,
  ResourceSource,
  ValidationResult,
} from "../types";
import { ResourceManager } from "./resource-manager";
import {
  parseMarkdownWithFrontmatter,
  validateAgentFrontmatter,
} from "../utils/yaml-parser";

/**
 * Manager for agent resources
 */
export class AgentManager extends ResourceManager<Agent> {
  protected resourceType = "agents" as const;

  parseFile(content: string, filePath: string, source: ResourceSource): Agent {
    const { frontmatter, content: body } = parseMarkdownWithFrontmatter<AgentFrontmatter>(content);

    return {
      frontmatter,
      content: body,
      filePath,
      source,
    };
  }

  validateResource(resource: Agent): ValidationResult {
    const result = validateAgentFrontmatter(resource.frontmatter);

    return {
      valid: result.valid,
      errors: result.errors,
      warnings: [],
    };
  }

  protected getResourceName(resource: Agent): string {
    return resource.frontmatter.name;
  }

  protected getResourcePath(resource: Agent): string {
    return resource.filePath;
  }

  /**
   * Get agents grouped by category
   */
  async getByCategory(): Promise<Map<string, Agent[]>> {
    const { bundled, project, global } = await this.list();
    const allAgents = [...bundled, ...project, ...global];

    const byCategory = new Map<string, Agent[]>();

    for (const agent of allAgents) {
      const category = agent.frontmatter.category || "general";
      const existing = byCategory.get(category) || [];
      existing.push(agent);
      byCategory.set(category, existing);
    }

    return byCategory;
  }

  /**
   * Extract dependencies from agent content
   * Agents may reference other agents in their routing logic
   */
  extractDependencies(agent: Agent): string[] {
    const deps: string[] = [];
    const content = agent.content.toLowerCase();

    // Look for patterns like "use database-expert" or "delegate to postgres-expert"
    const patterns = [
      /use (\w+-expert)/g,
      /delegate to (\w+-expert)/g,
      /switch to (\w+-expert)/g,
      /recommend (\w+-expert)/g,
    ];

    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1] !== agent.frontmatter.name) {
          deps.push(match[1]);
        }
      }
    }

    return [...new Set(deps)];
  }
}

// Singleton instance
export const agentManager = new AgentManager();
