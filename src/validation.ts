import { StrKey } from "@stellar/stellar-base";

/**
 * Maximum length of a Stellar text memo, in bytes (not characters).
 * Official docs: https://developers.stellar.org/docs/learn/fundamentals/transactions/operations-and-transactions#memo
 * ("MEMO_TEXT ... up to 28 bytes"), enforced the same way by stellar-base's `Memo.text`.
 */
export const MEMO_TEXT_MAX_BYTES = 28;

/**
 * Whether `value` is a standard Stellar account public key (`G...`, 56
 * characters, valid checksum).
 *
 * Secret keys (`S...`), muxed addresses (`M...`), contract addresses
 * (`C...`), lowercase or whitespace-padded input are all rejected.
 *
 * @example
 * isValidPublicKey("GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7"); // true
 */
export function isValidPublicKey(value: string): boolean {
  return typeof value === "string" && StrKey.isValidEd25519PublicKey(value);
}

/**
 * The UTF-8 byte length of a memo text. Multi-byte characters count as
 * several bytes, which is what the 28-byte limit is measured in.
 *
 * @example
 * memoTextByteLength("abc"); // 3
 * memoTextByteLength("é"); // 2
 */
export function memoTextByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/**
 * Whether `value` fits in a Stellar text memo: at most 28 UTF-8 bytes. An
 * empty string is valid.
 *
 * @example
 * isValidMemoText("osl-ref-1234"); // true
 * isValidMemoText("é".repeat(15)); // false (30 bytes)
 */
export function isValidMemoText(value: string): boolean {
  return (
    typeof value === "string" &&
    memoTextByteLength(value) <= MEMO_TEXT_MAX_BYTES
  );
}
