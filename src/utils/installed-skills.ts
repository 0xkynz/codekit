/**
 * Installed skills scanner
 * Cross-references installed skills with manifest data for platform rules
 */

import type { InstalledSkillInfo, ResourceManifestEntry } from "../types";
import { skillManager } from "../core/skill-manager";
import { templateLoader } from "../core/template-loader";

/**
 * Get info about all installed skills (project + global),
 * cross-referenced with the manifest for display metadata
 */
export async function getInstalledSkillsInfo(): Promise<InstalledSkillInfo[]> {
  const [listResult, manifest] = await Promise.all([
    skillManager.list(),
    templateLoader.loadManifest("skills"),
  ]);

  // Build manifest lookup
  const manifestByName = new Map<string, ResourceManifestEntry>();
  for (const entry of manifest.resources) {
    manifestByName.set(entry.name, entry);
  }

  const installedSkills: InstalledSkillInfo[] = [];

  // Process project and global installed skills
  const allInstalled = [...listResult.project, ...listResult.global];

  for (const skill of allInstalled) {
    const name = skill.frontmatter.name;
    const manifestEntry = manifestByName.get(name);

    installedSkills.push({
      name,
      displayName: manifestEntry?.displayName || skill.frontmatter.name,
      description: manifestEntry?.description || skill.frontmatter.description,
      category: manifestEntry?.category || "general",
      path: skill.directory,
      relatedSkills: manifestEntry?.relatedSkills || [],
    });
  }

  return installedSkills;
}
