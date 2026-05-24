# Error Notes

A running log of errors encountered in this project, their root causes, and why each fix worked.

---

## Error 1: Node.js version too old for pnpm

**Date:** 2026-05-24

**Error:**
```
warn: This version of pnpm requires at least Node.js v22.13
warn: The current version of Node.js is v20.20.2
Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite
```

**What went wrong:**
The GitHub Actions workflow was pinned to `node-version: "20"` via `actions/setup-node@v4`. The version of pnpm installed in CI (`npm install -g pnpm`) was a recent release that requires Node.js ≥22.13 because it uses `node:sqlite`, a built-in module only available in Node 22.5+. Node 20 does not have this module, so pnpm crashed before it could install any dependencies.

A secondary issue: pnpm was installed (`npm install -g pnpm`) *before* `setup-node` ran, which meant the pnpm binary was registered under Node 20's environment even if the node version was later changed.

**Fix:**
In `.github/workflows/deploy.yml`:
1. Changed `node-version: "20"` → `"22"`.
2. Moved `setup-node` before the `install pnpm` step so pnpm is installed into the correct Node environment.

**Why it worked:**
Node 22 ships with `node:sqlite` as a built-in module, satisfying pnpm's runtime requirement. Installing pnpm after `setup-node` ensures the binary runs under the correct Node version from the start.

---

## Error 2: pnpm blocked build scripts for esbuild and msw

**Date:** 2026-05-24

**Error:**
```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild@0.27.0, esbuild@0.27.3, msw@2.12.10
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
Error: Process completed with exit code 1.
```

**What went wrong:**
Modern pnpm (v10+) enforces a supply-chain security policy that blocks post-install scripts from running unless they are explicitly approved. `esbuild` needs to run a post-install script to download/compile its platform-specific binary. `msw` runs a post-install script to copy its service worker file. Without approval, pnpm exits with code 1 and the build fails.

An initial attempt to fix this by adding `pnpm.onlyBuiltDependencies` to `package.json` did not work because pnpm 10+ no longer reads settings from the `"pnpm"` field in `package.json` — it moved them to `pnpm-workspace.yaml`.

**Fix:**
Ran `pnpm approve-builds esbuild msw` locally. This appended an `allowBuilds` block to `pnpm-workspace.yaml`:
```yaml
allowBuilds:
  esbuild: true
  msw: true
```
Committed `pnpm-workspace.yaml`. Also reverted the incorrect `package.json` change.

**Why it worked:**
`pnpm-workspace.yaml` is the authoritative config file for pnpm 10+ workspace settings. The `allowBuilds` field is the v10+ equivalent of the old `onlyBuiltDependencies` field. With this committed to the repo, CI reads it during `pnpm install` and permits the post-install scripts for `esbuild` and `msw` to run.

---

## Error 3: Vite could not resolve Convex API import path

**Date:** 2026-05-24

**Error:**
```
Error: Could not load /home/runner/work/swish-website/swish-website/src/../../convex/_generated/api
```

**What went wrong:**
`src/components/site-nav.tsx` imported the Convex API using `@/../../convex/_generated/api`. The `@/` alias is configured to resolve to `src/`, so the full resolved path became `src/../../convex/_generated/api` — which navigates two levels up from `src/`, landing outside the project root entirely. Vite could not find the file at that path.

**Fix:**
Changed the import to `../../convex/_generated/api`, matching the relative import pattern used by every other component in `src/components/`.

**Why it worked:**
`src/components/` is one level deep inside `src/`, so `../../` from that directory correctly resolves to the project root, where `convex/_generated/api` lives. The `@/` alias should only be used for paths *within* `src/`, not for reaching outside it.

---
