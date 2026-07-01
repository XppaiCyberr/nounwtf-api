# Repository Guidelines

## Project Structure & Module Organization

This repository contains a small Node.js/Vercel serverless function for reading the Nouns auction contract on Ethereum mainnet.

- `api/auction.js` is the deployed Vercel endpoint, available as `/api/auction`.
- `local.js` runs the same contract-read flow from the command line for local checks.
- `package.json` defines dependencies and npm scripts.
- `pnpm-lock.yaml` records the current dependency resolution.
- `.vercel/` is local Vercel metadata and should not be treated as source code.

There are currently no dedicated `tests/` or asset directories.

## Build, Test, and Development Commands

- `pnpm install` or `npm install`: install project dependencies.
- `pnpm local` or `npm run local`: execute `local.js` and print the latest `auction()` result.
- `node local.js`: direct equivalent of the local script.
- `vercel`: deploy or link the project using the Vercel CLI.

The function depends on an Ethereum mainnet RPC endpoint. The current code uses `https://eth.drpc.org`; production deployments should provide a dedicated RPC URL if the code is updated to read from `ETH_RPC_URL`.

## Coding Style & Naming Conventions

Use CommonJS modules (`require`, `module.exports`) to match the existing files. Keep JavaScript indentation at two spaces. Prefer `const` for values that are not reassigned and use descriptive uppercase names for module-level constants such as `CONTRACT_ADDRESS`, `RPC_URL`, and `ABI`.

When adding contract calls, keep ABI fragments minimal and place response-shaping logic close to the read call. Return JSON-safe strings for `bigint` values.

## Testing Guidelines

No automated test framework is configured. For now, validate changes with:

```bash
pnpm local
```

For endpoint behavior, deploy with Vercel or run through Vercel's local tooling, then call `/api/auction`. Verify successful JSON responses and error handling when the RPC endpoint is unavailable.

## Commit & Pull Request Guidelines

This directory does not include Git history, so no local commit convention can be inferred. Use short, imperative commit subjects such as `Add auction endpoint error handling`.

Pull requests should include a brief description, the commands used for validation, any RPC or Vercel configuration changes, and sample response output when API behavior changes.

## Security & Configuration Tips

Do not commit private RPC keys or Vercel secrets. Use environment variables for provider URLs and keep public fallback RPCs suitable only for development or low-volume use.
