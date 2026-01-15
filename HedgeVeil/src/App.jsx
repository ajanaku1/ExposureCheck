import React, { useMemo, useState } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from '@solana/wallet-adapter-react'
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'

import ShieldFlow from './components/ShieldFlow'
import TradeFlow from './components/TradeFlow'
import WithdrawFlow from './components/WithdrawFlow'

function Dashboard() {
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
      // Simulate withdrawal completion
      setTimeout(() => {
        setPendingWithdrawals(prev => prev - amount)
      }, 3000)
      return true
    }
    return false
  }

  if (!publicKey) {
    return (
      <div className="connect-prompt">
        <div className="logo-icon" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>H</div>
        <h2>Welcome to HedgeVeil</h2>
        <p>
          Trade on Polymarket privately. Connect your Solana wallet to shield your
          positions from on-chain observers.
        </p>
        <WalletMultiButton />
      </div>
    )
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

function App() {
  const network = 'devnet'
  const endpoint = useMemo(() => clusterApiUrl(network), [network])
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="app">
            <header className="header">
              <div className="logo">
                <div className="logo-icon">H</div>
                <h1>HedgeVeil</h1>
              </div>
              <WalletMultiButton />
            </header>

            <main className="main-content">
              <Dashboard />
            </main>

            <footer className="footer">
              <div className="footer-links">
                <a href="#privacy">Privacy Model</a>
                <a href="#docs">Documentation</a>
                <a href="#github">GitHub</a>
              </div>
              <p className="footer-disclaimer">
                HedgeVeil breaks on-chain linkage between your wallet and Polymarket positions.
                It does not hide trades or provide regulatory evasion.
                See our privacy model for what is and isn't protected.
              </p>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
