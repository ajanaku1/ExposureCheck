export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface CategoryScore {
  name: string;
  score: number;
  level: RiskLevel;
  weight: number;
  signals: string[];
  description: string;
}

export interface SocialLinks {
  twitter?: string;
  discord?: string;
  telegram?: string;
  github?: string;
  backpack?: string;
  farcaster?: string;
  lens?: string;
  ens?: string;
  basename?: string;
  snsNames: string[];
  allDomains: string[];
  web3BioProfiles: string[];
}

export interface WalletAge {
  firstTxTime: number | null;
  ageInDays: number | null;
  isNew: boolean;
}

export interface ExposureResult {
  address: string;
  overallScore: number;
  overallLevel: RiskLevel;
  categories: CategoryScore[];
  analyzedAt: string;
  txCount: number;
  tokenCount: number;
  solBalance: number;
  walletAge: WalletAge;
  socialLinks: SocialLinks;
  counterparties?: CounterpartyData[];
  cached?: boolean;
}

export interface TransactionData {
  signature: string;
  blockTime: number | null | undefined;
  slot: number;
  err: unknown;
}

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  uiAmount: number;
}

export interface WalletData {
  address: string;
  solBalance: number;
  transactions: TransactionData[];
  tokenBalances: TokenBalance[];
  socialLinks: SocialLinks;
  walletAge: WalletAge;
}

export interface CacheEntry {
  result: ExposureResult;
  timestamp: number;
}

export type CounterpartyType = 'dex' | 'nft' | 'cex' | 'contract' | 'wallet' | 'unknown';

export interface CounterpartyData {
  address: string;
  txCount: number;
  lastInteraction: number;
  type: CounterpartyType;
}
