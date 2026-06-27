import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".astro",
  "coverage",
  ".next",
  "build",
  ".cache",
  ".turbo",
  ".vercel",
]);

const DIR_HINTS: [RegExp, string][] = [
  [/^src$/, "Source code"],
  [/^lib$/, "Library / shared code"],
  [/^test(s)?$/, "Tests"],
  [/^__tests__$/, "Tests"],
  [/^docs?$/, "Documentation"],
  [/^examples?$/, "Examples and demos"],
  [/^scripts?$/, "Scripts and tooling"],
  [/^public$/, "Static assets"],
  [/^assets?$/, "Assets"],
  [/^\.github$/, "GitHub config (CI, templates)"],
  [/^\.cursor$/, "Cursor agent config (local)"],
];

export interface DirectoryEntry {
  name: string;
  hint: string;
}

export interface TrailMap {
  root: string;
  name: string | null;
  description: string | null;
  scripts: Record<string, string>;
  readmeIntro: string | null;
  directories: DirectoryEntry[];
  startHere: string[];
}

function hintForDir(name: string): string {
  for (const [pattern, hint] of DIR_HINTS) {
    if (pattern.test(name)) return hint;
  }
  return "Project folder";
}

function readJsonSafe<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function readmeIntro(root: string): string | null {
  for (const file of ["README.md", "readme.md", "Readme.md"]) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    const lines = text.split("\n");
    const body: string[] = [];
    let passedTitle = false;
    for (const line of lines) {
      if (!passedTitle) {
        if (line.startsWith("#")) {
          passedTitle = true;
        }
        continue;
      }
      if (line.startsWith("#")) break;
      const trimmed = line.trim();
      if (!trimmed) {
        if (body.length > 0) break;
        continue;
      }
      body.push(trimmed);
      if (body.join(" ").length > 280) break;
    }
    const intro = body.join(" ").trim();
    return intro || null;
  }
  return null;
}

function startHereFromScripts(scripts: Record<string, string>): string[] {
  const priority = ["dev", "start", "test", "build", "explain", "map"];
  const steps: string[] = [];
  for (const key of priority) {
    if (scripts[key]) steps.push(`\`${key}\` — ${scripts[key]}`);
  }
  if (steps.length === 0 && scripts.install) {
    steps.push("Run install, then check README for entry points.");
  }
  if (steps.length === 0) {
    steps.push("Read README.md, then explore `src/` or top-level source files.");
  }
  return steps;
}

export function scanRepo(root: string): TrailMap {
  const resolved = root.replace(/\/$/, "") || ".";
  const pkg = readJsonSafe<{ name?: string; description?: string; scripts?: Record<string, string> }>(
    join(resolved, "package.json"),
  );

  const directories: DirectoryEntry[] = [];
  try {
    for (const name of readdirSync(resolved).sort()) {
      if (SKIP_DIRS.has(name)) continue;
      const full = join(resolved, name);
      try {
        if (!statSync(full).isDirectory()) continue;
      } catch {
        continue;
      }
      directories.push({ name, hint: hintForDir(name) });
    }
  } catch {
    // empty dirs ok
  }

  const scripts = pkg?.scripts ?? {};

  return {
    root: basename(resolved) || resolved,
    name: pkg?.name ?? null,
    description: pkg?.description ?? null,
    scripts,
    readmeIntro: readmeIntro(resolved),
    directories,
    startHere: startHereFromScripts(scripts),
  };
}
