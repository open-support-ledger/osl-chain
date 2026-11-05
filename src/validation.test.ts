import { Keypair, StrKey } from "@stellar/stellar-base";
import { describe, expect, it } from "vitest";
import {
  isValidMemoText,
  isValidPublicKey,
  memoTextByteLength,
} from "./index.js";

// Deterministic throwaway keypair derived from a fixed seed; not a real account.
const keypair = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 7));
const validKey = keypair.publicKey();

describe("isValidPublicKey", () => {
  it("accepts a valid G... key", () => {
    expect(isValidPublicKey(validKey)).toBe(true);
  });

  it("rejects a corrupted checksum", () => {
    const last = validKey.endsWith("A") ? "B" : "A";
    expect(isValidPublicKey(validKey.slice(0, -1) + last)).toBe(false);
  });

  it("rejects a secret key", () => {
    expect(isValidPublicKey(keypair.secret())).toBe(false);
  });

  it("rejects a muxed address", () => {
    const muxed = StrKey.encodeMed25519PublicKey(Buffer.alloc(40, 1));
    expect(muxed.startsWith("M")).toBe(true);
    expect(isValidPublicKey(muxed)).toBe(false);
  });

  it("rejects a contract address", () => {
    const contract = StrKey.encodeContract(Buffer.alloc(32, 1));
    expect(isValidPublicKey(contract)).toBe(false);
  });

  it("rejects empty, wrong length, lowercase and padded input", () => {
    expect(isValidPublicKey("")).toBe(false);
    expect(isValidPublicKey(validKey.slice(0, -1))).toBe(false);
    expect(isValidPublicKey(validKey + "A")).toBe(false);
    expect(isValidPublicKey(validKey.toLowerCase())).toBe(false);
    expect(isValidPublicKey(` ${validKey}`)).toBe(false);
    expect(isValidPublicKey(`${validKey}\n`)).toBe(false);
  });

  it("rejects a wrong prefix", () => {
    expect(isValidPublicKey(`X${validKey.slice(1)}`)).toBe(false);
  });
});

describe("memoTextByteLength", () => {
  it("counts UTF-8 bytes, not characters", () => {
    expect(memoTextByteLength("")).toBe(0);
    expect(memoTextByteLength("abc")).toBe(3);
    expect(memoTextByteLength("é")).toBe(2);
    expect(memoTextByteLength("€")).toBe(3);
    expect(memoTextByteLength("😀")).toBe(4);
  });
});

describe("isValidMemoText", () => {
  it("accepts an empty memo", () => {
    expect(isValidMemoText("")).toBe(true);
  });

  it("accepts exactly 28 ASCII characters and rejects 29", () => {
    expect(isValidMemoText("a".repeat(28))).toBe(true);
    expect(isValidMemoText("a".repeat(29))).toBe(false);
  });

  it("rejects text under 28 characters but over 28 bytes", () => {
    const text = "é".repeat(15); // 15 characters, 30 bytes
    expect(text.length).toBeLessThan(28);
    expect(isValidMemoText(text)).toBe(false);
  });

  it("accepts multi-byte text within 28 bytes", () => {
    expect(isValidMemoText("é".repeat(14))).toBe(true); // 28 bytes
  });
});
