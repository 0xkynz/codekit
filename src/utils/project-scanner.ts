/**
 * Project Scanner - Analyzes existing projects to extract context
 */

import { readdir, stat } from "fs/promises";
import { join, basename, extname } from "path";
import { pathExists } from "./paths";

export interface ProjectContext {
  name: string;
  rootDir: string;
  techStack: TechStack;
  structure: ProjectStructure;
  patterns: DetectedPatterns;
  configFiles: string[];
  gitInfo: GitInfo | null;
  dependencies: PackageDependencies;
}

/**
 * Package dependencies extracted from various package managers
 */
export interface PackageDependencies {
  /** JavaScript/TypeScript: package.json */
  javascript?: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    peerDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  };
  /** Python: requirements.txt, pyproject.toml, Pipfile */
  python?: {
    dependencies: Array<{ name: string; version?: string; extras?: string[] }>;
    devDependencies?: Array<{ name: string; version?: string }>;
    source?: "requirements.txt" | "pyproject.toml" | "Pipfile" | "setup.py";
  };
  /** Rust: Cargo.toml */
  rust?: {
    dependencies: Record<string, string | { version: string; features?: string[] }>;
    devDependencies?: Record<string, string | { version: string }>;
  };
  /** Go: go.mod */
  go?: {
    module: string;
    goVersion?: string;
    dependencies: Array<{ path: string; version: string }>;
  };
  /** Ruby: Gemfile */
  ruby?: {
    dependencies: Array<{ name: string; version?: string; groups?: string[] }>;
  };
  /** Java: pom.xml, build.gradle */
  java?: {
    dependencies: Array<{ groupId: string; artifactId: string; version?: string; scope?: string }>;
    source?: "pom.xml" | "build.gradle" | "build.gradle.kts";
  };
  /** PHP: composer.json */
  php?: {
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  /** .NET: *.csproj, packages.config */
  dotnet?: {
    dependencies: Array<{ name: string; version: string }>;
    targetFramework?: string;
  };
  /** Swift: Package.swift */
  swift?: {
    dependencies: Array<{ url: string; version?: string }>;
  };
  /** Elixir: mix.exs */
  elixir?: {
    dependencies: Array<{ name: string; version?: string }>;
  };
}

export interface TechStack {
  languages: string[];
  frameworks: string[];
  buildTools: string[];
  testingTools: string[];
  packageManager: string | null;
  runtime: string | null;
}

export interface ProjectStructure {
  hasMonorepo: boolean;
  srcDir: string | null;
  testDir: string | null;
  docsDir: string | null;
  configDir: string | null;
  entryPoints: string[];
  directories: string[];
}

export interface DetectedPatterns {
  architecture: string[];
  codeStyle: CodeStylePatterns;
  testing: string[];
  other: string[];
}

export interface CodeStylePatterns {
  usesTypeScript: boolean;
  usesSemicolons: boolean | null;
  usesTabIndent: boolean | null;
  quoteStyle: "single" | "double" | null;
  hasLinter: boolean;
  hasFormatter: boolean;
}

export interface GitInfo {
  isRepo: boolean;
  branch: string | null;
  hasRemote: boolean;
  uncommittedChanges: boolean;
}

// Array-only keys from TechStack
type TechStackArrayKeys = "languages" | "frameworks" | "buildTools" | "testingTools";

// File patterns for detection
const TECH_DETECTORS: Record<string, { files: string[]; category: TechStackArrayKeys }> = {
  // Languages
  typescript: { files: ["tsconfig.json", "*.ts", "*.tsx"], category: "languages" },
  javascript: { files: ["*.js", "*.jsx", "*.mjs"], category: "languages" },
  python: { files: ["*.py", "pyproject.toml", "requirements.txt", "setup.py"], category: "languages" },
  rust: { files: ["Cargo.toml", "*.rs"], category: "languages" },
  go: { files: ["go.mod", "*.go"], category: "languages" },

  // Frameworks
  react: { files: ["react", "next"], category: "frameworks" },
  vue: { files: ["vue.config.js", "*.vue", "nuxt.config.*"], category: "frameworks" },
  angular: { files: ["angular.json", "*.component.ts"], category: "frameworks" },
  nextjs: { files: ["next.config.*", ".next"], category: "frameworks" },
  nestjs: { files: ["nest-cli.json", "*.module.ts"], category: "frameworks" },
  express: { files: ["express"], category: "frameworks" },
  fastify: { files: ["fastify"], category: "frameworks" },

  // Build tools
  vite: { files: ["vite.config.*"], category: "buildTools" },
  webpack: { files: ["webpack.config.*"], category: "buildTools" },
  esbuild: { files: ["esbuild"], category: "buildTools" },
  rollup: { files: ["rollup.config.*"], category: "buildTools" },
  turbo: { files: ["turbo.json"], category: "buildTools" },

  // Testing
  jest: { files: ["jest.config.*", "jest.setup.*"], category: "testingTools" },
  vitest: { files: ["vitest.config.*"], category: "testingTools" },
  playwright: { files: ["playwright.config.*"], category: "testingTools" },
  cypress: { files: ["cypress.config.*", "cypress/"], category: "testingTools" },
  mocha: { files: [".mocharc.*", "mocha"], category: "testingTools" },
};

const CONFIG_FILES = [
  "package.json",
  "tsconfig.json",
  ".eslintrc*",
  "eslint.config.*",
  ".prettierrc*",
  "prettier.config.*",
  ".editorconfig",
  "docker-compose.*",
  "Dockerfile",
  ".env.example",
  ".gitignore",
  "Makefile",
  "nx.json",
  "lerna.json",
  "pnpm-workspace.yaml",
];

/**
 * Scan all package dependencies from various package managers
 */
async function scanDependencies(rootDir: string): Promise<PackageDependencies> {
  const deps: PackageDependencies = {};

  // Run all dependency scans in parallel
  const [js, python, rust, go, ruby, java, php, dotnet, swift, elixir] = await Promise.all([
    scanJavaScriptDependencies(rootDir),
    scanPythonDependencies(rootDir),
    scanRustDependencies(rootDir),
    scanGoDependencies(rootDir),
    scanRubyDependencies(rootDir),
    scanJavaDependencies(rootDir),
    scanPhpDependencies(rootDir),
    scanDotNetDependencies(rootDir),
    scanSwiftDependencies(rootDir),
    scanElixirDependencies(rootDir),
  ]);

  if (js) deps.javascript = js;
  if (python) deps.python = python;
  if (rust) deps.rust = rust;
  if (go) deps.go = go;
  if (ruby) deps.ruby = ruby;
  if (java) deps.java = java;
  if (php) deps.php = php;
  if (dotnet) deps.dotnet = dotnet;
  if (swift) deps.swift = swift;
  if (elixir) deps.elixir = elixir;

  return deps;
}

/**
 * Scan JavaScript/TypeScript dependencies from package.json
 */
async function scanJavaScriptDependencies(rootDir: string): Promise<PackageDependencies["javascript"] | null> {
  const pkgPath = join(rootDir, "package.json");
  if (!await pathExists(pkgPath)) return null;

  try {
    const pkg = await Bun.file(pkgPath).json();
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
      peerDependencies: pkg.peerDependencies,
      scripts: pkg.scripts,
    };
  } catch {
    return null;
  }
}

