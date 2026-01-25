import type { WalletData, CategoryScore, RiskLevel } from '../types/exposure';

function getRiskLevel(score: number): RiskLevel {
  if (score < 40) return 'Low';
  if (score < 70) return 'Medium';
  return 'High';
}

function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateWalletActivityScore(data: WalletData): CategoryScore {
  const signals: string[] = [];
  let score = 0;

  // Wallet age analysis
  if (data.walletAge.ageInDays !== null) {
    if (data.walletAge.isNew) {
      signals.push(`New wallet (${data.walletAge.ageInDays} days old)`);
      // New wallets have less exposure history
    } else if (data.walletAge.ageInDays > 365) {
      score += 15;
      signals.push(`Established wallet (${Math.floor(data.walletAge.ageInDays / 365)}+ years old)`);
    } else if (data.walletAge.ageInDays > 90) {
      score += 10;
      signals.push(`Active wallet (${data.walletAge.ageInDays} days old)`);
    }
  } else {
    signals.push('No transaction history (brand new wallet)');
  }

  const txCount = data.transactions.length;
  if (txCount > 50) {
    score += 35;
    signals.push(`High transaction volume (${txCount}+ txs)`);
  } else if (txCount > 20) {
    score += 25;
    signals.push(`Moderate transaction volume (${txCount} txs)`);
  } else if (txCount > 5) {
    score += 15;
    signals.push(`Low transaction volume (${txCount} txs)`);
  } else if (txCount > 0) {
    signals.push(`Minimal activity (${txCount} txs)`);
  }

  const tokenCount = data.tokenBalances.length;
  if (tokenCount > 10) {
    score += 30;
    signals.push(`Diverse token portfolio (${tokenCount} tokens)`);
  } else if (tokenCount > 3) {
    score += 20;
    signals.push(`Moderate token diversity (${tokenCount} tokens)`);
  } else if (tokenCount > 0) {
    score += 10;
    signals.push(`Few token holdings (${tokenCount} tokens)`);
  }

  // Check transaction frequency
  const recentTxs = data.transactions.filter(
    (tx) => tx.blockTime && Date.now() / 1000 - tx.blockTime < 7 * 24 * 60 * 60
  );
  if (recentTxs.length > 10) {
    score += 20;
    signals.push('Very active in past week');
  } else if (recentTxs.length > 3) {
    score += 10;
    signals.push('Active in past week');
  }

  return {
    name: 'Wallet Activity',
    score: clamp(score),
    level: getRiskLevel(clamp(score)),
    weight: 0.2,
    signals,
    description: 'Transaction frequency, wallet age, and token diversity create activity patterns',
  };
}

export function calculateAddressLinkabilityScore(data: WalletData): CategoryScore {
  const signals: string[] = [];
  let score = 0;

  // Analyze unique counterparties (simplified - would need parsed tx data)
  const txCount = data.transactions.length;
  const estimatedCounterparties = Math.min(txCount, Math.floor(txCount * 0.7));

  if (estimatedCounterparties > 30) {
    score += 45;
    signals.push(`Many unique interactions (~${estimatedCounterparties} addresses)`);
  } else if (estimatedCounterparties > 10) {
    score += 30;
    signals.push(`Moderate address network (~${estimatedCounterparties} addresses)`);
  } else if (estimatedCounterparties > 0) {
    score += 15;
    signals.push(`Limited address connections`);
  }

  // Token holdings create links to other holders
  if (data.tokenBalances.length > 5) {
    score += 25;
    signals.push('Multiple token communities linked');
  } else if (data.tokenBalances.length > 0) {
    score += 10;
    signals.push('Some token community exposure');
  }

  // SOL balance indicates mainnet presence
  if (data.solBalance > 10) {
    score += 20;
    signals.push('Significant SOL balance visible');
  } else if (data.solBalance > 1) {
    score += 10;
    signals.push('Moderate SOL balance');
  }

  return {
    name: 'Address Linkability',
    score: clamp(score),
    level: getRiskLevel(clamp(score)),
    weight: 0.25,
    signals,
    description: 'How easily this wallet can be linked to other addresses',
  };
}

