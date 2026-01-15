import React from 'react'

// Demo markets data
const MARKETS = [
  {
    id: 'btc-100k-2025',
    title: 'Will Bitcoin reach $100,000 by end of 2025?',
    category: 'Crypto',
    volume: '2.4M',
    liquidity: '580K',
    yesPrice: 0.65,
    endDate: 'Dec 31, 2025',
    trending: true,
  },
  {
    id: 'fed-rate-cut',
    title: 'Will the Fed cut rates in Q1 2025?',
    category: 'Economics',
    volume: '1.8M',
    liquidity: '420K',
    yesPrice: 0.42,
    endDate: 'Mar 31, 2025',
    trending: true,
  },
  {
    id: 'eth-eth2-merge',
    title: 'Will ETH price exceed $5,000 in 2025?',
    category: 'Crypto',
    volume: '980K',
    liquidity: '290K',
    yesPrice: 0.38,
    endDate: 'Dec 31, 2025',
    trending: false,
  },
  {
    id: 'ai-regulation',
    title: 'Will US pass major AI regulation in 2025?',
    category: 'Politics',
    volume: '750K',
    liquidity: '180K',
    yesPrice: 0.55,
    endDate: 'Dec 31, 2025',
    trending: false,
  },
]

function MarketsList({ onConnectWallet }) {
  return (
    <div className="markets-section">
      <div className="markets-header">
        <h2>Available Markets</h2>
        <p className="markets-subtitle">
          Browse prediction markets. Connect wallet to trade privately.
        </p>
      </div>

      <div className="markets-grid">
        {MARKETS.map(market => (
          <div key={market.id} className="market-preview-card">
            <div className="market-preview-header">
              <span className="market-category">{market.category}</span>
              {market.trending && <span className="market-trending">Trending</span>}
            </div>

            <h3 className="market-preview-title">{market.title}</h3>

            <div className="market-preview-odds">
              <div className="odds-bar">
                <div
                  className="odds-fill yes"
                  style={{ width: `${market.yesPrice * 100}%` }}
                />
              </div>
              <div className="odds-labels">
                <span className="odds-yes">YES {(market.yesPrice * 100).toFixed(0)}¢</span>
                <span className="odds-no">NO {((1 - market.yesPrice) * 100).toFixed(0)}¢</span>
              </div>
            </div>

            <div className="market-preview-stats">
              <span>Vol: ${market.volume}</span>
              <span>·</span>
              <span>Ends: {market.endDate}</span>
            </div>

            <button className="btn btn-trade-preview" onClick={onConnectWallet}>
              Trade Privately
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MarketsList
