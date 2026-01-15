import React, { useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

// Curated list of popular wallets to show
const FEATURED_WALLETS = ['Phantom', 'Solflare']

function WalletModal({ isOpen, onClose }) {
  const { wallets, select, connecting } = useWallet()

  const handleWalletSelect = useCallback((walletName) => {
    select(walletName)
    onClose()
  }, [select, onClose])

  if (!isOpen) return null

  // Filter to show only installed wallets first, then featured ones
  const installedWallets = wallets.filter(w => w.readyState === 'Installed')
  const featuredWallets = wallets.filter(
    w => FEATURED_WALLETS.includes(w.adapter.name) && w.readyState !== 'Installed'
  )

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={e => e.stopPropagation()}>
        <div className="wallet-modal-header">
          <h3>Connect Wallet</h3>
          <button className="wallet-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="wallet-modal-subtitle">
          Connect your Solana wallet to start trading privately on prediction markets.
        </p>

        <div className="wallet-list">
          {installedWallets.length > 0 && (
            <>
              <div className="wallet-section-label">Detected</div>
              {installedWallets.map(wallet => (
                <button
                  key={wallet.adapter.name}
                  className="wallet-option detected"
                  onClick={() => handleWalletSelect(wallet.adapter.name)}
                  disabled={connecting}
                >
                  <img
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    className="wallet-icon"
                  />
                  <span className="wallet-name">{wallet.adapter.name}</span>
                  <span className="wallet-status">Installed</span>
                </button>
              ))}
            </>
          )}

          {featuredWallets.length > 0 && (
            <>
              <div className="wallet-section-label">Popular Wallets</div>
              {featuredWallets.map(wallet => (
                <button
                  key={wallet.adapter.name}
                  className="wallet-option"
                  onClick={() => handleWalletSelect(wallet.adapter.name)}
                  disabled={connecting}
                >
                  <img
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    className="wallet-icon"
                  />
                  <span className="wallet-name">{wallet.adapter.name}</span>
                </button>
              ))}
            </>
          )}

          {installedWallets.length === 0 && featuredWallets.length === 0 && (
            <div className="wallet-empty">
              <p>No wallets detected.</p>
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}
              >
                Get Phantom Wallet
              </a>
            </div>
          )}
        </div>

        <div className="wallet-modal-footer">
          <span className="wallet-security-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Your keys stay in your wallet
          </span>
        </div>
      </div>
    </div>
  )
}

export default WalletModal
