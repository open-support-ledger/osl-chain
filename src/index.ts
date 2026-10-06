export const STELLAR_NETWORKS = ["testnet", "mainnet"] as const;

export type StellarNetwork = (typeof STELLAR_NETWORKS)[number];
