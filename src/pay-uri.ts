import { isValidMemoText, isValidPublicKey } from "./validation.js";

// Implements the `pay` operation of SEP-7, version 2.1.0 (updated 2020-07-29):
// https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md
// Parameter names (`asset_code`, `asset_issuer`, `memo_type`, `msg`,
// `network_passphrase`), the `MEMO_TEXT` value, URL-encoding of values and the
// 300-character limit on `msg` all come from that document. The `callback`,
// `origin_domain` and `signature` parameters are intentionally not supported.

/** Network passphrase of the Stellar test network. */
export const TESTNET_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

/** SEP-7: `msg` must not be longer than 300 characters before URL-encoding. */
export const PAY_URI_MESSAGE_MAX_LENGTH = 300;

/** Stellar amounts have at most 7 decimal places. */
const AMOUNT_PATTERN = /^(0|[1-9]\d*)(\.\d{1,7})?$/;
const ZERO_PATTERN = /^0(\.0+)?$/;
/** Alphanumeric asset codes of 1 to 12 characters. */
const ASSET_CODE_PATTERN = /^[A-Za-z0-9]{1,12}$/;

export interface PayUriAsset {
  /** 1 to 12 letters or digits. */
  code: string;
  /** Public key (`G...`) of the issuing account. */
  issuer: string;
}

export interface PayUriOptions {
  /** Payee public key (`G...`). */
  destination: string;
  /** Decimal string such as "12.5" (max 7 decimal places, greater than zero). Omit to let the payer choose. */
  amount?: string;
  /** Omit for native XLM. */
  asset?: PayUriAsset;
  /** Text memo, at most 28 UTF-8 bytes. It is written on-chain. */
  memo?: string;
  /** Only text memos are supported. Defaults to "text". */
  memoType?: "text";
  /** Note shown to the payer in their wallet (not on-chain), at most 300 characters. */
  message?: string;
  /**
   * Required by SEP-7 for any network other than the public network, so set it
   * for testnet links (see {@link TESTNET_NETWORK_PASSPHRASE}). Omit for mainnet.
   */
  networkPassphrase?: string;
}

/** Thrown for invalid input; the message names the offending option. */
export class PayUriError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayUriError";
  }
}

/** RFC 3986 percent-encoding: spaces become %20 and `!'()*` are escaped too. */
function encode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/**
 * Builds a SEP-7 `web+stellar:pay?...` URI, validating every option. Use the
 * result as a link, or render it as a QR code.
 *
 * @example
 * buildPayUri({
 *   destination: "GCALNQQBXAPZ2WIRSDDBMSTAKCUH5SG6U76YBFLQLIXJTF7FE5AX7AOO",
 *   amount: "120.1234567",
 *   memo: "skdjfasf",
 *   message: "pay me with lumens",
 * });
 * // web+stellar:pay?destination=GCAL...&amount=120.1234567&memo=skdjfasf&memo_type=MEMO_TEXT&msg=pay%20me%20with%20lumens
 *
 * @throws {PayUriError} when an option is invalid.
 */
export function buildPayUri(options: PayUriOptions): string {
  const {
    destination,
    amount,
    asset,
    memo,
    memoType = "text",
    message,
    networkPassphrase,
  } = options;

  if (!isValidPublicKey(destination)) {
    throw new PayUriError(
      "destination must be a valid Stellar public key (G...).",
    );
  }

  const params: [string, string][] = [["destination", destination]];

  if (amount !== undefined) {
    if (!AMOUNT_PATTERN.test(amount)) {
      throw new PayUriError(
        'amount must be a decimal string with at most 7 decimal places, such as "12.5".',
      );
    }
    if (ZERO_PATTERN.test(amount)) {
      throw new PayUriError("amount must be greater than zero.");
    }
    params.push(["amount", amount]);
  }

  if (asset !== undefined) {
    if (!ASSET_CODE_PATTERN.test(asset.code)) {
      throw new PayUriError(
        "asset.code must be 1 to 12 letters or digits. Omit asset for native XLM.",
      );
    }
    if (!isValidPublicKey(asset.issuer)) {
      throw new PayUriError(
        "asset.issuer must be a valid Stellar public key (G...).",
      );
    }
    params.push(["asset_code", asset.code], ["asset_issuer", asset.issuer]);
  }

  if (memo !== undefined) {
    if (memoType !== "text") {
      throw new PayUriError(
        'memoType must be "text"; other memo types are not supported.',
      );
    }
    if (!isValidMemoText(memo)) {
      throw new PayUriError("memo must be at most 28 bytes (UTF-8).");
    }
    params.push(["memo", memo], ["memo_type", "MEMO_TEXT"]);
  }

  if (message !== undefined) {
    if (message.length > PAY_URI_MESSAGE_MAX_LENGTH) {
      throw new PayUriError(
        `message must be at most ${PAY_URI_MESSAGE_MAX_LENGTH} characters.`,
      );
    }
    params.push(["msg", message]);
  }

  if (networkPassphrase !== undefined) {
    if (networkPassphrase.trim() === "") {
      throw new PayUriError(
        "networkPassphrase must not be empty. Omit it for the public network.",
      );
    }
    params.push(["network_passphrase", networkPassphrase]);
  }

  return `web+stellar:pay?${params.map(([k, v]) => `${k}=${encode(v)}`).join("&")}`;
}
