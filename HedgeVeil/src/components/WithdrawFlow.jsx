import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

function WithdrawFlow({ shieldedBalance, onWithdraw }) {
  const { publicKey } = useWallet()
  const [amount, setAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('current')
  const [customAddress, setCustomAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStatus, setTxStatus] = useState(null)
  const [error, setError] = useState(null)

  const handleWithdraw = async () => {
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) return

    if (value > shieldedBalance) {
      setError('Insufficient shielded balance')
      return
    }

    if (withdrawAddress === 'custom' && !customAddress) {
      setError('Please enter a withdrawal address')
      return
    }

    setError(null)
    setIsProcessing(true)
    setTxStatus({ step: 1, message: 'Preparing withdrawal...' })

    // Simulate the withdrawal process
    await new Promise(r => setTimeout(r, 1000))
    setTxStatus({ step: 2, message: 'Routing back via SilentSwap...' })

    await new Promise(r => setTimeout(r, 1500))
    setTxStatus({ step: 3, message: 'Processing through Privacy Cash...' })

    await new Promise(r => setTimeout(r, 1200))
    setTxStatus({ step: 4, message: 'Withdrawal complete!' })

    const success = onWithdraw(value)

    if (success) {
      setAmount('')
    }

    setTimeout(() => {
      setIsProcessing(false)
      setTxStatus(null)
    }, 2000)
  }

  const destinationAddress = withdrawAddress === 'current'
    ? publicKey?.toBase58()
    : customAddress

  return (
    <div className="flow-panel">
      <h3>Withdraw Funds</h3>
      <p className="description">
        Withdraw your shielded balance to any Solana address.
        The withdrawal will be unlinkable from your original deposit or trades.
      </p>

      {/* Amount Input */}
      <div className="form-group">
        <label>Amount (USDC) · Available: {shieldedBalance.toFixed(2)}</label>
        <input
          type="number"
          placeholder="Enter withdrawal amount"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            setError(null)
          }}
          disabled={isProcessing}
          min="0"
          step="0.01"
          max={shieldedBalance}
        />
      </div>

      {/* Destination Selection */}
      <div className="form-group">
        <label>Withdrawal Destination</label>
        <select
          value={withdrawAddress}
          onChange={(e) => setWithdrawAddress(e.target.value)}
          disabled={isProcessing}
        >
          <option value="current">Current Connected Wallet</option>
          <option value="custom">Different Address (Enhanced Privacy)</option>
        </select>
      </div>

      {withdrawAddress === 'custom' && (
        <div className="form-group">
          <label>Destination Address</label>
          <input
            type="text"
            placeholder="Enter Solana address"
            value={customAddress}
            onChange={(e) => {
              setCustomAddress(e.target.value)
              setError(null)
            }}
            disabled={isProcessing}
          />
        </div>
      )}

      {/* Preview */}
      {destinationAddress && (
        <div className="market-card">
          <div className="market-title">Withdrawal Preview</div>
          <div className="market-info">
            To: {destinationAddress?.slice(0, 12)}...{destinationAddress?.slice(-8)}<br/>
            Amount: {amount || '0'} USDC
            {withdrawAddress === 'custom' && (
              <><br/><span style={{ color: 'var(--accent-green)' }}>✓ Enhanced privacy (new address)</span></>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--accent-red)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleWithdraw}
        disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > shieldedBalance}
      >
        {isProcessing ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : (
          'Withdraw Funds'
        )}
      </button>

      {txStatus && (
        <div className="tx-status">
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 1 ? 'complete' : 'waiting'}`}>
              {txStatus.step >= 1 ? '✓' : ''}
            </span>
            <span>Prepare withdrawal</span>
          </div>
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 2 ? (txStatus.step === 2 ? 'pending' : 'complete') : 'waiting'}`}>
              {txStatus.step > 2 ? '✓' : ''}
            </span>
            <span>Route via SilentSwap</span>
          </div>
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 3 ? (txStatus.step === 3 ? 'pending' : 'complete') : 'waiting'}`}>
              {txStatus.step > 3 ? '✓' : ''}
            </span>
            <span>Process through Privacy Cash</span>
          </div>
          <div className="status-item">
            <span className={`status-icon ${txStatus.step >= 4 ? 'complete' : 'waiting'}`}>
              {txStatus.step >= 4 ? '✓' : ''}
            </span>
            <span>Funds delivered</span>
          </div>
        </div>
      )}

      <div className="privacy-notice">
        <div className="notice-title">
          <span>🛡️</span>
          Privacy Tip
        </div>
        <p className="notice-text">
          For maximum privacy, withdraw to a <strong>fresh address</strong> that has no prior
          transaction history. This breaks all on-chain linkage between your original deposit,
          your trades, and your withdrawal.
        </p>
      </div>
    </div>
  )
}

export default WithdrawFlow