/**
 * Scan Python dependencies from requirements.txt, pyproject.toml, or Pipfile
 */
async function scanPythonDependencies(rootDir: string): Promise<PackageDependencies["python"] | null> {
  // Try pyproject.toml first (modern Python)
  const pyprojectPath = join(rootDir, "pyproject.toml");
  if (await pathExists(pyprojectPath)) {
    try {
      const content = await Bun.file(pyprojectPath).text();
      const deps = parsePyprojectToml(content);
      if (deps.length > 0) {
        return {
          dependencies: deps,
          source: "pyproject.toml",
        };
      }
    } catch {
      // Continue to next format
    }
  }

  // Try requirements.txt
  const requirementsPath = join(rootDir, "requirements.txt");
  if (await pathExists(requirementsPath)) {
    try {
      const content = await Bun.file(requirementsPath).text();
      const deps = parseRequirementsTxt(content);
      if (deps.length > 0) {
        return {
          dependencies: deps,
          source: "requirements.txt",
        };
      }
    } catch {
      // Continue to next format
    }
  }

  // Try Pipfile
  const pipfilePath = join(rootDir, "Pipfile");
  if (await pathExists(pipfilePath)) {
    try {
      const content = await Bun.file(pipfilePath).text();
      const result = parsePipfile(content);
      if (result.dependencies.length > 0) {
        return {
          dependencies: result.dependencies,
          devDependencies: result.devDependencies,
          source: "Pipfile",
        };
      }
    } catch {
      // Continue
    }
  }

  // Try setup.py (legacy)
  const setupPath = join(rootDir, "setup.py");
  if (await pathExists(setupPath)) {
    try {
      const content = await Bun.file(setupPath).text();
      const deps = parseSetupPy(content);
      if (deps.length > 0) {
        return {
          dependencies: deps,
          source: "setup.py",
        };
      }
    } catch {
      // Continue
    }
  }

  return null;
}

/**
 * Parse pyproject.toml for dependencies
 */
function parsePyprojectToml(content: string): Array<{ name: string; version?: string; extras?: string[] }> {
  const deps: Array<{ name: string; version?: string; extras?: string[] }> = [];

  // Match [project.dependencies] or [tool.poetry.dependencies]
  const depsMatch = content.match(/\[(?:project\.dependencies|tool\.poetry\.dependencies)\]([\s\S]*?)(?=\n\[|$)/);
  if (depsMatch) {
    const section = depsMatch[1];
    // Parse each line
    const lines = section.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      // Poetry format: package = "^1.0.0" or package = {version = "^1.0.0", extras = ["..."]}
      const poetryMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*["']([^"']+)["']/);
      if (poetryMatch) {
        deps.push({ name: poetryMatch[1], version: poetryMatch[2] });
        continue;
      }

      // Poetry complex format
      const poetryComplexMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{.*version\s*=\s*["']([^"']+)["']/);
      if (poetryComplexMatch) {
        deps.push({ name: poetryComplexMatch[1], version: poetryComplexMatch[2] });
        continue;
      }
    }
  }

  // Match dependencies array format (PEP 621)
  const arrayMatch = content.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (arrayMatch) {
    const arrayContent = arrayMatch[1];
    const depMatches = arrayContent.matchAll(/["']([^"']+)["']/g);
    for (const match of depMatches) {
      const depSpec = match[1];
      // Parse "package>=1.0.0" or "package[extra]>=1.0.0"
      const parsed = parseRequirementSpec(depSpec);
      if (parsed) deps.push(parsed);
    }
  }

  return deps;
}

/**
 * Parse requirements.txt format
 */
function parseRequirementsTxt(content: string): Array<{ name: string; version?: string; extras?: string[] }> {
  const deps: Array<{ name: string; version?: string; extras?: string[] }> = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines, comments, and options
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) continue;

    const parsed = parseRequirementSpec(trimmed);
    if (parsed) deps.push(parsed);
  }

  return deps;
}

/**
 * Parse a single requirement spec like "package>=1.0.0" or "package[extra1,extra2]>=1.0.0"
 */
function parseRequirementSpec(spec: string): { name: string; version?: string; extras?: string[] } | null {
  // Match: package[extras]>=version or package>=version or just package
  const match = spec.match(/^([a-zA-Z0-9_-]+)(?:\[([^\]]+)\])?(?:\s*([><=!~]+.*))?/);
  if (!match) return null;

  const result: { name: string; version?: string; extras?: string[] } = {
    name: match[1],
  };

  if (match[3]) {
    result.version = match[3].trim();
  }

  if (match[2]) {
    result.extras = match[2].split(",").map(e => e.trim());
  }

  return result;
}

/**
 * Parse Pipfile format
 */
function parsePipfile(content: string): { dependencies: Array<{ name: string; version?: string }>; devDependencies: Array<{ name: string; version?: string }> } {
  const result = {
    dependencies: [] as Array<{ name: string; version?: string }>,
    devDependencies: [] as Array<{ name: string; version?: string }>,
  };

  // Parse [packages] section
  const packagesMatch = content.match(/\[packages\]([\s\S]*?)(?=\n\[|$)/);
  if (packagesMatch) {
    result.dependencies = parsePipfileSection(packagesMatch[1]);
  }

  // Parse [dev-packages] section
  const devPackagesMatch = content.match(/\[dev-packages\]([\s\S]*?)(?=\n\[|$)/);
  if (devPackagesMatch) {
    result.devDependencies = parsePipfileSection(devPackagesMatch[1]);
  }

  return result;
}

function parsePipfileSection(section: string): Array<{ name: string; version?: string }> {
  const deps: Array<{ name: string; version?: string }> = [];
  const lines = section.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*["']?([^"'\s]*)["']?/);
    if (match) {
      deps.push({
        name: match[1],
        version: match[2] !== "*" ? match[2] : undefined,
      });
    }
  }

  return deps;
}

/**
 * Parse setup.py for install_requires
 */
function parseSetupPy(content: string): Array<{ name: string; version?: string }> {
  const deps: Array<{ name: string; version?: string }> = [];

  // Match install_requires=[...] or install_requires = [...]
  const match = content.match(/install_requires\s*=\s*\[([\s\S]*?)\]/);
  if (match) {
    const requiresContent = match[1];
    const depMatches = requiresContent.matchAll(/["']([^"']+)["']/g);
    for (const depMatch of depMatches) {
      const parsed = parseRequirementSpec(depMatch[1]);
      if (parsed) deps.push(parsed);
    }
  }

  return deps;
}

/**
 * Scan Rust dependencies from Cargo.toml
 */
