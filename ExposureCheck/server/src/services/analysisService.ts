import type { WalletData, ExposureResult, RiskLevel } from '../types/exposure.js';
import {
  getSolBalance,
  getTransactionHistory,
  getTokenBalances,
  getSocialLinks,
  getWalletAge,
  getTransactionCounterparties,
} from './solanaService.js';
import {
  calculateWalletActivityScore,
  calculateAddressLinkabilityScore,
  calculateSocialExposureScore,
  calculateBehavioralProfilingScore,
  calculateFinancialFootprintScore,
  calculateOverallScore,
} from './scoringService.js';

function getRiskLevel(score: number): RiskLevel {
  if (score < 40) return 'Low';
  if (score < 70) return 'Medium';
  return 'High';
}

export async function analyzeWallet(address: string): Promise<ExposureResult> {
  // Fetch all data in parallel for better performance
  const [solBalance, transactions, tokenBalances, socialLinks, counterparties] = await Promise.all([
    getSolBalance(address),
    getTransactionHistory(address, 100),
    getTokenBalances(address),
    getSocialLinks(address),
    getTransactionCounterparties(address, 50),
  ]);

  // Calculate wallet age from transaction history
  const walletAge = await getWalletAge(transactions);

  const walletData: WalletData = {
    address,
    solBalance,
    transactions,
    tokenBalances,
    socialLinks,
    walletAge,
  };

  const categories = [
    calculateWalletActivityScore(walletData),
    calculateAddressLinkabilityScore(walletData),
    calculateSocialExposureScore(walletData),
    calculateBehavioralProfilingScore(walletData),
    calculateFinancialFootprintScore(walletData),
  ];

  const overallScore = calculateOverallScore(categories);

  return {
    address,
    overallScore,
    overallLevel: getRiskLevel(overallScore),
    categories,
    analyzedAt: new Date().toISOString(),
    txCount: transactions.length,
    tokenCount: tokenBalances.length,
    solBalance,
    walletAge,
    socialLinks,
    counterparties,
  };
}