export function calculateSocialExposureScore(data: WalletData): CategoryScore {
  const signals: string[] = [];
  let score = 0;
  const social = data.socialLinks;

  // X/Twitter linking - highest exposure risk
  if (social.twitter) {
    score += 40;
    signals.push(`X/Twitter linked: @${social.twitter}`);
  }

  // Farcaster - high exposure (public social graph)
  if (social.farcaster) {
    score += 35;
    signals.push(`Farcaster: @${social.farcaster}`);
  }

  // Lens Protocol - high exposure (on-chain social)
  if (social.lens) {
    score += 30;
    signals.push(`Lens: ${social.lens}`);
  }

  // ENS name - cross-chain identity exposure
  if (social.ens) {
    score += 30;
    signals.push(`ENS: ${social.ens}`);
  }

  // Basename (Base chain identity)
  if (social.basename) {
    score += 25;
    signals.push(`Basename: ${social.basename}`);
  }

  // SNS domain names
  if (social.snsNames.length > 0) {
    score += 30;
    signals.push(`SNS domain: ${social.snsNames.join(', ')}`);
  }

  // AllDomains (multiple Solana TLDs)
  if (social.allDomains && social.allDomains.length > 0) {
    const uniqueDomains = social.allDomains.filter(
      d => !social.snsNames.some(sns => d.includes(sns.replace('.sol', '')))
    );
    if (uniqueDomains.length > 0) {
      score += 20;
      signals.push(`Other domains: ${uniqueDomains.slice(0, 3).join(', ')}${uniqueDomains.length > 3 ? ` (+${uniqueDomains.length - 3} more)` : ''}`);
    }
  }

  // Backpack username
  if (social.backpack) {
    score += 25;
    signals.push(`Backpack username: ${social.backpack}`);
  }

  // Discord
  if (social.discord) {
    score += 20;
    signals.push(`Discord linked: ${social.discord}`);
  }

  // Telegram
  if (social.telegram) {
    score += 20;
    signals.push(`Telegram linked: ${social.telegram}`);
  }

  // GitHub
  if (social.github) {
    score += 15;
    signals.push(`GitHub linked: ${social.github}`);
  }

  // Count total social links for summary
  const totalSocialLinks = [
    social.twitter, social.farcaster, social.lens, social.ens,
    social.basename, social.backpack, social.discord, social.telegram, social.github
  ].filter(Boolean).length + social.snsNames.length + (social.allDomains?.length || 0);

  // No social links found
  if (totalSocialLinks === 0) {
    signals.push('No social accounts linked - low identity exposure');
  } else if (totalSocialLinks >= 5) {
    score += 15;
    signals.push(`High social presence: ${totalSocialLinks} linked accounts`);
  }

  // High-value wallets often get indexed by explorers
  if (data.solBalance > 100) {
    score += 10;
    signals.push('High-value wallet likely indexed');
  }

  // Many tokens suggest DeFi/NFT activity often shared socially
  if (data.tokenBalances.length > 15) {
    score += 5;
    signals.push('Extensive token activity may be tracked');
  }

  return {
    name: 'Social Exposure',
    score: clamp(score),
    level: getRiskLevel(clamp(score)),
    weight: 0.15,
    signals,
    description: 'Social media links, usernames, and public identity exposure',
  };
}

export function calculateBehavioralProfilingScore(data: WalletData): CategoryScore {
  const signals: string[] = [];
  let score = 0;

  // Analyze time patterns from transactions
  const txWithTime = data.transactions.filter((tx) => tx.blockTime !== null);
  if (txWithTime.length > 10) {
    const hours = txWithTime.map((tx) => new Date(tx.blockTime! * 1000).getUTCHours());
    const uniqueHours = new Set(hours).size;

    if (uniqueHours < 8) {
      score += 35;
      signals.push('Consistent timezone pattern detected');
    } else if (uniqueHours < 16) {
      score += 20;
      signals.push('Some time-of-day patterns visible');
    } else {
      score += 10;
      signals.push('Varied transaction timing');
    }
  }

  // Protocol diversity
  const tokenMints = new Set(data.tokenBalances.map((t) => t.mint));
  if (tokenMints.size > 10) {
    score += 30;
    signals.push('Diverse protocol usage fingerprint');
  } else if (tokenMints.size > 3) {
    score += 15;
    signals.push('Moderate protocol interaction');
  }

  // Transaction regularity
  if (data.transactions.length > 20) {
    const intervals: number[] = [];
    for (let i = 1; i < Math.min(data.transactions.length, 20); i++) {
      const t1 = data.transactions[i - 1].blockTime;
      const t2 = data.transactions[i].blockTime;
      if (t1 && t2) {
        intervals.push(Math.abs(t1 - t2));
      }
    }
    if (intervals.length > 5) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev < avgInterval * 0.5) {
        score += 25;
        signals.push('Regular transaction pattern detected');
      }
    }
  }

  return {
    name: 'Behavioral Profiling',
    score: clamp(score),
    level: getRiskLevel(clamp(score)),
    weight: 0.2,
    signals,
    description: 'Timing patterns and protocol usage that create behavioral fingerprints',
  };
}

export function calculateFinancialFootprintScore(data: WalletData): CategoryScore {
  const signals: string[] = [];
  let score = 0;

  // SOL balance exposure
  if (data.solBalance > 100) {
    score += 40;
    signals.push(`Large SOL holdings (${data.solBalance.toFixed(2)} SOL)`);
  } else if (data.solBalance > 10) {
    score += 25;
    signals.push(`Moderate SOL holdings (${data.solBalance.toFixed(2)} SOL)`);
  } else if (data.solBalance > 1) {
    score += 15;
    signals.push(`Small SOL holdings (${data.solBalance.toFixed(2)} SOL)`);
  } else {
    signals.push(`Minimal SOL balance`);
  }

  // Token value exposure (simplified - would need price data)
  const totalTokens = data.tokenBalances.reduce((sum, t) => sum + t.uiAmount, 0);
  if (totalTokens > 10000) {
    score += 30;
    signals.push('Large token positions visible');
  } else if (totalTokens > 100) {
    score += 15;
    signals.push('Moderate token positions');
  }

  // Transaction volume indicates financial activity
  const txCount = data.transactions.length;
  if (txCount > 50) {
    score += 25;
    signals.push('High transaction volume trackable');
  } else if (txCount > 20) {
    score += 15;
    signals.push('Moderate financial activity');
  }

  return {
    name: 'Financial Footprint',
    score: clamp(score),
    level: getRiskLevel(clamp(score)),
    weight: 0.2,
    signals,
    description: 'Value held and transaction volumes reveal financial profile',
  };
}

export function calculateOverallScore(categories: CategoryScore[]): number {
  const weightedSum = categories.reduce(
    (sum, cat) => sum + cat.score * cat.weight,
    0
  );
  return Math.round(clamp(weightedSum));
}
