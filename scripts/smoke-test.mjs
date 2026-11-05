// Imports the built package the way a consumer would: by its package name,
// resolved through the `exports` map to dist/. Run after `pnpm build`.
import assert from "node:assert/strict";

const chain = await import("@open-support-ledger/chain");

assert.deepEqual(
  chain.STELLAR_NETWORKS,
  ["testnet", "mainnet"],
  "STELLAR_NETWORKS should be exported from the built package",
);

console.log("Smoke test passed: built package exports resolve for consumers.");