async function scanRustDependencies(rootDir: string): Promise<PackageDependencies["rust"] | null> {
  const cargoPath = join(rootDir, "Cargo.toml");
  if (!await pathExists(cargoPath)) return null;

  try {
    const content = await Bun.file(cargoPath).text();
    const deps: Record<string, string | { version: string; features?: string[] }> = {};
    const devDeps: Record<string, string | { version: string }> = {};

    // Parse [dependencies] section
    const depsMatch = content.match(/\[dependencies\]([\s\S]*?)(?=\n\[|$)/);
    if (depsMatch) {
      Object.assign(deps, parseCargoSection(depsMatch[1]));
    }

    // Parse [dev-dependencies] section
    const devDepsMatch = content.match(/\[dev-dependencies\]([\s\S]*?)(?=\n\[|$)/);
    if (devDepsMatch) {
      Object.assign(devDeps, parseCargoSection(devDepsMatch[1]));
    }

    if (Object.keys(deps).length === 0 && Object.keys(devDeps).length === 0) {
      return null;
    }

    return {
      dependencies: deps,
      devDependencies: Object.keys(devDeps).length > 0 ? devDeps : undefined,
    };
  } catch {
    return null;
  }
}

function parseCargoSection(section: string): Record<string, string | { version: string; features?: string[] }> {
  const deps: Record<string, string | { version: string; features?: string[] }> = {};
  const lines = section.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Simple format: package = "version"
    const simpleMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*["']([^"']+)["']/);
    if (simpleMatch) {
      deps[simpleMatch[1]] = simpleMatch[2];
      continue;
    }

    // Complex format: package = { version = "...", features = [...] }
    const complexMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{(.*)\}/);
    if (complexMatch) {
      const versionMatch = complexMatch[2].match(/version\s*=\s*["']([^"']+)["']/);
      const featuresMatch = complexMatch[2].match(/features\s*=\s*\[(.*?)\]/);

      if (versionMatch) {
        const dep: { version: string; features?: string[] } = { version: versionMatch[1] };
        if (featuresMatch) {
          dep.features = featuresMatch[1].split(",").map(f => f.trim().replace(/["']/g, "")).filter(Boolean);
        }
        deps[complexMatch[1]] = dep;
      }
    }
  }

  return deps;
}

/**
 * Scan Go dependencies from go.mod
 */
async function scanGoDependencies(rootDir: string): Promise<PackageDependencies["go"] | null> {
  const goModPath = join(rootDir, "go.mod");
  if (!await pathExists(goModPath)) return null;

  try {
    const content = await Bun.file(goModPath).text();
    const deps: Array<{ path: string; version: string }> = [];

    // Get module name
    const moduleMatch = content.match(/^module\s+(\S+)/m);
    const module = moduleMatch ? moduleMatch[1] : "unknown";

    // Get Go version
    const goVersionMatch = content.match(/^go\s+(\S+)/m);
    const goVersion = goVersionMatch ? goVersionMatch[1] : undefined;

    // Parse require block
    const requireBlockMatch = content.match(/require\s*\(([\s\S]*?)\)/);
    if (requireBlockMatch) {
      const lines = requireBlockMatch[1].split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("//")) continue;

        const match = trimmed.match(/^(\S+)\s+(\S+)/);
        if (match) {
          deps.push({ path: match[1], version: match[2] });
        }
      }
    }

    // Also parse single-line require statements
    const singleRequires = content.matchAll(/^require\s+(\S+)\s+(\S+)/gm);
    for (const match of singleRequires) {
      deps.push({ path: match[1], version: match[2] });
    }

    if (deps.length === 0) return null;

    return { module, goVersion, dependencies: deps };
  } catch {
    return null;
  }
}

/**
 * Scan Ruby dependencies from Gemfile
 */
async function scanRubyDependencies(rootDir: string): Promise<PackageDependencies["ruby"] | null> {
  const gemfilePath = join(rootDir, "Gemfile");
  if (!await pathExists(gemfilePath)) return null;

  try {
    const content = await Bun.file(gemfilePath).text();
    const deps: Array<{ name: string; version?: string; groups?: string[] }> = [];

    // Parse gem lines: gem 'name', '~> 1.0', group: :development
    const gemMatches = content.matchAll(/gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?(?:.*?(?:group:|:group\s*=>)\s*[:\[]?([a-zA-Z_,\s]+)\]?)?/g);
    for (const match of gemMatches) {
      const dep: { name: string; version?: string; groups?: string[] } = {
        name: match[1],
      };
      if (match[2]) dep.version = match[2];
      if (match[3]) {
        dep.groups = match[3].split(/[,\s]+/).map(g => g.replace(/^:/, "").trim()).filter(Boolean);
      }
      deps.push(dep);
    }

    if (deps.length === 0) return null;
    return { dependencies: deps };
  } catch {
    return null;
  }
}

/**
 * Scan Java dependencies from pom.xml or build.gradle
 */
async function scanJavaDependencies(rootDir: string): Promise<PackageDependencies["java"] | null> {
  // Try pom.xml first
  const pomPath = join(rootDir, "pom.xml");
  if (await pathExists(pomPath)) {
    try {
      const content = await Bun.file(pomPath).text();
      const deps = parsePomXml(content);
      if (deps.length > 0) {
        return { dependencies: deps, source: "pom.xml" };
      }
    } catch {
      // Continue
    }
  }

  // Try build.gradle.kts
  const gradleKtsPath = join(rootDir, "build.gradle.kts");
  if (await pathExists(gradleKtsPath)) {
    try {
      const content = await Bun.file(gradleKtsPath).text();
      const deps = parseGradleDependencies(content);
      if (deps.length > 0) {
        return { dependencies: deps, source: "build.gradle.kts" };
      }
    } catch {
      // Continue
    }
  }

  // Try build.gradle
  const gradlePath = join(rootDir, "build.gradle");
  if (await pathExists(gradlePath)) {
    try {
      const content = await Bun.file(gradlePath).text();
      const deps = parseGradleDependencies(content);
      if (deps.length > 0) {
        return { dependencies: deps, source: "build.gradle" };
      }
    } catch {
      // Continue
    }
  }

  return null;
}

function parsePomXml(content: string): Array<{ groupId: string; artifactId: string; version?: string; scope?: string }> {
  const deps: Array<{ groupId: string; artifactId: string; version?: string; scope?: string }> = [];

  // Simple regex parsing for <dependency> blocks
  const depMatches = content.matchAll(/<dependency>([\s\S]*?)<\/dependency>/g);
  for (const match of depMatches) {
    const depContent = match[1];
    const groupId = depContent.match(/<groupId>([^<]+)<\/groupId>/)?.[1];
    const artifactId = depContent.match(/<artifactId>([^<]+)<\/artifactId>/)?.[1];
    const version = depContent.match(/<version>([^<]+)<\/version>/)?.[1];
    const scope = depContent.match(/<scope>([^<]+)<\/scope>/)?.[1];

    if (groupId && artifactId) {
      deps.push({ groupId, artifactId, version, scope });
    }
  }

  return deps;
}

