import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { TransactionData, TokenBalance, CounterpartyData, CounterpartyType } from '../types/exposure.js';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const RPC_URL = HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : 'https://api.mainnet-beta.solana.com';

let connection: Connection | null = null;

function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_URL, 'confirmed');
  }
  return connection;
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return address.length >= 32 && address.length <= 44;
  } catch {
    return false;
  }
}

export async function getSolBalance(address: string): Promise<number> {
  const conn = getConnection();
  const pubkey = new PublicKey(address);
  const balance = await conn.getBalance(pubkey);
  return balance / LAMPORTS_PER_SOL;
}

export async function getTransactionHistory(
  address: string,
  limit: number = 100
): Promise<TransactionData[]> {
  const conn = getConnection();
  const pubkey = new PublicKey(address);
  const signatures = await conn.getSignaturesForAddress(pubkey, { limit });

  return signatures.map((sig) => ({
    signature: sig.signature,
    blockTime: sig.blockTime,
    slot: sig.slot,
    err: sig.err,
  }));
}

export async function getTokenBalances(address: string): Promise<TokenBalance[]> {
  const conn = getConnection();
  const pubkey = new PublicKey(address);

  const tokenAccounts = await conn.getParsedTokenAccountsByOwner(pubkey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  });

  return tokenAccounts.value
    .map((account) => {
      const info = account.account.data.parsed.info;
      return {
        mint: info.mint,
        amount: parseInt(info.tokenAmount.amount),
        decimals: info.tokenAmount.decimals,
        uiAmount: info.tokenAmount.uiAmount || 0,
      };
    })
    .filter((token) => token.uiAmount > 0);
}

export async function getSnsNames(address: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://sns-sdk-proxy.bonfida.workers.dev/favorite-domain/${address}`
    );
    if (response.ok) {
      const data = (await response.json()) as { result?: string; error?: string };
      // Only return valid domain names (no spaces, not an error message)
      if (data.result && !data.error && !data.result.includes(' ')) {
        return [data.result + '.sol'];
      }
    }
  } catch {
    // SNS lookup failed
  }
  return [];
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
  isNew: boolean; // Less than 30 days old
}

export async function getWalletAge(transactions: TransactionData[]): Promise<WalletAge> {
  // Find the oldest transaction
  const txWithTime = transactions.filter((tx) => tx.blockTime);

  if (txWithTime.length === 0) {
    return { firstTxTime: null, ageInDays: null, isNew: true };
  }

  // Get oldest tx (last in the sorted array from RPC)
  const oldestTx = txWithTime[txWithTime.length - 1];
  const firstTxTime = oldestTx.blockTime!;
  const ageInDays = Math.floor((Date.now() / 1000 - firstTxTime) / (24 * 60 * 60));

  return {
    firstTxTime,
    ageInDays,
    isNew: ageInDays < 30,
  };
}

export async function getSocialLinks(address: string): Promise<SocialLinks> {
  const results: SocialLinks = { snsNames: [], allDomains: [], web3BioProfiles: [] };

  // Fetch all social data in parallel
  const [snsNames, solanaidData, backpackData, allDomainsData, web3BioData, farcasterData] = await Promise.all([
    getSnsNames(address),
    fetchSolanaidProfile(address),
    fetchBackpackUsername(address),
    fetchAllDomains(address),
    fetchWeb3Bio(address),
    fetchFarcasterProfile(address),
  ]);

  results.snsNames = snsNames;
  results.allDomains = allDomainsData;

  if (solanaidData) {
    if (solanaidData.twitter) results.twitter = solanaidData.twitter;
    if (solanaidData.discord) results.discord = solanaidData.discord;
    if (solanaidData.telegram) results.telegram = solanaidData.telegram;
    if (solanaidData.github) results.github = solanaidData.github;
  }

  if (backpackData) {
    results.backpack = backpackData;
  }

  // Web3.bio aggregates many profiles
  if (web3BioData) {
    results.web3BioProfiles = web3BioData.profiles;
    if (web3BioData.twitter && !results.twitter) results.twitter = web3BioData.twitter;
    if (web3BioData.farcaster) results.farcaster = web3BioData.farcaster;
    if (web3BioData.lens) results.lens = web3BioData.lens;
    if (web3BioData.ens) results.ens = web3BioData.ens;
    if (web3BioData.basename) results.basename = web3BioData.basename;
  }

  // Farcaster direct lookup as fallback
  if (farcasterData && !results.farcaster) {
    results.farcaster = farcasterData;
  }

  return results;
}

