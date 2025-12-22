#!/usr/bin/env bun
/**
 * Build script for codekit
 * Compiles the CLI to standalone binaries for multiple platforms
 */

import { $ } from "bun";
import { mkdir, rm } from "fs/promises";
import { join } from "path";

const ROOT_DIR = join(import.meta.dir, "..");
const DIST_DIR = join(ROOT_DIR, "dist");

interface BuildTarget {
  name: string;
  target: string;
  extension: string;
}

const TARGETS: BuildTarget[] = [
  { name: "darwin-arm64", target: "bun-darwin-arm64", extension: "" },
  { name: "darwin-x64", target: "bun-darwin-x64", extension: "" },
  { name: "linux-x64", target: "bun-linux-x64", extension: "" },
  { name: "linux-arm64", target: "bun-linux-arm64", extension: "" },
  { name: "windows-x64", target: "bun-windows-x64", extension: ".exe" },
];

async function build(targetOnly?: string): Promise<void> {
  console.log("🔨 Building codekit...\n");

  // 1. Generate VFS
  console.log("📦 Generating template VFS...");
  await $`bun run ${join(ROOT_DIR, "scripts/generate-vfs.ts")}`;

  // 2. Type check
  console.log("\n🔍 Type checking...");
  try {
    await $`bun x tsc --noEmit`.cwd(ROOT_DIR);
    console.log("✓ Type check passed");
  } catch (error) {
    console.error("✗ Type check failed");
    process.exit(1);
  }

  // 3. Clean dist directory
  console.log("\n🧹 Cleaning dist directory...");
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });

  // 4. Build binaries
  console.log("\n🏗️  Building binaries...");

  const targets = targetOnly
    ? TARGETS.filter((t) => t.name === targetOnly)
    : TARGETS;

  if (targets.length === 0) {
    console.error(`Unknown target: ${targetOnly}`);
    console.log("Available targets:", TARGETS.map((t) => t.name).join(", "));
    process.exit(1);
  }

  for (const { name, target, extension } of targets) {
    const outfile = join(DIST_DIR, `codekit-${name}${extension}`);
    console.log(`  Building ${name}...`);

    try {
      await $`bun build ${join(ROOT_DIR, "src/index.ts")} --compile --target=${target} --outfile=${outfile}`.cwd(ROOT_DIR);
      console.log(`  ✓ Built ${outfile}`);
    } catch (error) {
      console.error(`  ✗ Failed to build ${name}`);
      // Continue with other targets
    }
  }

  console.log("\n✅ Build complete!");
  console.log(`   Binaries are in ${DIST_DIR}`);
}

// Parse arguments
const args = process.argv.slice(2);
const targetOnly = args.find((a) => !a.startsWith("-"));

build(targetOnly).catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
