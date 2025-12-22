// Resource types for codekit

export type ResourceType = "agents" | "skills" | "commands";
export type ResourceSource = "bundled" | "project" | "global";

// Agent types
export type AgentCategory =
  | "database"
  | "framework"
  | "testing"
  | "infrastructure"
  | "frontend"
  | "documentation"
  | "refactoring"
  | "git"
  | "code-quality"
  | "nodejs"
  | "typescript"
  | "react"
  | "kafka"
  | "general";

export type AgentColor =
  | "blue"
  | "cyan"
  | "purple"
  | "green"
  | "yellow"
  | "red"
  | "magenta"
  | "white";

export interface AgentFrontmatter {
  name: string;
  description: string;
  category?: AgentCategory;
  displayName?: string;
  color?: AgentColor;
  tools?: string;
  bundle?: string[];
  [key: string]: unknown;
}

export interface Agent {
  frontmatter: AgentFrontmatter;
  content: string;
  filePath: string;
  source: ResourceSource;
}

// Command types
export interface CommandFrontmatter {
  description: string;
  category?: string;
  "allowed-tools"?: string;
  "argument-hint"?: string;
  [key: string]: unknown;
}

export interface Command {
  frontmatter: CommandFrontmatter;
  content: string;
  filePath: string;
  source: ResourceSource;
}

// Skill types (based on agent-skills-overview.md)
export interface SkillFrontmatter {
  name: string; // max 64 chars, lowercase + hyphens only
  description: string; // max 1024 chars
  [key: string]: unknown;
}

export interface Skill {
  frontmatter: SkillFrontmatter;
  content: string;
  directory: string;
  files: string[]; // Additional bundled files
  source: ResourceSource;
}

// Manifest types for bundled templates
export interface ResourceManifestEntry {
  name: string;
  path: string;
  displayName?: string;
  category?: string;
  description: string;
  dependencies?: string[];
  tags?: string[];
}

export interface ResourceManifest {
  version: string;
  resources: ResourceManifestEntry[];
}

// CLI option types
export interface GlobalOptions {
  global?: boolean;
  dryRun?: boolean;
  force?: boolean;
  json?: boolean;
}

export interface ListOptions extends GlobalOptions {
  category?: string;
  installed?: boolean;
  available?: boolean;
}

export interface AddOptions extends GlobalOptions {
  skipDeps?: boolean;
  quiet?: boolean;
}

export interface RemoveOptions extends GlobalOptions {
  quiet?: boolean;
}

export interface InitOptions extends GlobalOptions {
  template?: string;
  yes?: boolean;
}

// Result types
export interface ResourceListResult<T> {
  bundled: T[];
  project: T[];
  global: T[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
