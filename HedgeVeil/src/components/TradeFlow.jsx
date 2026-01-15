import React, { useState } from 'react'

// Mock market data for demo
const DEMO_MARKET = {
  id: 'btc-100k-2025',
  title: 'Will Bitcoin reach $100,000 by end of 2025?',
  volume: '2.4M',
  liquidity: '580K',
  yesPrice: 0.65,
  noPrice: 0.35,
  endDate: 'Dec 31, 2025',
}

function TradeFlow({ shieldedBalance, onTrade }) {
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStatus, setTxStatus] = useState(null)
  const [error, setError] = useState(null)

  const handleTrade = async () => {
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0 || !selectedPosition) return

    if (value > shieldedBalance) {
      setError('Insufficient shielded balance')
      return
    }

    setError(null)
    setIsProcessing(true)
    setTxStatus({ step: 1, message: 'Signing trade intent...' })

    // Simulate the veiled trade process
    await new Promise(r => setTimeout(r, 800))
    setTxStatus({ step: 2, message: 'Routing via SilentSwap...' })

    await new Promise(r => setTimeout(r, 1500))
    setTxStatus({ step: 3, message: 'Executing on Polygon via fresh address...' })

    await new Promise(r => setTimeout(r, 1200))
    setTxStatus({ step: 4, message: 'Trade confirmed!' })

    const success = onTrade({
      market: DEMO_MARKET.title,
      position: selectedPosition,
      amount: value,
    })

    if (success) {
      setAmount('')
      setSelectedPosition(null)
    }

    setTimeout(() => {
      setIsProcessing(false)
      setTxStatus(null)
    }, 2000)
  }

  const estimatedShares = amount && selectedPosition
    ? (parseFloat(amount) / (selectedPosition === 'YES' ? DEMO_MARKET.yesPrice : DEMO_MARKET.noPrice)).toFixed(2)
    : '0'

  return (
    <div className="flow-panel">
      <h3>Execute Veiled Trade</h3>
      <p className="description">
        Trade on prediction markets without linking your wallet.
        Your position will be held by a relayer-controlled address.
      </p>

      {/* Market Card */}
      <div className="market-card">
        <div className="market-title">{DEMO_MARKET.title}</div>
        <div className="market-info">
          Volume: ${DEMO_MARKET.volume} · Liquidity: ${DEMO_MARKET.liquidity} · Ends: {DEMO_MARKET.endDate}
        </div>
      </div>

      {/* Position Selection */}
      <div className="form-group">
        <label>Select Position</label>
        <div className="trade-options">
          <div
            className={`trade-option yes ${selectedPosition === 'YES' ? 'selected' : ''}`}
            onClick={() => !isProcessing && setSelectedPosition('YES')}
          >
            <div className="option-label">YES</div>
            <div className="option-price">{(DEMO_MARKET.yesPrice * 100).toFixed(0)}¢</div>
          </div>
          <div
            className={`trade-option no ${selectedPosition === 'NO' ? 'selected' : ''}`}
            onClick={() => !isProcessing && setSelectedPosition('NO')}
          >
            <div className="option-label">NO</div>
            <div className="option-price">{(DEMO_MARKET.noPrice * 100).toFixed(0)}¢</div>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="form-group">
        <label>Amount (USDC) · Available: {shieldedBalance.toFixed(2)}</label>
        <input
          type="number"
          placeholder="Enter trade amount"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            setError(null)
          }}
          disabled={isProcessing}
          min="0"
          step="0.01"
        />
        {amount && selectedPosition && (
          <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            ≈ {estimatedShares} shares at {(selectedPosition === 'YES' ? DEMO_MARKET.yesPrice : DEMO_MARKET.noPrice) * 100}¢ each
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--accent-red)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <button
        className="btn btn-success"
        onClick={handleTrade}
        disabled={isProcessing || !amount || !selectedPosition || parseFloat(amount) <= 0}
      >
        {isProcessing ? (
          <>
            <span className="spinner"></span>
            Executing...
          </>
        ) : (
          `Buy ${selectedPosition || '...'} (Veiled)`
        )}
      </button>

      {txStatus && (
        <div className="tx-status">
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 1 ? 'complete' : 'waiting'}`}>
              {txStatus.step >= 1 ? '✓' : ''}
            </span>
            <span>Sign trade intent (off-chain)</span>
          </div>
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 2 ? (txStatus.step === 2 ? 'pending' : 'complete') : 'waiting'}`}>
              {txStatus.step > 2 ? '✓' : ''}
            </span>
            <span>Route via SilentSwap (Solana → Polygon)</span>
          </div>
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 3 ? (txStatus.step === 3 ? 'pending' : 'complete') : 'waiting'}`}>
              {txStatus.step > 3 ? '✓' : ''}
            </span>
            <span>Execute via fresh Polygon address</span>
          </div>
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 4 ? 'complete' : 'waiting'}`}>
              {txStatus.step >= 4 ? '✓' : ''}
            </span>
            <span>Position confirmed</span>
          </div>
        </div>
      )}

      <div className="privacy-notice">
        <div className="notice-title">
          <span>🔒</span>
          What's Hidden
        </div>
        <p className="notice-text">
          <strong>Hidden:</strong> Link between your Solana wallet and the Polygon execution address.<br/>
          <strong>Visible:</strong> The trade itself on the market (position, amount, market).
          <br/><br/>
          Observers can see that *someone* took this position, but cannot determine it was you.
        </p>
      </div>
    </div>
  )
}

export default TradeFlow
