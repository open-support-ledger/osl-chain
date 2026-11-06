import { describe, expect, it } from "vitest";
import {
  PayUriError,
  TESTNET_NETWORK_PASSPHRASE,
  buildPayUri,
} from "./index.js";

// Accounts from the examples in the SEP-7 specification.
const DESTINATION = "GCALNQQBXAPZ2WIRSDDBMSTAKCUH5SG6U76YBFLQLIXJTF7FE5AX7AOO";
const ISSUER = "GCRCUE2C5TBNIPYHMEP7NK5RWTT2WBSZ75CMARH7GDOHDDCQH3XANFOB";

describe("buildPayUri", () => {
  it("builds a minimal URI", () => {
    expect(buildPayUri({ destination: DESTINATION })).toBe(
      `web+stellar:pay?destination=${DESTINATION}`,
    );
  });

  it("matches SEP-7 example 1 (lumens)", () => {
    expect(
      buildPayUri({
        destination: DESTINATION,
        amount: "120.1234567",
        memo: "skdjfasf",
        message: "pay me with lumens",
      }),
    ).toBe(
      `web+stellar:pay?destination=${DESTINATION}&amount=120.1234567&memo=skdjfasf&memo_type=MEMO_TEXT&msg=pay%20me%20with%20lumens`,
    );
  });

  it("matches SEP-7 example 2 for an issued asset (without callback)", () => {
    expect(
      buildPayUri({
        destination: DESTINATION,
        amount: "120.123",
        asset: { code: "USD", issuer: ISSUER },
        memo: "hasysda987fs",
      }),
    ).toBe(
      `web+stellar:pay?destination=${DESTINATION}&amount=120.123&asset_code=USD&asset_issuer=${ISSUER}&memo=hasysda987fs&memo_type=MEMO_TEXT`,
    );
  });

  it("omits asset parameters for native XLM", () => {
    expect(
      buildPayUri({ destination: DESTINATION, amount: "1" }),
    ).not.toContain("asset_");
  });

  it("builds a full URI with every option", () => {
    const uri = buildPayUri({
      destination: DESTINATION,
      amount: "5.5",
      asset: { code: "USDC", issuer: ISSUER },
      memo: "ref-1",
      memoType: "text",
      message: "Thanks!",
      networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
    });
    expect(uri).toBe(
      `web+stellar:pay?destination=${DESTINATION}&amount=5.5&asset_code=USDC&asset_issuer=${ISSUER}&memo=ref-1&memo_type=MEMO_TEXT&msg=Thanks%21&network_passphrase=Test%20SDF%20Network%20%3B%20September%202015`,
    );
  });

  it("percent-encodes special characters in memo and message", () => {
    const uri = buildPayUri({
      destination: DESTINATION,
      memo: "a b&c=d#e",
      message: "héllo & wörld = #1 (ok)*'",
    });
    expect(uri).toContain("memo=a%20b%26c%3Dd%23e");
    expect(uri).toContain(
      "msg=h%C3%A9llo%20%26%20w%C3%B6rld%20%3D%20%231%20%28ok%29%2A%27",
    );
    // The query must round-trip through a standard URL parser.
    const params = new URL(uri.replace("web+stellar:", "https://x/"))
      .searchParams;
    expect(params.get("memo")).toBe("a b&c=d#e");
    expect(params.get("msg")).toBe("héllo & wörld = #1 (ok)*'");
  });

  describe("validation", () => {
    const fails = (options: Parameters<typeof buildPayUri>[0], re: RegExp) =>
      expect(() => buildPayUri(options)).toThrow(re);

    it("rejects an invalid destination", () => {
      fails({ destination: "nope" }, /destination/);
      fails({ destination: "" }, /destination/);
      fails({ destination: DESTINATION.toLowerCase() }, /destination/);
    });

    it("rejects invalid amounts", () => {
      for (const amount of [
        "",
        "0",
        "0.0",
        "-1",
        "1.12345678",
        "1e3",
        ".5",
        "1.",
        "abc",
        " 1",
        "01",
      ]) {
        expect(
          () => buildPayUri({ destination: DESTINATION, amount }),
          amount,
        ).toThrow(PayUriError);
      }
    });

    it("accepts 7 decimals and rejects 8", () => {
      expect(() =>
        buildPayUri({ destination: DESTINATION, amount: "0.0000001" }),
      ).not.toThrow();
      fails({ destination: DESTINATION, amount: "0.00000001" }, /7 decimal/);
    });

    it("rejects invalid assets", () => {
      fails(
        { destination: DESTINATION, asset: { code: "", issuer: ISSUER } },
        /asset.code/,
      );
      fails(
        {
          destination: DESTINATION,
          asset: { code: "TOOLONGASSET1", issuer: ISSUER },
        },
        /asset.code/,
      );
      fails(
        { destination: DESTINATION, asset: { code: "US-D", issuer: ISSUER } },
        /asset.code/,
      );
      fails(
        { destination: DESTINATION, asset: { code: "USD", issuer: "bad" } },
        /asset.issuer/,
      );
    });

    it("rejects a memo over 28 bytes, counting bytes", () => {
      fails({ destination: DESTINATION, memo: "a".repeat(29) }, /28 bytes/);
      fails({ destination: DESTINATION, memo: "é".repeat(15) }, /28 bytes/);
      expect(() =>
        buildPayUri({ destination: DESTINATION, memo: "a".repeat(28) }),
      ).not.toThrow();
    });

    it("rejects unsupported memo types", () => {
      fails(
        {
          destination: DESTINATION,
          memo: "x",
          memoType: "id" as unknown as "text",
        },
        /memoType/,
      );
    });

    it("rejects a message over 300 characters", () => {
      expect(() =>
        buildPayUri({ destination: DESTINATION, message: "m".repeat(300) }),
      ).not.toThrow();
      fails(
        { destination: DESTINATION, message: "m".repeat(301) },
        /300 characters/,
      );
    });

    it("rejects an empty network passphrase", () => {
      fails(
        { destination: DESTINATION, networkPassphrase: "  " },
        /networkPassphrase/,
      );
    });
  });
});