async function fetchSolanaidProfile(address: string): Promise<{
  twitter?: string;
  discord?: string;
  telegram?: string;
  github?: string;
} | null> {
  try {
    // Solana.id API for social profile lookups
    const response = await fetch(`https://api.solana.id/v1/profile/${address}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        twitter?: string;
        discord?: string;
        telegram?: string;
        github?: string;
      };
      return data;
    }
  } catch {
    // Solana.id lookup failed
  }

  // Fallback: Try Bonfida Twitter verification
  try {
    const response = await fetch(
      `https://sns-sdk-proxy.bonfida.workers.dev/twitter/reverse-lookup/${address}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (response.ok) {
      const data = (await response.json()) as { result?: string };
      if (data.result && !data.result.includes(' ')) {
        return { twitter: data.result };
      }
    }
  } catch {
    // Bonfida Twitter lookup failed
  }

  return null;
}

async function fetchBackpackUsername(address: string): Promise<string | null> {
  try {
    // Backpack xNFT API
    const response = await fetch(`https://backpack-api.xnfts.dev/users?publicKey=${address}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = (await response.json()) as { username?: string };
      if (data.username) {
        return data.username;
      }
    }
  } catch {
    // Backpack lookup failed
  }
  return null;
}

// AllDomains API - aggregates multiple Solana naming services (.sol, .abc, .bonk, .poor, etc.)
async function fetchAllDomains(address: string): Promise<string[]> {
  const domains: string[] = [];
  try {
    const response = await fetch(
      `https://api.alldomains.id/all-user-domains/${address}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.ok) {
      const data = (await response.json()) as Array<{ domain: string; tld: string }>;
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.domain && item.tld) {
            domains.push(`${item.domain}.${item.tld}`);
          }
        }
      }
    }
  } catch {
    // AllDomains lookup failed
  }
  return domains;
}

// Web3.bio API - comprehensive social identity aggregator
interface Web3BioResult {
  profiles: string[];
  twitter?: string;
  farcaster?: string;
  lens?: string;
  ens?: string;
  basename?: string;
}

async function fetchWeb3Bio(address: string): Promise<Web3BioResult | null> {
  try {
    const response = await fetch(
      `https://api.web3.bio/profile/${address}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (response.ok) {
      const data = (await response.json()) as Array<{
        platform: string;
        identity: string;
        displayName?: string;
        address?: string;
        social?: {
          twitter?: string;
        };
      }>;

      if (Array.isArray(data) && data.length > 0) {
        const result: Web3BioResult = { profiles: [] };

        for (const profile of data) {
          // Track all found profiles
          if (profile.platform && profile.identity) {
            result.profiles.push(`${profile.platform}:${profile.identity}`);
          }

          // Extract specific platforms
          const platform = profile.platform?.toLowerCase();
          const identity = profile.identity;

          if (platform === 'twitter' || platform === 'x') {
            result.twitter = identity;
          } else if (platform === 'farcaster') {
            result.farcaster = identity;
          } else if (platform === 'lens') {
            result.lens = identity;
          } else if (platform === 'ens') {
            result.ens = identity;
          } else if (platform === 'basenames' || platform === 'basename') {
            result.basename = identity;
          }

          // Check nested social object
          if (profile.social?.twitter && !result.twitter) {
            result.twitter = profile.social.twitter;
          }
        }

        return result;
      }
    }
  } catch {
    // Web3.bio lookup failed
  }
  return null;
}

// Farcaster direct lookup via Neynar or Warpcast API
async function fetchFarcasterProfile(address: string): Promise<string | null> {
  // Try Neynar API first (more reliable)
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
      {
        headers: {
          'Accept': 'application/json',
          'api_key': 'NEYNAR_API_DOCS', // Public demo key
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.ok) {
      const data = (await response.json()) as Record<string, Array<{ username?: string; fid?: number }>>;
      const addressLower = address.toLowerCase();
      if (data[addressLower]?.[0]?.username) {
        return data[addressLower][0].username;
      }
    }
  } catch {
    // Neynar lookup failed
  }

  // Fallback: Try searchcaster
  try {
    const response = await fetch(
      `https://searchcaster.xyz/api/profiles?connected_address=${address}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.ok) {
      const data = (await response.json()) as Array<{ body?: { username?: string } }>;
      if (Array.isArray(data) && data[0]?.body?.username) {
        return data[0].body.username;
      }
    }
  } catch {
    // Searchcaster lookup failed
  }

  return null;
}

