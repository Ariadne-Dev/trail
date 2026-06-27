# trail

Generate **onboarding maps** from a codebase scan. Offline. No API key. No cloud.

Part of [Ariadne](https://github.com/Ariadne-Dev) · [trail on the web](https://ariadne.pablovallejo.dev/trail)

## Why

You clone a repo. The README is long or stale. Folders don't explain themselves. You need a **map** — what lives where, which scripts matter, where to start.

`trail` scans the top level offline and prints a structured guide.

## Install

```bash
git clone https://github.com/Ariadne-Dev/trail.git
cd trail
pnpm install
```

## Usage

```bash
# Map the current directory
pnpm map

# Map another repo
pnpm dev map ../thread

# Markdown for docs/
pnpm dev map ../thread --format markdown --out TRAIL.md

# JSON for tooling
pnpm dev map . --format json
```

## Example (on `thread`)

```
Trail: thread
────────────────────────────────────────────────────────

Package: thread
About:   Explain git diffs for learning and review — offline, no API key — Ariadne

DIRECTORIES
  · examples/ — Examples and demos
  · src/ — Source code

SCRIPTS
  build        tsc
  explain      tsx src/cli.ts explain
  dev          tsx src/cli.ts

START HERE
  → `dev` — tsx src/cli.ts
  → `explain` — tsx src/cli.ts explain
  → `build` — tsc
```

## How it works

Top-level scan only — skips `node_modules`, `.git`, `dist`. Heuristics for common folder names, `package.json` scripts, README intro paragraph. Fast and honest about limits.

## Pair with thread

Reviewing changes? Use [`thread`](https://github.com/Ariadne-Dev/thread) — `thread explain` walks through a diff with risks and a checklist. **trail** = land cold; **thread** = review changes.

## License

MIT · [Ariadne](https://github.com/Ariadne-Dev) · ariadne@pablovallejo.dev
