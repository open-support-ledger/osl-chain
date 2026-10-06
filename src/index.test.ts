import { describe, expect, it } from "vitest";
import { STELLAR_NETWORKS } from "./index.js";

describe("STELLAR_NETWORKS", () => {
  it("lists the supported networks", () => {
    expect(STELLAR_NETWORKS).toEqual(["testnet", "mainnet"]);
  });
});
