export const STELLAR_NETWORKS = ["testnet", "mainnet"] as const;

export type StellarNetwork = (typeof STELLAR_NETWORKS)[number];

export {
  MEMO_TEXT_MAX_BYTES,
  isValidMemoText,
  isValidPublicKey,
  memoTextByteLength,
} from "./validation.js";
