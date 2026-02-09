import chalk from "chalk";

export type LogLevel = "debug" | "info" | "warn" | "error" | "success";

let verbose = false;

export function setVerbose(value: boolean): void {
  verbose = value;
}

export function isVerbose(): boolean {
  return verbose;
}

export const logger = {
  debug(message: string, ...args: unknown[]): void {
    if (verbose) {
      console.log(chalk.gray(`[debug] ${message}`), ...args);
    }
  },

  info(message: string, ...args: unknown[]): void {
    console.log(chalk.blue("i"), message, ...args);
  },

  success(message: string, ...args: unknown[]): void {
    console.log(chalk.green("✓"), message, ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    console.log(chalk.yellow("⚠"), message, ...args);
  },

  error(message: string, ...args: unknown[]): void {
    console.error(chalk.red("✗"), message, ...args);
  },

  // Plain output without prefix
  log(message: string, ...args: unknown[]): void {
    console.log(message, ...args);
  },

  // Newline
  newline(): void {
    console.log();
  },

  // Formatted list item
  item(message: string, indent = 0): void {
    const prefix = "  ".repeat(indent);
    console.log(`${prefix}${chalk.dim("•")} ${message}`);
  },

  // Section header
  section(title: string): void {
    console.log();
    console.log(chalk.bold(title));
  },

  // Dim text for less important info
  dim(message: string): void {
    console.log(chalk.dim(message));
  },

  // Table formatting helpers
  table: {
    header(columns: string[]): void {
      console.log(chalk.bold(columns.join("  ")));
      console.log(chalk.dim("-".repeat(columns.join("  ").length)));
    },

    row(columns: string[]): void {
      console.log(columns.join("  "));
    },
  },
};

// Styled text helpers
export const style = {
  bold: chalk.bold,
  dim: chalk.dim,
  italic: chalk.italic,
  underline: chalk.underline,

  // Colors
  blue: chalk.blue,
  cyan: chalk.cyan,
  green: chalk.green,
  yellow: chalk.yellow,
  red: chalk.red,
  magenta: chalk.magenta,
  white: chalk.white,
  gray: chalk.gray,

  // Semantic colors
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.blue,
  muted: chalk.gray,

  // Resource type colors
  skill: chalk.magenta,
  command: chalk.yellow,

  // Status indicators
  installed: chalk.green("✓"),
  notInstalled: chalk.dim(" "),
  pending: chalk.yellow("○"),
};

// JSON output helper
export function outputJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}
