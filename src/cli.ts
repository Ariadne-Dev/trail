#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { scanRepo } from "./scan.js";
import { formatJson, formatMarkdown, formatText } from "./format.js";

type OutputFormat = "text" | "markdown" | "json";

function usage(exit = 1): never {
  console.error(`trail — onboarding map from a codebase scan (offline, no API)

Usage:
  trail map [path] [options]

Options:
  --format FORMAT   text | markdown | json (default: text)
  --out PATH        Write output to file instead of stdout
  --help            Show this help

Examples:
  trail map
  trail map ./my-repo
  trail map --format markdown --out docs/TRAIL.md
`);
  process.exit(exit);
}

function parseArgs(argv: string[]) {
  let path = ".";
  let format: OutputFormat = "text";
  let out: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") usage(0);
    if (arg === "--format") {
      format = argv[++i] as OutputFormat;
      if (!["text", "markdown", "json"].includes(format)) usage();
      continue;
    }
    if (arg === "--out") {
      out = argv[++i];
      if (!out) usage();
      continue;
    }
    if (arg.startsWith("-")) usage();
    path = arg;
  }

  return { path: resolve(path), format, out };
}

function main(): void {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] !== "map") {
    if (argv.includes("--help") || argv.includes("-h")) usage(0);
    console.error('Expected command "map". Run trail map --help');
    process.exit(1);
  }

  const opts = parseArgs(argv.slice(1));
  const map = scanRepo(opts.path);

  let output: string;
  switch (opts.format) {
    case "markdown":
      output = formatMarkdown(map);
      break;
    case "json":
      output = formatJson(map);
      break;
    default:
      output = formatText(map);
  }

  if (opts.out) {
    writeFileSync(opts.out, output, "utf8");
    console.log(`Wrote ${opts.out}`);
  } else {
    console.log(output);
  }
}

main();
