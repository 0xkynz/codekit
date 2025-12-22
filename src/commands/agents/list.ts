import type { ListOptions, Agent } from "../../types";
import { agentManager } from "../../core/agent-manager";
import { logger, style, outputJson } from "../../utils/logger";

interface AgentListOptions extends ListOptions {
  category?: string;
  installed?: boolean;
  available?: boolean;
}

export async function listAgents(options: AgentListOptions): Promise<void> {
  try {
    const result = await agentManager.list(options);

    // Combine all agents for deduplication
    const installedNames = new Set([
      ...result.project.map((a) => a.frontmatter.name),
      ...result.global.map((a) => a.frontmatter.name),
    ]);

    // Filter by category if specified
    let bundled = result.bundled;
    let project = result.project;
    let global = result.global;

    if (options.category) {
      const cat = options.category.toLowerCase();
      bundled = bundled.filter((a) => a.frontmatter.category?.toLowerCase() === cat);
      project = project.filter((a) => a.frontmatter.category?.toLowerCase() === cat);
      global = global.filter((a) => a.frontmatter.category?.toLowerCase() === cat);
    }

    // Filter by installed/available status
    if (options.installed) {
      bundled = [];
    }
    if (options.available) {
      bundled = bundled.filter((a) => !installedNames.has(a.frontmatter.name));
      project = [];
      global = [];
    }

    // JSON output
    if (options.json) {
      outputJson({ bundled, project, global });
      return;
    }

    // Human-readable output
    const hasAny = bundled.length > 0 || project.length > 0 || global.length > 0;

    if (!hasAny) {
      logger.info("No agents found");
      return;
    }

    // Group by category
    const categories = new Map<string, Agent[]>();
    for (const agent of bundled) {
      const cat = agent.frontmatter.category || "general";
      const existing = categories.get(cat) || [];
      existing.push(agent);
      categories.set(cat, existing);
    }

    if (bundled.length > 0) {
      logger.section("📦 Bundled Agents");

      for (const [category, agents] of Array.from(categories).sort()) {
        logger.log(`\n  ${style.bold(category)}`);

        for (const agent of agents) {
          const installed = installedNames.has(agent.frontmatter.name);
          const status = installed ? style.installed : style.notInstalled;
          const name = style.agent(agent.frontmatter.name);
          const display = agent.frontmatter.displayName
            ? style.dim(` - ${agent.frontmatter.displayName}`)
            : "";
          logger.log(`    ${status} ${name}${display}`);
        }
      }
    }

    if (project.length > 0) {
      logger.section("📁 Project Agents (.claude/agents/)");
      for (const agent of project) {
        const name = style.agent(agent.frontmatter.name);
        const display = agent.frontmatter.displayName
          ? style.dim(` - ${agent.frontmatter.displayName}`)
          : "";
        logger.log(`  ${style.installed} ${name}${display}`);
      }
    }

    if (global.length > 0) {
      logger.section("🌐 Global Agents (~/.claude/agents/)");
      for (const agent of global) {
        const name = style.agent(agent.frontmatter.name);
        const display = agent.frontmatter.displayName
          ? style.dim(` - ${agent.frontmatter.displayName}`)
          : "";
        logger.log(`  ${style.installed} ${name}${display}`);
      }
    }

    logger.newline();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to list agents");
    process.exit(1);
  }
}
