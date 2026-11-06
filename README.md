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

| Command                             | What it does                                      |
| ----------------------------------- | ------------------------------------------------- |
| `pnpm build`                        | Compile to `dist/`                                |
| `pnpm lint`                         | Lint with oxlint                                  |
| `pnpm format` / `pnpm format:check` | Format with Prettier / check formatting           |
| `pnpm typecheck`                    | Type-check without emitting                       |
| `pnpm test`                         | Unit tests (Vitest)                               |
| `pnpm check:package`                | Verify the built package (run after `pnpm build`) |

`pnpm check:package` runs [publint](https://publint.dev) (entry points exist, `exports` is valid), [Are the Types Wrong?](https://arethetypeswrong.github.io) in ESM-only mode (typings resolve), a check that `npm pack` publishes only `dist/` and metadata, and a smoke test importing the built package by name like a consumer.

Run lint, format check, typecheck, test, build, and `pnpm check:package` before opening a PR. CI runs the same steps.

## Usage

### Validation helpers

```ts
import {
  isValidMemoText,
  isValidPublicKey,
  memoTextByteLength,
} from "@open-support-ledger/chain";

// Standard G... account keys only (no secret, muxed or contract addresses).
isValidPublicKey("GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7"); // true
isValidPublicKey("not a key"); // false

// A text memo is limited to 28 bytes, not 28 characters.
memoTextByteLength("é"); // 2
isValidMemoText("osl-ref-1234"); // true
isValidMemoText("é".repeat(15)); // false (30 bytes)
```

Key validation uses `@stellar/stellar-base` (`StrKey`), the smaller of the two Stellar JS packages and all this library needs; the full `@stellar/stellar-sdk` adds the network client, which this package does not use here.

### SEP-7 payment links

`buildPayUri` builds a [SEP-7](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md) (v2.1.0) `pay` URI that any compatible wallet can open. Amounts are decimal strings, never floats, with at most 7 decimal places. Invalid input throws a `PayUriError`.

```ts
import {
  TESTNET_NETWORK_PASSPHRASE,
  buildPayUri,
} from "@open-support-ledger/chain";

const uri = buildPayUri({
  destination: "GCALNQQBXAPZ2WIRSDDBMSTAKCUH5SG6U76YBFLQLIXJTF7FE5AX7AOO",
  amount: "10",
  asset: {
    code: "USDC",
    issuer: "GCRCUE2C5TBNIPYHMEP7NK5RWTT2WBSZ75CMARH7GDOHDDCQH3XANFOB",
  }, // omit for XLM
  memo: "osl-ref-1234", // text memo, max 28 bytes, written on-chain
  message: "Thanks for the project!", // shown in the wallet, max 300 characters, not on-chain
  networkPassphrase: TESTNET_NETWORK_PASSPHRASE, // testnet only, see below
});

// Use it as a link (wallets register the web+stellar: scheme)...
// <a href={uri}>Pay with a Stellar wallet</a>
// ...or render it as a QR code.
```

**Is `networkPassphrase` needed for testnet?** Yes. SEP-7 says `network_passphrase` is only needed for networks other than the public network, so testnet links must set it (use `TESTNET_NETWORK_PASSPHRASE`) and mainnet links must omit it.

## Project structure

```
src/
  index.ts        public exports
  validation.ts   public key and memo validation helpers
  pay-uri.ts      SEP-7 payment URI builder
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
