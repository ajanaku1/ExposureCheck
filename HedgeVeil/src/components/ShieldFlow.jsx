import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

function ShieldFlow({ onShield }) {
  const { publicKey } = useWallet()
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStatus, setTxStatus] = useState(null)

  const handleShield = async () => {
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) return

    setIsProcessing(true)
    setTxStatus({ step: 1, message: 'Preparing deposit...' })

    // Simulate the shielding process
    await new Promise(r => setTimeout(r, 1000))
    setTxStatus({ step: 2, message: 'Depositing to Privacy Cash vault...' })

    await new Promise(r => setTimeout(r, 1500))
    setTxStatus({ step: 3, message: 'Generating shielded balance...' })

    await new Promise(r => setTimeout(r, 1000))
    setTxStatus({ step: 4, message: 'Complete! Funds are now shielded.' })

    onShield(value)
    setAmount('')

    setTimeout(() => {
      setIsProcessing(false)
      setTxStatus(null)
    }, 2000)
  }

  return (
    <div className="flow-panel">
      <h3>Shield Funds</h3>
      <p className="description">
        Deposit USDC into the HedgeVeil vault to create a shielded balance.
        Your deposit address will not be linked to your trading activity.
      </p>

      <div className="form-group">
        <label>Amount (USDC)</label>
        <input
          type="number"
          placeholder="Enter amount to shield"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isProcessing}
          min="0"
          step="0.01"
        />
      </div>

      <div className="form-group">
        <label>From Wallet</label>
        <input
          type="text"
          value={publicKey?.toBase58().slice(0, 8) + '...' + publicKey?.toBase58().slice(-8) || ''}
          disabled
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleShield}
        disabled={isProcessing || !amount || parseFloat(amount) <= 0}
      >
        {isProcessing ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : (
          'Shield Funds'
        )}
      </button>

      {txStatus && (
        <div className="tx-status">
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 1 ? 'complete' : 'waiting'}`}>
              {txStatus.step >= 1 ? '✓' : ''}
            </span>
            <span>Prepare deposit</span>
          </div>
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 2 ? (txStatus.step === 2 ? 'pending' : 'complete') : 'waiting'}`}>
              {txStatus.step > 2 ? '✓' : ''}
            </span>
            <span>Deposit to vault</span>
          </div>
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 3 ? (txStatus.step === 3 ? 'pending' : 'complete') : 'waiting'}`}>
              {txStatus.step > 3 ? '✓' : ''}
            </span>
            <span>Generate shielded balance</span>
          </div>
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 4 ? 'complete' : 'waiting'}`}>
              {txStatus.step >= 4 ? '✓' : ''}
            </span>
            <span>Shielding complete</span>
          </div>
        </div>
      )}

      <div className="privacy-notice">
        <div className="notice-title">
          <span>🛡️</span>
          Privacy Guarantee
        </div>
        <p className="notice-text">
          Once shielded, your funds enter the Privacy Cash pool.
          On-chain observers cannot link this deposit to any subsequent trades you make through HedgeVeil.
        </p>
      </div>
    </div>
  )
}

export default ShieldFlow
