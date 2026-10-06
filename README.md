# osl-chain

TypeScript library for reading and verifying Stellar payments, used by **Open Support Ledger**, a transparent funding page and public payment ledger for open-source projects.

> **Status:** early. This repo currently contains only the project foundation (TypeScript, tests, CI). The library is being built through the issues in this repo. It is not published to npm yet.

## How the repos fit together

| Repo                                                      | Role                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------- |
| [osl-api](https://github.com/open-support-ledger/osl-api) | Backend API, database, payment indexer                        |
| [osl-web](https://github.com/open-support-ledger/osl-web) | Next.js frontend                                              |
| **osl-chain** (this repo)                                 | TypeScript library for reading and verifying Stellar payments |

This library has no database and no web framework. It is meant to be usable on its own by other Stellar projects.

## Requirements

- Node.js 22 (see `.nvmrc`)
- [pnpm](https://pnpm.io/installation)

## Getting started

```bash
git clone https://github.com/open-support-ledger/osl-chain.git
cd osl-chain
pnpm install
pnpm test
```

Use **Stellar testnet** for all development and tests. Tests must run on fixtures and must never call a live network. Never commit secret keys.

## Scripts

| Command                             | What it does                            |
| ----------------------------------- | --------------------------------------- |
| `pnpm build`                        | Compile to `dist/`                      |
| `pnpm lint`                         | Lint with oxlint                        |
| `pnpm format` / `pnpm format:check` | Format with Prettier / check formatting |
| `pnpm typecheck`                    | Type-check without emitting             |
| `pnpm test`                         | Unit tests (Vitest)                     |

Run lint, format check, typecheck, test, and build before opening a PR. CI runs the same steps.

## Project structure

```
src/
  index.ts        public exports
  *.test.ts       tests, next to the code they cover
```

Only what `src/index.ts` exports is public API. The package is ESM-only.

## Principles

- Never fabricate blockchain data. Mock implementations must be clearly named and kept separate from real ones.
- Payment status must come from real, verified network information.
- Keep the library free of application concerns such as databases, HTTP servers, and user data.

## Contributing

Read the [contributing guide](https://github.com/open-support-ledger/.github/blob/main/CONTRIBUTING.md), then pick an issue. Please read the whole issue, including scope and acceptance criteria, before starting.

## License

Apache License 2.0. See [LICENSE](LICENSE).
