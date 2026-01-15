import React, { useMemo, useState, useCallback } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from '@solana/wallet-adapter-react'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

import ShieldFlow from './components/ShieldFlow'
import TradeFlow from './components/TradeFlow'
import WithdrawFlow from './components/WithdrawFlow'
import MarketsList from './components/MarketsList'
import WalletModal from './components/WalletModal'

function ConnectButton({ onClick }) {
  const { publicKey, disconnect, connecting } = useWallet()

  if (publicKey) {
    return (
      <button className="btn-wallet connected" onClick={disconnect}>
        <span className="wallet-dot" />
        {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
      </button>
    )
  }

  return (
    <button className="btn-wallet" onClick={onClick} disabled={connecting}>
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}

function HeroSection({ onConnectWallet }) {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="hero-badge">Privacy-First Trading</div>
        <h1 className="hero-title">
          Trade Prediction Markets.<br />
          <span className="hero-highlight">Stay Private.</span>
        </h1>
        <p className="hero-description">
          HedgeVeil breaks the on-chain link between your wallet and your positions.
          Observers can see trades happen, but can't trace them back to you.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-large" onClick={onConnectWallet}>
            Start Trading Privately
          </button>
          <a href="#how-it-works" className="btn btn-secondary btn-large">
            How It Works
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <div className="privacy-diagram">
          <div className="diagram-node source">
            <span>Your Wallet</span>
          </div>
          <div className="diagram-arrow">
            <div className="arrow-line" />
            <span className="arrow-label">Shielded</span>
          </div>
          <div className="diagram-node vault">
            <span>HedgeVeil</span>
          </div>
          <div className="diagram-arrow">
            <div className="arrow-line" />
            <span className="arrow-label">Unlinkable</span>
          </div>
          <div className="diagram-node dest">
            <span>Markets</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ onDisconnect }) {
  const { publicKey } = useWallet()
  const [activeTab, setActiveTab] = useState('shield')

  // Mock state for demo
  const [shieldedBalance, setShieldedBalance] = useState(0)
  const [positions, setPositions] = useState([])
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0)

  const handleShield = (amount) => {
    setShieldedBalance(prev => prev + amount)
  }

  const handleTrade = (trade) => {
    const cost = trade.amount
    if (cost <= shieldedBalance) {
      setShieldedBalance(prev => prev - cost)
      setPositions(prev => [...prev, {
        id: Date.now(),
        market: trade.market,
        position: trade.position,
        amount: trade.amount,
        entryPrice: trade.position === 'YES' ? 0.65 : 0.35,
        currentPrice: trade.position === 'YES' ? 0.67 : 0.33,
      }])
      return true
    }
    return false
  }

  const handleWithdraw = (amount) => {
    if (amount <= shieldedBalance) {
      setShieldedBalance(prev => prev - amount)
      setPendingWithdrawals(prev => prev + amount)
      setTimeout(() => {
        setPendingWithdrawals(prev => prev - amount)
      }, 3000)
      return true
    }
    return false
  }

  return (
    <div className="dashboard">
      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="label">Shielded Balance</div>
          <div className="value green">{shieldedBalance.toFixed(2)} USDC</div>
        </div>
        <div className="stat-card">
          <div className="label">Active Positions</div>
          <div className="value purple">{positions.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Pending Withdrawals</div>
          <div className="value">{pendingWithdrawals.toFixed(2)} USDC</div>
        </div>
        <div className="stat-card">
          <div className="label">Privacy Status</div>
          <div className="value green">Shielded</div>
        </div>
      </div>

      {/* Flow Tabs */}
      <div className="flow-tabs">
        <button
          className={`flow-tab ${activeTab === 'shield' ? 'active' : ''}`}
          onClick={() => setActiveTab('shield')}
        >
          Shield
        </button>
        <button
          className={`flow-tab ${activeTab === 'trade' ? 'active' : ''}`}
          onClick={() => setActiveTab('trade')}
        >
          Trade
        </button>
        <button
          className={`flow-tab ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
      </div>

      {/* Flow Panels */}
      {activeTab === 'shield' && (
        <ShieldFlow onShield={handleShield} />
      )}
      {activeTab === 'trade' && (
        <TradeFlow
          shieldedBalance={shieldedBalance}
          onTrade={handleTrade}
        />
      )}
      {activeTab === 'withdraw' && (
        <WithdrawFlow
          shieldedBalance={shieldedBalance}
          onWithdraw={handleWithdraw}
        />
      )}

      {/* Positions List */}
      {positions.length > 0 && (
        <div className="positions-list">
          <h3>Your Veiled Positions</h3>
          {positions.map(position => {
            const pnl = ((position.currentPrice - position.entryPrice) / position.entryPrice * 100).toFixed(1)
            const pnlClass = parseFloat(pnl) >= 0 ? 'positive' : 'negative'
            return (
              <div key={position.id} className="position-item">
                <div className="position-info">
                  <div className="position-market">{position.market}</div>
                  <div className="position-details">
                    {position.position} @ {position.entryPrice.toFixed(2)} · {position.amount} USDC
                  </div>
                </div>
                <div className="position-value">
                  <div className="amount">{(position.amount * position.currentPrice / position.entryPrice).toFixed(2)} USDC</div>
                  <div className={`pnl ${pnlClass}`}>{pnlClass === 'positive' ? '+' : ''}{pnl}%</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MainContent() {
  const { publicKey } = useWallet()
  const [showWalletModal, setShowWalletModal] = useState(false)

  const openWalletModal = useCallback(() => setShowWalletModal(true), [])
  const closeWalletModal = useCallback(() => setShowWalletModal(false), [])

  if (publicKey) {
    return <Dashboard />
  }

  return (
    <>
      <HeroSection onConnectWallet={openWalletModal} />
      <MarketsList onConnectWallet={openWalletModal} />
      <WalletModal isOpen={showWalletModal} onClose={closeWalletModal} />
    </>
  )
}

function App() {
  const network = 'devnet'
  const endpoint = useMemo(() => clusterApiUrl(network), [network])
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [])

  const [showWalletModal, setShowWalletModal] = useState(false)

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <AppContent
          showWalletModal={showWalletModal}
          setShowWalletModal={setShowWalletModal}
        />
      </WalletProvider>
    </ConnectionProvider>
  )
}

function AppContent({ showWalletModal, setShowWalletModal }) {
  const { publicKey } = useWallet()
  const [localShowModal, setLocalShowModal] = useState(false)

  const openWalletModal = useCallback(() => setLocalShowModal(true), [])
  const closeWalletModal = useCallback(() => setLocalShowModal(false), [])

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">H</div>
          <h1>HedgeVeil</h1>
        </div>
        <nav className="header-nav">
          <a href="#markets" className="nav-link">Markets</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#docs" className="nav-link">Docs</a>
        </nav>
        <ConnectButton onClick={openWalletModal} />
      </header>

      <main className="main-content">
        {publicKey ? (
          <Dashboard />
        ) : (
          <>
            <HeroSection onConnectWallet={openWalletModal} />
            <MarketsList onConnectWallet={openWalletModal} />
          </>
        )}
      </main>

      <footer className="footer">
        <div className="footer-links">
          <a href="#privacy">Privacy Model</a>
          <a href="#docs">Documentation</a>
          <a href="#github">GitHub</a>
        </div>
        <p className="footer-disclaimer">
          HedgeVeil breaks on-chain linkage between your wallet and prediction market positions.
          It does not hide trades or provide regulatory evasion.
          See our privacy model for what is and isn't protected.
        </p>
      </footer>

      <WalletModal isOpen={localShowModal} onClose={closeWalletModal} />
    </div>
  )
}

export default App
