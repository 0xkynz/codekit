import type { GlobalOptions } from "../../types";
import { buildSkillGraph } from "../../utils/skill-graph";
import { skillManager } from "../../core/skill-manager";
import { logger, style } from "../../utils/logger";

interface RelatedOptions extends GlobalOptions {
  json?: boolean;
}

export async function relatedSkills(
  name: string,
  options: RelatedOptions
): Promise<void> {
  try {
    const graph = await buildSkillGraph();
    const entry = graph.getEntry(name);

    if (!entry) {
      const similar = await skillManager.findSimilar(name);
      logger.error(
        `Skill "${name}" not found.${similar.length > 0 ? ` Did you mean: ${similar.join(", ")}?` : ""}`
      );
      process.exit(1);
    }

    const related = graph.getRelated(name);

    // Check which skills are installed
    const listResult = await skillManager.list(options);
    const installedNames = new Set([
      ...listResult.project.map(s => s.frontmatter.name),
      ...listResult.global.map(s => s.frontmatter.name),
    ]);

    // Check if queried skill itself is installed
    const selfInstalled = installedNames.has(name);

    // JSON output
    if (options.json) {
      const data = {
        name,
        displayName: entry.displayName || name,
        installed: selfInstalled,
        dependencies: entry.dependencies || [],
        related: related.map(edge => {
          const relEntry = graph.getEntry(edge.target);
          return {
            name: edge.target,
            displayName: relEntry?.displayName || edge.target,
            relationship: edge.relationship,
            installed: installedNames.has(edge.target),
          };
        }),
      };
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    // Human-readable output
    logger.section(
      `${style.skill(entry.displayName || name)} ${selfInstalled ? style.installed : style.dim("not installed")}`
    );
    logger.log(`  ${style.dim(entry.description)}`);
    logger.newline();

    // Dependencies (hard requirements)
    const deps = entry.dependencies || [];
    if (deps.length > 0) {
      logger.log(style.bold("Dependencies:"));
      for (const dep of deps) {
        const depEntry = graph.getEntry(dep);
        const depName = depEntry?.displayName || dep;
        const status = installedNames.has(dep) ? style.installed : style.dim("missing");
        logger.log(`  ${status} ${depName} ${style.dim(`(${dep})`)}`);
      }
      logger.newline();
    }

    // Related skills (soft relationships)
    if (related.length === 0) {
      logger.log(style.dim("No related skills."));
      return;
    }

    // Group by relationship type
    const enhances = related.filter(e => e.relationship === "enhances");
    const complementary = related.filter(e => e.relationship === "complementary");
    const alternatives = related.filter(e => e.relationship === "alternative");

    const printGroup = (label: string, edges: typeof related) => {
      if (edges.length === 0) return;
      logger.log(style.bold(label));
      for (const edge of edges) {
        const relEntry = graph.getEntry(edge.target);
        const displayName = relEntry?.displayName || edge.target;
        const installed = installedNames.has(edge.target);
        const status = installed ? style.installed : style.dim("  ");
        logger.log(`  ${status} ${displayName} ${style.dim(`(${edge.target})`)}`);
      }
    };

    printGroup("Enhances:", enhances);
    printGroup("Complementary:", complementary);
    printGroup("Alternatives:", alternatives);

    // Suggest missing related skills
    const missing = related.filter(e => !installedNames.has(e.target));
    if (missing.length > 0 && selfInstalled) {
      logger.newline();
      logger.log(
        style.dim(`Install related: codekit skills add ${missing.map(e => e.target).join(" ")}`)
      );
    }

    logger.newline();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : "Failed to query related skills");
    process.exit(1);
  }
}