// Known program/contract addresses to classify counterparties
const KNOWN_PROGRAMS: Record<string, CounterpartyType> = {
  // DEXes
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'dex',   // Jupiter
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': 'dex',   // Orca Whirlpool
  '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP': 'dex',  // Orca V1
  'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK': 'dex',  // Raydium CPMM
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'dex',  // Raydium AMM
  'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX': 'dex',   // Serum DEX
  'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1': 'dex',  // Orca Token Swap

  // NFT Marketplaces
  'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K': 'nft',   // Magic Eden v2
  'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN': 'nft',   // Tensor
  'CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz': 'nft',  // Solanart
  'hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk': 'nft',   // Coral Cube

  // Token Program
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'contract',
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': 'contract',

  // System/Infrastructure
  '11111111111111111111111111111111': 'contract',
  'ComputeBudget111111111111111111111111111111': 'contract',
};

// CEX known hot wallets (partial list)
const CEX_WALLETS = new Set([
  'H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS', // Binance
  'GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE', // Coinbase
  '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9', // FTX
]);

export async function getTransactionCounterparties(
  address: string,
  limit: number = 50
): Promise<CounterpartyData[]> {
  const conn = getConnection();
  const pubkey = new PublicKey(address);

  try {
    // Get recent transaction signatures
    const signatures = await conn.getSignaturesForAddress(pubkey, { limit });

    if (signatures.length === 0) {
      return [];
    }

    // Fetch transaction details (batch for efficiency)
    const signatureStrings = signatures.map(s => s.signature);
    const transactions = await conn.getParsedTransactions(signatureStrings, {
      maxSupportedTransactionVersion: 0,
    });

    // Track counterparty interactions
    const counterpartyMap = new Map<string, {
      txCount: number;
      lastInteraction: number;
      type: CounterpartyType;
    }>();

    const addressLower = address.toLowerCase();

    for (const tx of transactions) {
      if (!tx || !tx.transaction) continue;

      const message = tx.transaction.message;
      const blockTime = tx.blockTime || 0;

      // Get all account keys involved in the transaction
      const accountKeys = message.accountKeys.map(k => k.pubkey.toBase58());

      for (const accountKey of accountKeys) {
        // Skip the analyzed wallet itself
        if (accountKey.toLowerCase() === addressLower) continue;

        // Classify the counterparty
        let type: CounterpartyType = 'unknown';

        if (KNOWN_PROGRAMS[accountKey]) {
          type = KNOWN_PROGRAMS[accountKey];
        } else if (CEX_WALLETS.has(accountKey)) {
          type = 'cex';
        } else {
          // Default to wallet for regular addresses
          type = 'wallet';
        }

        // Update or add counterparty
        const existing = counterpartyMap.get(accountKey);
        if (existing) {
          existing.txCount++;
          if (blockTime > existing.lastInteraction) {
            existing.lastInteraction = blockTime;
          }
        } else {
          counterpartyMap.set(accountKey, {
            txCount: 1,
            lastInteraction: blockTime,
            type,
          });
        }
      }
    }

    // Convert to array and sort by transaction count (most interactions first)
    const counterparties: CounterpartyData[] = [];
    for (const [addr, data] of counterpartyMap) {
      counterparties.push({
        address: addr,
        txCount: data.txCount,
        lastInteraction: data.lastInteraction,
        type: data.type,
      });
    }

    // Sort by txCount descending, limit to top 20 for visualization
    counterparties.sort((a, b) => b.txCount - a.txCount);
    return counterparties.slice(0, 20);
  } catch (error) {
    console.error('Error fetching transaction counterparties:', error);
    return [];
  }
}
