export const STELLAR_NETWORKS = ["testnet", "mainnet"] as const;

export type StellarNetwork = (typeof STELLAR_NETWORKS)[number];

export {
  MEMO_TEXT_MAX_BYTES,
  isValidMemoText,
  isValidPublicKey,
  memoTextByteLength,
} from "./validation.js";

export {
  PAY_URI_MESSAGE_MAX_LENGTH,
  PayUriError,
  TESTNET_NETWORK_PASSPHRASE,
  buildPayUri,
} from "./pay-uri.js";
export type { PayUriAsset, PayUriOptions } from "./pay-uri.js";
