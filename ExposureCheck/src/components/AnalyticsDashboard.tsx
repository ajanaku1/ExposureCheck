import type { ExposureResult } from '../types/exposure';
import { RiskGauge } from './RiskGauge';
import { RiskRadarChart } from './RiskRadarChart';
import { NetworkGraph } from './NetworkGraph';
import { SocialIdentityPanel } from './SocialIdentityPanel';
import { ExposureCategory } from './ExposureCategory';

interface AnalyticsDashboardProps {
  result: ExposureResult;
  onReset: () => void;
}

// Premium icons for dashboard
const Icons = {
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M22 10H18a2 2 0 000 4h4" />
      <circle cx="18" cy="12" r="1" fill="currentColor" />
      <path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2" />
    </svg>
  ),
  transactions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
      <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17L7 7M7 7h9M7 7v9" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  ),
  tokens: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  balance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  age: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
      <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
    </svg>
  ),
};

export function AnalyticsDashboard({ result, onReset }: AnalyticsDashboardProps) {
  const shortAddress = `${result.address.slice(0, 8)}...${result.address.slice(-8)}`;

  // Format wallet age
  const getWalletAgeText = () => {
    if (!result.walletAge.ageInDays) return 'Unknown';
    if (result.walletAge.ageInDays < 30) return `${result.walletAge.ageInDays}d`;
    if (result.walletAge.ageInDays < 365) return `${Math.floor(result.walletAge.ageInDays / 30)}mo`;
    return `${Math.floor(result.walletAge.ageInDays / 365)}y+`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(result.address);
  };

  // Get status color based on overall level
  const getStatusColor = () => {
    switch (result.overallLevel) {
      case 'Low': return '#22c55e';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
    }
  };

  return (
    <div className="analytics-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="wallet-badge">
            <div className="wallet-icon" style={{ color: getStatusColor() }}>
              {Icons.wallet}
            </div>
            <div className="wallet-info-block">
              <span className="wallet-label">Wallet Analysis</span>
              <div className="wallet-address-row">
                <code className="wallet-address" title={result.address}>
                  {shortAddress}
                </code>
                <button className="copy-btn" onClick={copyAddress} title="Copy address">
                  {Icons.copy}
                </button>
              </div>
            </div>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <div className="stat-icon">{Icons.transactions}</div>
              <div className="stat-content">
                <span className="stat-value">{result.txCount.toLocaleString()}</span>
                <span className="stat-label">Transactions</span>
              </div>
            </div>
            <div className="header-stat">
              <div className="stat-icon">{Icons.tokens}</div>
              <div className="stat-content">
                <span className="stat-value">{result.tokenCount}</span>
                <span className="stat-label">Tokens</span>
              </div>
            </div>
            <div className="header-stat">
              <div className="stat-icon">{Icons.balance}</div>
              <div className="stat-content">
                <span className="stat-value">{result.solBalance.toFixed(2)}</span>
                <span className="stat-label">SOL Balance</span>
              </div>
            </div>
            <div className="header-stat">
              <div className="stat-icon">{Icons.age}</div>
              <div className="stat-content">
                <span className="stat-value">{getWalletAgeText()}</span>
                <span className="stat-label">Wallet Age</span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-center">
          <RiskGauge score={result.overallScore} level={result.overallLevel} />
        </div>
        <div className="header-right">
          <button className="reset-button" onClick={onReset}>
            {Icons.refresh}
            <span>New Analysis</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Network Graph - Left Column */}
        <div className="grid-panel network-panel">
          <NetworkGraph
            address={result.address}
            counterparties={result.counterparties}
          />
        </div>

        {/* Social Identity - Right Column Top */}
        <div className="grid-panel social-panel">
          <SocialIdentityPanel socialLinks={result.socialLinks} />
        </div>

        {/* Risk Radar - Left Column Bottom */}
        <div className="grid-panel radar-panel">
          <RiskRadarChart
            categories={result.categories}
            overallLevel={result.overallLevel}
          />
        </div>

        {/* Wallet Activity Stats - Right Column Bottom */}
        <div className="grid-panel activity-panel">
          <h3 className="panel-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Activity Metrics
          </h3>
          <div className="activity-stats">
            <div className="activity-stat">
              <div className="activity-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                  <path d="M7 17L17 7M17 7H8M17 7v9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="activity-info">
                <span className="activity-value">{result.txCount.toLocaleString()}</span>
                <span className="activity-label">Total TXs</span>
              </div>
            </div>
            <div className="activity-stat">
              <div className="activity-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="activity-info">
                <span className="activity-value">{result.walletAge.ageInDays || 0}d</span>
                <span className="activity-label">Age</span>
              </div>
            </div>
            <div className="activity-stat">
              <div className="activity-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>
              <div className="activity-info">
                <span className="activity-value">{result.tokenCount}</span>
                <span className="activity-label">Tokens</span>
              </div>
            </div>
            <div className="activity-stat">
              <div className="activity-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                  <ellipse cx="12" cy="12" rx="10" ry="4" />
                  <ellipse cx="12" cy="8" rx="10" ry="4" />
                  <ellipse cx="12" cy="4" rx="10" ry="4" />
                </svg>
              </div>
              <div className="activity-info">
                <span className="activity-value">{result.solBalance.toFixed(2)}</span>
                <span className="activity-label">SOL</span>
              </div>
            </div>
          </div>
          <div className="activity-summary">
            <div className="summary-item">
              <span className="summary-label">Avg TX/Day</span>
              <span className="summary-value">
                {result.walletAge.ageInDays ? (result.txCount / result.walletAge.ageInDays).toFixed(1) : '—'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Unique Counterparties</span>
              <span className="summary-value">{result.counterparties?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signals Panel */}
      <div className="signals-section">
        <div className="section-header">
          <h3 className="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Exposure Analysis
          </h3>
          <span className="section-badge">{result.categories.length} Categories</span>
        </div>
        <div className="categories-grid">
          {result.categories.map((category) => (
            <ExposureCategory key={category.name} category={category} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-stats">
          <div className="footer-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            <span>Analyzed {result.analyzedAt.toLocaleString()}</span>
          </div>
          {result.cached && (
            <div className="cached-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
              </svg>
              <span>Cached Result</span>
            </div>
          )}
        </div>
        <div className="footer-disclaimer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v.01M12 8v4" strokeLinecap="round" />
          </svg>
          <span>Privacy scores are estimates based on public on-chain data.</span>
        </div>
      </footer>
    </div>
  );
}