function parseGradleDependencies(content: string): Array<{ groupId: string; artifactId: string; version?: string; scope?: string }> {
  const deps: Array<{ groupId: string; artifactId: string; version?: string; scope?: string }> = [];

  // Match implementation 'group:artifact:version' or implementation("group:artifact:version")
  const depMatches = content.matchAll(/(?:implementation|api|compileOnly|runtimeOnly|testImplementation|testCompileOnly|testRuntimeOnly)\s*[('"]([^'"()]+)['")\]]/g);
  for (const match of depMatches) {
    const parts = match[1].split(":");
    if (parts.length >= 2) {
      deps.push({
        groupId: parts[0],
        artifactId: parts[1],
        version: parts[2],
        scope: match[0].split(/[('"\s]/)[0],
      });
    }
  }

  return deps;
}

/**
 * Scan PHP dependencies from composer.json
 */
async function scanPhpDependencies(rootDir: string): Promise<PackageDependencies["php"] | null> {
  const composerPath = join(rootDir, "composer.json");
  if (!await pathExists(composerPath)) return null;

  try {
    const composer = await Bun.file(composerPath).json();
    const deps = composer.require || {};
    const devDeps = composer["require-dev"] || {};

    // Filter out PHP version requirement
    const filteredDeps: Record<string, string> = {};
    for (const [key, value] of Object.entries(deps)) {
      if (key !== "php" && !key.startsWith("ext-")) {
        filteredDeps[key] = value as string;
      }
    }

    if (Object.keys(filteredDeps).length === 0 && Object.keys(devDeps).length === 0) {
      return null;
    }

    return {
      dependencies: filteredDeps,
      devDependencies: Object.keys(devDeps).length > 0 ? devDeps : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Scan .NET dependencies from *.csproj
 */
async function scanDotNetDependencies(rootDir: string): Promise<PackageDependencies["dotnet"] | null> {
  try {
    const entries = await readdir(rootDir);
    const csprojFile = entries.find(e => e.endsWith(".csproj"));
    if (!csprojFile) return null;

    const content = await Bun.file(join(rootDir, csprojFile)).text();
    const deps: Array<{ name: string; version: string }> = [];

    // Parse <PackageReference Include="..." Version="..." />
    const depMatches = content.matchAll(/<PackageReference\s+Include=["']([^"']+)["']\s+Version=["']([^"']+)["']/g);
    for (const match of depMatches) {
      deps.push({ name: match[1], version: match[2] });
    }

    // Get target framework
    const frameworkMatch = content.match(/<TargetFramework>([^<]+)<\/TargetFramework>/);
    const targetFramework = frameworkMatch ? frameworkMatch[1] : undefined;

    if (deps.length === 0) return null;
    return { dependencies: deps, targetFramework };
  } catch {
    return null;
  }
}

/**
 * Scan Swift dependencies from Package.swift
 */
async function scanSwiftDependencies(rootDir: string): Promise<PackageDependencies["swift"] | null> {
  const packagePath = join(rootDir, "Package.swift");
  if (!await pathExists(packagePath)) return null;

  try {
    const content = await Bun.file(packagePath).text();
    const deps: Array<{ url: string; version?: string }> = [];

    // Match .package(url: "...", from: "...") or .package(url: "...", .upToNextMajor(...))
    const depMatches = content.matchAll(/\.package\s*\(\s*url:\s*["']([^"']+)["'].*?(?:from:\s*["']([^"']+)["']|\.upToNextMajor\s*\(\s*from:\s*["']([^"']+)["']\))?/g);
    for (const match of depMatches) {
      deps.push({
        url: match[1],
        version: match[2] || match[3],
      });
    }

    if (deps.length === 0) return null;
    return { dependencies: deps };
  } catch {
    return null;
  }
}

/**
 * Scan Elixir dependencies from mix.exs
 */
async function scanElixirDependencies(rootDir: string): Promise<PackageDependencies["elixir"] | null> {
  const mixPath = join(rootDir, "mix.exs");
  if (!await pathExists(mixPath)) return null;

  try {
    const content = await Bun.file(mixPath).text();
    const deps: Array<{ name: string; version?: string }> = [];

    // Match {:dep_name, "~> 1.0"} or {:dep_name, ">= 0.0.0"}
    const depMatches = content.matchAll(/\{:([a-zA-Z0-9_]+)\s*,\s*["']([^"']+)["']/g);
    for (const match of depMatches) {
      deps.push({ name: match[1], version: match[2] });
    }

    if (deps.length === 0) return null;
    return { dependencies: deps };
  } catch {
    return null;
  }
}

/**
 * Scan a project directory and extract context
 */
export async function scanProject(rootDir: string): Promise<ProjectContext> {
  const name = basename(rootDir);

  // Run scans in parallel
  const [techStack, structure, configFiles, gitInfo, dependencies] = await Promise.all([
    detectTechStack(rootDir),
    analyzeStructure(rootDir),
    findConfigFiles(rootDir),
    getGitInfo(rootDir),
    scanDependencies(rootDir),
  ]);

  const patterns = await detectPatterns(rootDir, techStack, configFiles);

  return {
    name,
    rootDir,
    techStack,
    structure,
    patterns,
    configFiles,
    gitInfo,
    dependencies,
  };
}

/**
 * Detect technology stack from files
 */
async function detectTechStack(rootDir: string): Promise<TechStack> {
  const stack: TechStack = {
    languages: [],
    frameworks: [],
    buildTools: [],
    testingTools: [],
    packageManager: null,
    runtime: null,
  };

  // Check for package manager
  if (await pathExists(join(rootDir, "pnpm-lock.yaml"))) {
    stack.packageManager = "pnpm";
  } else if (await pathExists(join(rootDir, "yarn.lock"))) {
    stack.packageManager = "yarn";
  } else if (await pathExists(join(rootDir, "bun.lockb")) || await pathExists(join(rootDir, "bun.lock"))) {
    stack.packageManager = "bun";
    stack.runtime = "bun";
  } else if (await pathExists(join(rootDir, "package-lock.json"))) {
    stack.packageManager = "npm";
  }

  // Check for runtime
  if (await pathExists(join(rootDir, "deno.json")) || await pathExists(join(rootDir, "deno.jsonc"))) {
    stack.runtime = "deno";
  } else if (!stack.runtime && await pathExists(join(rootDir, "package.json"))) {
    stack.runtime = "node";
  }

  // Read package.json for dependencies
  const pkgPath = join(rootDir, "package.json");
  if (await pathExists(pkgPath)) {
    try {
      const pkg = await Bun.file(pkgPath).json();
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      // Detect from dependencies
      for (const [tech, config] of Object.entries(TECH_DETECTORS)) {
        for (const pattern of config.files) {
          if (!pattern.includes(".") && !pattern.includes("*")) {
            // It's a dependency name
            if (allDeps[pattern]) {
              if (!stack[config.category].includes(tech)) {
                stack[config.category].push(tech);
              }
            }
          }
        }
      }

      // Special detections from dependencies
      if (allDeps["typescript"]) stack.languages.push("typescript");
      if (allDeps["react"]) stack.frameworks.push("react");
      if (allDeps["next"]) stack.frameworks.push("nextjs");
      if (allDeps["@nestjs/core"]) stack.frameworks.push("nestjs");
      if (allDeps["vue"]) stack.frameworks.push("vue");
      if (allDeps["express"]) stack.frameworks.push("express");
      if (allDeps["fastify"]) stack.frameworks.push("fastify");
      if (allDeps["vite"]) stack.buildTools.push("vite");
      if (allDeps["jest"]) stack.testingTools.push("jest");
      if (allDeps["vitest"]) stack.testingTools.push("vitest");
      if (allDeps["playwright"]) stack.testingTools.push("playwright");
    } catch {
      // Ignore JSON parse errors
    }
  }

  // Detect from config files
  for (const [tech, config] of Object.entries(TECH_DETECTORS)) {
    for (const pattern of config.files) {
      if (pattern.includes(".")) {
        const fileName = pattern.replace("*", "");
        if (await pathExists(join(rootDir, fileName)) ||
            await pathExists(join(rootDir, pattern.replace("*", "js"))) ||
            await pathExists(join(rootDir, pattern.replace("*", "ts")))) {
          if (!stack[config.category].includes(tech)) {
            stack[config.category].push(tech);
          }
        }
      }
    }
  }

  // Deduplicate
  stack.languages = [...new Set(stack.languages)];
  stack.frameworks = [...new Set(stack.frameworks)];
  stack.buildTools = [...new Set(stack.buildTools)];
  stack.testingTools = [...new Set(stack.testingTools)];

  return stack;
}

/**
 * Analyze project structure
 */
async function analyzeStructure(rootDir: string): Promise<ProjectStructure> {
  const structure: ProjectStructure = {
    hasMonorepo: false,
    srcDir: null,
    testDir: null,
    docsDir: null,
    configDir: null,
    entryPoints: [],
    directories: [],
  };

  // Check for monorepo markers
  structure.hasMonorepo =
    await pathExists(join(rootDir, "pnpm-workspace.yaml")) ||
    await pathExists(join(rootDir, "lerna.json")) ||
    await pathExists(join(rootDir, "nx.json")) ||
    await pathExists(join(rootDir, "packages"));

  // Common directory patterns
  const dirPatterns = {
    src: ["src", "lib", "source", "app"],
    test: ["test", "tests", "__tests__", "spec", "specs"],
    docs: ["docs", "documentation", "doc"],
    config: ["config", "configs", ".config"],
  };

  try {
    const entries = await readdir(rootDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
        structure.directories.push(entry.name);

        // Match to common patterns
        const lowerName = entry.name.toLowerCase();
        if (dirPatterns.src.includes(lowerName) && !structure.srcDir) {
          structure.srcDir = entry.name;
        }
        if (dirPatterns.test.includes(lowerName) && !structure.testDir) {
          structure.testDir = entry.name;
        }
        if (dirPatterns.docs.includes(lowerName) && !structure.docsDir) {
          structure.docsDir = entry.name;
        }
        if (dirPatterns.config.includes(lowerName) && !structure.configDir) {
          structure.configDir = entry.name;
        }
      }
    }

    // Find entry points
    const entryPoints = ["index.ts", "index.js", "main.ts", "main.js", "app.ts", "app.js", "server.ts", "server.js"];
    for (const entry of entryPoints) {
      if (await pathExists(join(rootDir, entry))) {
        structure.entryPoints.push(entry);
      }
      if (structure.srcDir && await pathExists(join(rootDir, structure.srcDir, entry))) {
        structure.entryPoints.push(`${structure.srcDir}/${entry}`);
      }
    }
  } catch {
    // Ignore errors
  }

  return structure;
}

/**
 * Find configuration files
 */
async function findConfigFiles(rootDir: string): Promise<string[]> {
  const found: string[] = [];

  try {
    const entries = await readdir(rootDir);

    for (const entry of entries) {
      for (const pattern of CONFIG_FILES) {
        if (pattern.includes("*")) {
          const prefix = pattern.replace("*", "");
          if (entry.startsWith(prefix)) {
            found.push(entry);
          }
        } else if (entry === pattern) {
          found.push(entry);
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return found;
}

/**
 * Get git information
 */
async function getGitInfo(rootDir: string): Promise<GitInfo | null> {
  if (!await pathExists(join(rootDir, ".git"))) {
    return null;
  }

  const info: GitInfo = {
    isRepo: true,
    branch: null,
    hasRemote: false,
    uncommittedChanges: false,
  };

  try {
    // Get current branch
    const headFile = join(rootDir, ".git", "HEAD");
    if (await pathExists(headFile)) {
      const content = await Bun.file(headFile).text();
      const match = content.match(/ref: refs\/heads\/(.+)/);
      if (match) {
        info.branch = match[1].trim();
      }
    }

    // Check for remote
    const configFile = join(rootDir, ".git", "config");
    if (await pathExists(configFile)) {
      const content = await Bun.file(configFile).text();
      info.hasRemote = content.includes("[remote");
    }
  } catch {
    // Ignore errors
  }

  return info;
}

/**
 * Detect code patterns
 */
async function detectPatterns(
  rootDir: string,
  techStack: TechStack,
  configFiles: string[]
): Promise<DetectedPatterns> {
  const patterns: DetectedPatterns = {
    architecture: [],
    codeStyle: {
      usesTypeScript: techStack.languages.includes("typescript"),
      usesSemicolons: null,
      usesTabIndent: null,
      quoteStyle: null,
      hasLinter: false,
      hasFormatter: false,
    },
    testing: [],
    other: [],
  };

  // Detect architecture patterns
  if (techStack.frameworks.includes("nextjs")) {
    patterns.architecture.push("Next.js App/Pages Router");
  }
  if (techStack.frameworks.includes("nestjs")) {
    patterns.architecture.push("NestJS Modular Architecture");
  }
  if (await pathExists(join(rootDir, "src", "components"))) {
    patterns.architecture.push("Component-based UI");
  }
  if (await pathExists(join(rootDir, "src", "services"))) {
    patterns.architecture.push("Service Layer Pattern");
  }
  if (await pathExists(join(rootDir, "src", "repositories"))) {
    patterns.architecture.push("Repository Pattern");
  }
  if (await pathExists(join(rootDir, "src", "hooks"))) {
    patterns.architecture.push("Custom Hooks Pattern");
  }
  if (await pathExists(join(rootDir, "src", "store")) || await pathExists(join(rootDir, "src", "stores"))) {
    patterns.architecture.push("State Management");
  }

  // Check for linter/formatter
  patterns.codeStyle.hasLinter = configFiles.some(f =>
    f.includes("eslint") || f.includes(".eslintrc")
  );
  patterns.codeStyle.hasFormatter = configFiles.some(f =>
    f.includes("prettier") || f.includes(".prettierrc")
  );

  // Try to detect code style from config files
  if (patterns.codeStyle.hasFormatter) {
    try {
      const prettierFiles = configFiles.filter(f => f.includes("prettier"));
      for (const file of prettierFiles) {
        const content = await Bun.file(join(rootDir, file)).text();
        if (content.includes('"semi": false') || content.includes("semi: false")) {
          patterns.codeStyle.usesSemicolons = false;
        } else if (content.includes('"semi": true') || content.includes("semi: true")) {
          patterns.codeStyle.usesSemicolons = true;
        }
        if (content.includes('"singleQuote": true') || content.includes("singleQuote: true")) {
          patterns.codeStyle.quoteStyle = "single";
        } else if (content.includes('"singleQuote": false') || content.includes("singleQuote: false")) {
          patterns.codeStyle.quoteStyle = "double";
        }
        if (content.includes('"useTabs": true') || content.includes("useTabs: true")) {
          patterns.codeStyle.usesTabIndent = true;
        } else if (content.includes('"useTabs": false') || content.includes("useTabs: false")) {
          patterns.codeStyle.usesTabIndent = false;
        }
      }
    } catch {
      // Ignore errors
    }
  }

  // Detect testing patterns
  if (techStack.testingTools.length > 0) {
    patterns.testing.push(`Using ${techStack.testingTools.join(", ")}`);
  }
  if (await pathExists(join(rootDir, "__mocks__"))) {
    patterns.testing.push("Manual mocks");
  }
  if (await pathExists(join(rootDir, "fixtures")) || await pathExists(join(rootDir, "test", "fixtures"))) {
    patterns.testing.push("Test fixtures");
  }

  // Other patterns
  if (configFiles.includes("docker-compose.yml") || configFiles.includes("docker-compose.yaml")) {
    patterns.other.push("Docker Compose");
  }
  if (configFiles.includes("Dockerfile")) {
    patterns.other.push("Containerized");
  }
  if (await pathExists(join(rootDir, ".github", "workflows"))) {
    patterns.other.push("GitHub Actions CI/CD");
  }
  if (await pathExists(join(rootDir, ".husky"))) {
    patterns.other.push("Git hooks (Husky)");
  }

  return patterns;
}

/**
 * Generate a markdown section for dependencies
 */
function generateDependenciesSection(deps: PackageDependencies): string | null {
  const sections: string[] = [];
  let hasAnyDeps = false;

  // JavaScript/TypeScript
  if (deps.javascript) {
    hasAnyDeps = true;
    sections.push(`## Dependencies (JavaScript/TypeScript)

**Source:** \`package.json\`
`);

    const prodDeps = Object.entries(deps.javascript.dependencies);
    if (prodDeps.length > 0) {
      sections.push(`### Production Dependencies
| Package | Version |
|---------|---------|
${prodDeps.map(([name, version]) => `| ${name} | ${version} |`).join("\n")}
`);
    }

    const devDeps = Object.entries(deps.javascript.devDependencies);
    if (devDeps.length > 0) {
      sections.push(`### Dev Dependencies
| Package | Version |
|---------|---------|
${devDeps.map(([name, version]) => `| ${name} | ${version} |`).join("\n")}
`);
    }

    if (deps.javascript.scripts && Object.keys(deps.javascript.scripts).length > 0) {
      sections.push(`### Available Scripts
| Script | Command |
|--------|---------|
${Object.entries(deps.javascript.scripts).map(([name, cmd]) => `| ${name} | \`${cmd}\` |`).join("\n")}
`);
    }
  }

  // Python
  if (deps.python) {
    hasAnyDeps = true;
    sections.push(`## Dependencies (Python)

**Source:** \`${deps.python.source}\`

### Dependencies
| Package | Version |
|---------|---------|
${deps.python.dependencies.map(d => `| ${d.name}${d.extras ? `[${d.extras.join(",")}]` : ""} | ${d.version || "*"} |`).join("\n")}
`);
    if (deps.python.devDependencies && deps.python.devDependencies.length > 0) {
      sections.push(`### Dev Dependencies
| Package | Version |
|---------|---------|
${deps.python.devDependencies.map(d => `| ${d.name} | ${d.version || "*"} |`).join("\n")}
`);
    }
  }

  // Rust
  if (deps.rust) {
    hasAnyDeps = true;
    sections.push(`## Dependencies (Rust)

**Source:** \`Cargo.toml\`

### Dependencies
| Crate | Version |
|-------|---------|
${Object.entries(deps.rust.dependencies).map(([name, ver]) => {
  const version = typeof ver === "string" ? ver : ver.version;
  const features = typeof ver === "object" && ver.features ? ` (features: ${ver.features.join(", ")})` : "";
  return `| ${name} | ${version}${features} |`;
}).join("\n")}
`);
    if (deps.rust.devDependencies && Object.keys(deps.rust.devDependencies).length > 0) {
      sections.push(`### Dev Dependencies
| Crate | Version |
|-------|---------|
${Object.entries(deps.rust.devDependencies).map(([name, ver]) => {
  const version = typeof ver === "string" ? ver : ver.version;
  return `| ${name} | ${version} |`;
}).join("\n")}
`);
    }
  }

  // Go
  if (deps.go) {
    hasAnyDeps = true;
    sections.push(`## Dependencies (Go)

**Source:** \`go.mod\`
**Module:** \`${deps.go.module}\`
${deps.go.goVersion ? `**Go Version:** ${deps.go.goVersion}` : ""}

### Dependencies
| Module | Version |
|--------|---------|
${deps.go.dependencies.map(d => `| ${d.path} | ${d.version} |`).join("\n")}
`);
  }

  // Ruby
  if (deps.ruby) {
    hasAnyDeps = true;
    sections.push(`## Dependencies (Ruby)

**Source:** \`Gemfile\`

### Gems
| Gem | Version | Groups |
|-----|---------|--------|
${deps.ruby.dependencies.map(d => `| ${d.name} | ${d.version || "*"} | ${d.groups?.join(", ") || "-"} |`).join("\n")}
`);
  }

  // Java
  if (deps.java) {
    hasAnyDeps = true;
    sections.push(`## Dependencies (Java)

**Source:** \`${deps.java.source}\`

### Dependencies
| Group ID | Artifact ID | Version | Scope |
|----------|-------------|---------|-------|
${deps.java.dependencies.map(d => `| ${d.groupId} | ${d.artifactId} | ${d.version || "-"} | ${d.scope || "compile"} |`).join("\n")}
`);
  }

  // PHP
  if (deps.php) {
    hasAnyDeps = true;
    sections.push(`## Dependencies (PHP)

**Source:** \`composer.json\`

### Dependencies
| Package | Version |
|---------|---------|
${Object.entries(deps.php.dependencies).map(([name, version]) => `| ${name} | ${version} |`).join("\n")}
`);
    if (deps.php.devDependencies && Object.keys(deps.php.devDependencies).length > 0) {
      sections.push(`### Dev Dependencies
| Package | Version |
|---------|---------|
${Object.entries(deps.php.devDependencies).map(([name, version]) => `| ${name} | ${version} |`).join("\n")}
`);
    }
  }

  // .NET
  if (deps.dotnet) {
    hasAnyDeps = true;
    sections.push(`## Dependencies (.NET)

**Source:** \`*.csproj\`
${deps.dotnet.targetFramework ? `**Target Framework:** ${deps.dotnet.targetFramework}` : ""}

### Package References
| Package | Version |
|---------|---------|
${deps.dotnet.dependencies.map(d => `| ${d.name} | ${d.version} |`).join("\n")}
`);
  }

  // Swift
  if (deps.swift) {
    hasAnyDeps = true;
    sections.push(`## Dependencies (Swift)

**Source:** \`Package.swift\`

### Swift Package Dependencies
| URL | Version |
|-----|---------|
${deps.swift.dependencies.map(d => `| ${d.url} | ${d.version || "-"} |`).join("\n")}
`);
  }

  // Elixir
  if (deps.elixir) {
    hasAnyDeps = true;
    sections.push(`## Dependencies (Elixir)

**Source:** \`mix.exs\`

### Dependencies
| Package | Version |
|---------|---------|
${deps.elixir.dependencies.map(d => `| ${d.name} | ${d.version || "-"} |`).join("\n")}
`);
  }

  if (!hasAnyDeps) return null;
  return sections.join("\n");
}

/**
 * Generate a compact dependencies section for memory-bank techContext.md
 */
function generateDependenciesSectionForMemoryBank(deps: PackageDependencies): string {
  const sections: string[] = [];

  // JavaScript/TypeScript
  if (deps.javascript) {
    const prodDeps = Object.keys(deps.javascript.dependencies);
    const devDeps = Object.keys(deps.javascript.devDependencies);

    sections.push(`## Dependencies (package.json)

**Production (${prodDeps.length}):** ${prodDeps.slice(0, 20).join(", ")}${prodDeps.length > 20 ? ` ... and ${prodDeps.length - 20} more` : ""}

**Dev (${devDeps.length}):** ${devDeps.slice(0, 15).join(", ")}${devDeps.length > 15 ? ` ... and ${devDeps.length - 15} more` : ""}`);

    if (deps.javascript.scripts) {
      const scripts = Object.keys(deps.javascript.scripts);
      sections.push(`\n**Scripts:** ${scripts.join(", ")}`);
    }
  }

  // Python
  if (deps.python) {
    const depNames = deps.python.dependencies.map(d => d.name);
    sections.push(`## Dependencies (${deps.python.source})

**Packages (${depNames.length}):** ${depNames.slice(0, 20).join(", ")}${depNames.length > 20 ? ` ... and ${depNames.length - 20} more` : ""}`);
  }

  // Rust
  if (deps.rust) {
    const depNames = Object.keys(deps.rust.dependencies);
    sections.push(`## Dependencies (Cargo.toml)

**Crates (${depNames.length}):** ${depNames.slice(0, 20).join(", ")}${depNames.length > 20 ? ` ... and ${depNames.length - 20} more` : ""}`);
  }

  // Go
  if (deps.go) {
    const depPaths = deps.go.dependencies.map(d => d.path.split("/").pop() || d.path);
    sections.push(`## Dependencies (go.mod)

**Module:** ${deps.go.module}
**Go Version:** ${deps.go.goVersion || "not specified"}
**Packages (${deps.go.dependencies.length}):** ${depPaths.slice(0, 15).join(", ")}${depPaths.length > 15 ? ` ... and ${depPaths.length - 15} more` : ""}`);
  }

  // Ruby
  if (deps.ruby) {
    const gemNames = deps.ruby.dependencies.map(d => d.name);
    sections.push(`## Dependencies (Gemfile)

**Gems (${gemNames.length}):** ${gemNames.slice(0, 20).join(", ")}${gemNames.length > 20 ? ` ... and ${gemNames.length - 20} more` : ""}`);
  }

  // Java
  if (deps.java) {
    const artifactNames = deps.java.dependencies.map(d => d.artifactId);
    sections.push(`## Dependencies (${deps.java.source})

**Artifacts (${artifactNames.length}):** ${artifactNames.slice(0, 15).join(", ")}${artifactNames.length > 15 ? ` ... and ${artifactNames.length - 15} more` : ""}`);
  }

  // PHP
  if (deps.php) {
    const pkgNames = Object.keys(deps.php.dependencies);
    sections.push(`## Dependencies (composer.json)

**Packages (${pkgNames.length}):** ${pkgNames.slice(0, 20).join(", ")}${pkgNames.length > 20 ? ` ... and ${pkgNames.length - 20} more` : ""}`);
  }

  // .NET
  if (deps.dotnet) {
    const pkgNames = deps.dotnet.dependencies.map(d => d.name);
    sections.push(`## Dependencies (.csproj)

**Target Framework:** ${deps.dotnet.targetFramework || "not specified"}
**Packages (${pkgNames.length}):** ${pkgNames.slice(0, 20).join(", ")}${pkgNames.length > 20 ? ` ... and ${pkgNames.length - 20} more` : ""}`);
  }

  // Swift
  if (deps.swift) {
    const pkgNames = deps.swift.dependencies.map(d => d.url.split("/").pop()?.replace(".git", "") || d.url);
    sections.push(`## Dependencies (Package.swift)

**Packages (${pkgNames.length}):** ${pkgNames.join(", ")}`);
  }

  // Elixir
  if (deps.elixir) {
    const pkgNames = deps.elixir.dependencies.map(d => d.name);
    sections.push(`## Dependencies (mix.exs)

**Packages (${pkgNames.length}):** ${pkgNames.slice(0, 20).join(", ")}${pkgNames.length > 20 ? ` ... and ${pkgNames.length - 20} more` : ""}`);
  }

  return sections.join("\n\n");
}

/**
 * Generate CLAUDE.md content from project context
 */
export function generateClaudeMd(context: ProjectContext): string {
  const sections: string[] = [];

  // Header
  sections.push(`# ${context.name} - Project Rules for Claude

This file contains project-specific rules and context for Claude Code.
`);

  // Tech Stack
  sections.push(`## Tech Stack
`);
  if (context.techStack.languages.length > 0) {
    sections.push(`**Languages:** ${context.techStack.languages.join(", ")}`);
  }
  if (context.techStack.frameworks.length > 0) {
    sections.push(`**Frameworks:** ${context.techStack.frameworks.join(", ")}`);
  }
  if (context.techStack.buildTools.length > 0) {
    sections.push(`**Build Tools:** ${context.techStack.buildTools.join(", ")}`);
  }
  if (context.techStack.testingTools.length > 0) {
    sections.push(`**Testing:** ${context.techStack.testingTools.join(", ")}`);
  }
  if (context.techStack.packageManager) {
    sections.push(`**Package Manager:** ${context.techStack.packageManager}`);
  }
  if (context.techStack.runtime) {
    sections.push(`**Runtime:** ${context.techStack.runtime}`);
  }
  sections.push("");

  // Dependencies
  const depsSection = generateDependenciesSection(context.dependencies);
  if (depsSection) {
    sections.push(depsSection);
  }

  // Project Structure
  sections.push(`## Project Structure
`);
  if (context.structure.srcDir) {
    sections.push(`- Source code: \`${context.structure.srcDir}/\``);
  }
  if (context.structure.testDir) {
    sections.push(`- Tests: \`${context.structure.testDir}/\``);
  }
  if (context.structure.docsDir) {
    sections.push(`- Documentation: \`${context.structure.docsDir}/\``);
  }
  if (context.structure.entryPoints.length > 0) {
    sections.push(`- Entry points: ${context.structure.entryPoints.map(e => `\`${e}\``).join(", ")}`);
  }
  if (context.structure.hasMonorepo) {
    sections.push(`- **Monorepo structure detected**`);
  }
  sections.push("");

  // Code Style
  sections.push(`## Code Style
`);
  const style = context.patterns.codeStyle;
  if (style.usesTypeScript) {
    sections.push(`- Use TypeScript for all new code`);
  }
  if (style.usesSemicolons !== null) {
    sections.push(`- ${style.usesSemicolons ? "Use semicolons" : "No semicolons (omit them)"}`);
  }
  if (style.quoteStyle) {
    sections.push(`- Use ${style.quoteStyle} quotes for strings`);
  }
  if (style.usesTabIndent !== null) {
    sections.push(`- ${style.usesTabIndent ? "Use tabs for indentation" : "Use spaces for indentation"}`);
  }
  if (style.hasLinter) {
    sections.push(`- ESLint is configured - follow existing lint rules`);
  }
  if (style.hasFormatter) {
    sections.push(`- Prettier is configured - code will be auto-formatted`);
  }
  sections.push("");

  // Architecture Patterns
  if (context.patterns.architecture.length > 0) {
    sections.push(`## Architecture Patterns
`);
    for (const pattern of context.patterns.architecture) {
      sections.push(`- ${pattern}`);
    }
    sections.push("");
  }

  // Testing
  if (context.patterns.testing.length > 0) {
    sections.push(`## Testing
`);
    for (const pattern of context.patterns.testing) {
      sections.push(`- ${pattern}`);
    }
    sections.push("");
  }

  // Development Workflow
  sections.push(`## Development Workflow
`);
  if (context.techStack.packageManager) {
    sections.push(`\`\`\`bash
# Install dependencies
${context.techStack.packageManager} install

# Run development server
${context.techStack.packageManager} run dev

# Run tests
${context.techStack.packageManager} run test

# Build for production
${context.techStack.packageManager} run build
\`\`\`
`);
  }

  // Important Notes
  sections.push(`## Important Notes

- Always read memory-bank files at the start of each session
- Update memory-bank/activeContext.md when starting new work
- Update memory-bank/progress.md after completing features
- Follow existing patterns in the codebase
- Run tests before committing changes
`);

  return sections.join("\n");
}

/**
 * Generate memory bank files from project context
 */
export function generateMemoryBankFiles(context: ProjectContext): Record<string, string> {
  const files: Record<string, string> = {};

  // projectbrief.md
  files["projectbrief.md"] = `# Project Brief: ${context.name}

## Overview
${context.name} is a ${context.techStack.frameworks.length > 0 ? context.techStack.frameworks.join("/") + " " : ""}${context.techStack.languages.join("/")} project.

## Core Requirements
<!-- Define the core requirements of this project -->
- [ ] TODO: Define primary requirement 1
- [ ] TODO: Define primary requirement 2
- [ ] TODO: Define primary requirement 3

## Goals
<!-- What does success look like? -->
- [ ] TODO: Define goal 1
- [ ] TODO: Define goal 2

## Scope

### In Scope
- ${context.techStack.frameworks.join(", ") || "Application"} development
- ${context.patterns.testing.length > 0 ? "Testing with " + context.techStack.testingTools.join(", ") : "Testing"}

### Out of Scope
<!-- What is explicitly not part of this project? -->
- TODO: Define out of scope items
`;

  // productContext.md
  files["productContext.md"] = `# Product Context

## Problem Statement
<!-- What problem does this project solve? -->
TODO: Describe the problem this project addresses

## Solution
<!-- How does this project solve it? -->
TODO: Describe the solution approach

## User Experience
<!-- How should users interact with this? -->
TODO: Describe the intended user experience

## Success Criteria
- [ ] TODO: Define measurable success criteria
`;

  // techContext.md - with dependencies
  const depsForMemoryBank = generateDependenciesSectionForMemoryBank(context.dependencies);

  files["techContext.md"] = `# Tech Context

## Stack
${context.techStack.languages.map(l => `- **${l}**: Primary language`).join("\n")}
${context.techStack.frameworks.map(f => `- **${f}**: Framework`).join("\n")}
${context.techStack.buildTools.map(b => `- **${b}**: Build tool`).join("\n")}
${context.techStack.testingTools.map(t => `- **${t}**: Testing`).join("\n")}
${context.techStack.packageManager ? `- **${context.techStack.packageManager}**: Package manager` : ""}
${context.techStack.runtime ? `- **${context.techStack.runtime}**: Runtime` : ""}

## Development Setup
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd ${context.name}

# Install dependencies
${context.techStack.packageManager || "npm"} install

# Start development
${context.techStack.packageManager || "npm"} run dev
\`\`\`

## Project Structure
\`\`\`
${context.name}/
${context.structure.srcDir ? `├── ${context.structure.srcDir}/          # Source code` : ""}
${context.structure.testDir ? `├── ${context.structure.testDir}/         # Tests` : ""}
${context.structure.docsDir ? `├── ${context.structure.docsDir}/         # Documentation` : ""}
${context.configFiles.slice(0, 5).map(f => `├── ${f}`).join("\n")}
\`\`\`

## Configuration Files
${context.configFiles.map(f => `- \`${f}\``).join("\n")}

${depsForMemoryBank}

## Environment Variables
<!-- List required environment variables -->
\`\`\`bash
# Example .env
# TODO: Add environment variables
\`\`\`

## Constraints
- ${context.patterns.codeStyle.usesTypeScript ? "TypeScript strict mode enabled" : "JavaScript project"}
${context.patterns.codeStyle.hasLinter ? "- ESLint rules must pass" : ""}
${context.patterns.codeStyle.hasFormatter ? "- Prettier formatting required" : ""}
`;

  // systemPatterns.md
  files["systemPatterns.md"] = `# System Patterns

## Architecture
${context.patterns.architecture.length > 0
  ? context.patterns.architecture.map(p => `- ${p}`).join("\n")
  : "TODO: Document the system architecture"}

## Key Patterns

${context.patterns.architecture.includes("Component-based UI") ? `### Component Pattern
- Components are organized in \`${context.structure.srcDir || "src"}/components/\`
- Each component should be self-contained
- Use composition over inheritance
` : ""}

${context.patterns.architecture.includes("Service Layer Pattern") ? `### Service Layer
- Services handle business logic
- Located in \`${context.structure.srcDir || "src"}/services/\`
- Services are injected where needed
` : ""}

${context.patterns.architecture.includes("Custom Hooks Pattern") ? `### Custom Hooks
- Reusable logic extracted to hooks
- Located in \`${context.structure.srcDir || "src"}/hooks/\`
- Hooks start with "use" prefix
` : ""}

## Component Relationships
<!-- Document how major components interact -->
TODO: Add component relationship diagram or description

## Design Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| ${context.techStack.frameworks[0] || "Framework"} | TODO: Why this choice | ${new Date().toISOString().split("T")[0]} |
${context.patterns.codeStyle.usesTypeScript ? `| TypeScript | Type safety and better DX | ${new Date().toISOString().split("T")[0]} |` : ""}
`;

  // activeContext.md
  files["activeContext.md"] = `# Active Context

## Current Focus
<!-- What are we working on right now? -->
Project initialization and setup with codekit

## Recent Changes
- Initialized memory bank with codekit learn command
- Created CLAUDE.md project rules

## Next Steps
1. Review and customize projectbrief.md
2. Update productContext.md with actual product details
3. Document specific system patterns
4. Begin development work

## Active Decisions
- TODO: Document any decisions being considered

## Blockers
- None currently
`;

  // progress.md
  files["progress.md"] = `# Progress

## Completed
- [x] Project scanned and analyzed by codekit
- [x] Memory bank initialized
- [x] CLAUDE.md created with project rules

## In Progress
- [ ] Customizing memory bank files with project specifics

## Planned
- [ ] TODO: Add planned features/tasks

## Known Issues
- None documented yet

## Metrics
- Last updated: ${new Date().toISOString()}
- Memory bank initialized: Yes
`;

  return files;
}
