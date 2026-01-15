# Hedgeveil – Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** Hedgeveil
**Category:** Privacy Infrastructure / Prediction Market Tooling
**Stage:** Hackathon MVP

### 1.1 Problem Statement

Prediction markets like Polymarket and Kalshi operate with transparent order books and on-chain/public settlement, making all positions, trades, and strategies observable. This creates several issues:

* Traders expose their positions to competitors
* Whales reveal market-moving intent
* Funds and identities can be trivially linked across trades
* Strategy alpha is leaked through position visibility

While transparency is core to market integrity, **linkability** between a trader's identity and their positions is not strictly required.

### 1.2 Solution

**Hedgeveil** is a privacy-preserving trading relay that prevents observers from linking a user's wallet to their prediction market positions across platforms like Polymarket, Kalshi, and other prediction markets.

Hedgeveil does **not** hide markets or outcomes. Instead, it breaks the linkage between:

* User wallet ↔ execution address
* Execution address ↔ withdrawal address

This is achieved through a Solana-based privacy layer and cross-chain private routing to destination markets.

### 1.3 Supported Markets

* **Polymarket** (Polygon) – Crypto-native prediction market
* **Kalshi** (Centralized) – CFTC-regulated prediction exchange
* Additional markets planned for future integration

### 1.4 Non-Goals (Explicit)

To avoid overclaiming, Hedgeveil does **not**:

* Hide the existence of trades or positions on prediction markets
* Modify or fork any prediction market's smart contracts
* Guarantee anonymity against global adversaries
* Provide regulatory evasion
* Bypass KYC requirements on regulated platforms (e.g., Kalshi)

---

## 2. Target Users

### Primary Users

* Active prediction market traders (Polymarket, Kalshi, etc.)
* High-volume or strategy-sensitive traders
* DAO treasuries or funds experimenting with prediction markets

### Secondary Users

* Researchers studying prediction markets
* Privacy-focused DeFi users
* Hackathon judges / developers

---

## 3. User Journey (MVP)

### 3.1 Deposit (Shield)

1. User connects Solana wallet
2. User deposits SOL or USDC into **Hedgeveil Vault**
3. Funds enter a shielded balance via **Privacy Cash**
4. User receives a private balance (not publicly linkable)

### 3.2 Trade Execution (Veiled)

1. User selects a prediction market (e.g., Polymarket, Kalshi)
2. User selects a market and position
3. User signs an off-chain trade intent
4. Hedgeveil relayer:
   * Routes funds privately via **SilentSwap**
   * Uses a fresh execution address
5. Trade is executed on the selected prediction market

### 3.3 Position Holding

* Positions are held by burner / relayer-controlled addresses
* On-chain observers see positions but cannot link them to the user

### 3.4 Withdrawal (Unveil)

1. User requests withdrawal
2. Profits are routed back via SilentSwap
3. Funds return to Hedgeveil Vault
4. User withdraws to a new or existing Solana address

---

## 4. Functional Requirements

### 4.1 Privacy Vault (Solana)

* Shielded deposits and withdrawals
* Unlinkable balance accounting
* Support SOL and USDC

### 4.2 Relayer Service

* Accept signed trade intents
* Manage burner wallets per market
* Execute trades on supported prediction markets
* Track positions internally

### 4.3 Cross-Chain Privacy

* Solana ↔ Polygon routing via SilentSwap (for Polymarket)
* Solana ↔ Fiat rails (for Kalshi, future)
* No direct wallet linkage
* No pooled custody

### 4.4 Frontend

* Wallet connection (Solana)
* Market browser with multi-platform support
* Shield / trade / withdraw flows
* Clear privacy disclosures

### 4.5 Observability (Infra)

* Use **Helius RPCs** for:
  * Vault state monitoring
  * Relayer execution confirmation

---

## 5. Privacy Model

### Threat Model Covered

* Blockchain observers
* Portfolio tracking tools
* Strategy inference via address clustering
* Cross-platform position correlation

### Threat Model Not Covered

* Relayer compromise
* Global timing analysis
* Off-chain surveillance
* Platform-level KYC data (for regulated markets)

---

## 6. Technical Architecture

### On-Chain (Solana)

* Privacy Cash SDK
* Hedgeveil Vault Program

### Off-Chain

* Relayer (Node.js / Rust)
* Trade intent signing
* Position tracking
* Market adapters (Polymarket, Kalshi, etc.)

### Cross-Chain

* SilentSwap routing
* Market-specific execution wallets

### Frontend

* **Vite-based frontend** (React)
* Solana Wallet Adapter
* Multi-market UI

---

## 7. Compliance & Safety (Optional)

* Optional pre-screening via **Range**
* Selective disclosure support
* No direct custody of user identity
* Respects platform-specific compliance requirements

---

## 8. MVP Scope (Hackathon)

### Included

* Deposit → trade → withdraw demo
* Demo prediction markets (simulated)
* One supported asset (USDC)
* Manual relayer control

### Excluded

* Live Polymarket/Kalshi integration
* Automated market discovery
* Advanced ZK proofs
* Multi-market portfolios
* Mobile UX

---

## 9. Success Criteria

### Technical

* Funds cannot be trivially linked across chains
* Trade executes successfully via relayer

### Product

* Clear user understanding of privacy guarantees
* Judges understand what is hidden vs visible
* Platform-agnostic architecture demonstrated

### Demo

* Live execution or recorded fallback
* End-to-end flow shown in under 3 minutes

---

## 10. Risks & Mitigations

| Risk                 | Mitigation                          |
| -------------------- | ----------------------------------- |
| Overclaiming privacy | Explicit non-goals section          |
| Relayer trust        | Burner wallets + scoped permissions |
| Cross-chain failure  | Mocked or testnet demo              |
| Regulatory concerns  | Clear compliance disclaimers        |

---

## 11. Future Extensions

* ZK ownership proofs (Aztec / Noir)
* Non-custodial relayer network
* DAO-managed relayers
* Live Polymarket integration
* Kalshi integration via regulated channels
* Support additional prediction markets (Augur, Gnosis, etc.)

---

## 12. One-Sentence Pitch

> **Hedgeveil** is a privacy relay that lets users trade on prediction markets like Polymarket and Kalshi without revealing their positions to observers.
