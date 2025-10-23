import type { Timestamp } from 'firebase/firestore'

/**
 * Portfolio Document Interface
 *
 * Firestore path: users/{userId}/portfolios/{portfolioId}
 *
 * Represents a trading portfolio containing trades and journal entries.
 * Each user can have multiple portfolios for different trading strategies or markets.
 */
export interface Portfolio {
  id: string
  name: string
  description?: string
  initialCapital: number
  baseCurrency: string  // 'IDR', 'USD', etc.
  marketType: string    // 'IDX', 'US_STOCKS', 'CRYPTO', 'FOREX'
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Portfolio Create Input (without auto-generated fields)
 * Used when creating a new portfolio
 */
export interface PortfolioInput {
  name: string
  description?: string
  initialCapital: number
  baseCurrency: string
  marketType: string
}

/**
 * Trade Document Interface
 *
 * Firestore path: users/{userId}/portfolios/{portfolioId}/trades/{tradeId}
 *
 * Represents a single buy or sell trade transaction.
 * Trades are stored as subcollection under portfolios.
 */
export interface Trade {
  id: string
  portfolioId: string
  symbol: string        // Stock symbol, e.g., 'BBCA', 'BBRI', 'TLKM'
  type: 'BUY' | 'SELL'
  quantity: number      // Number of shares
  price: number         // Price per share
  date: Timestamp       // Trade execution date
  fees?: number         // Transaction fees (broker commission, tax, etc.)
  notes?: string        // Quick notes about the trade
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Trade Create Input (without auto-generated fields)
 * Used when creating a new trade
 */
export interface TradeInput {
  portfolioId: string
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  date: Date | Timestamp
  fees?: number
  notes?: string
}

/**
 * Journal Entry Document Interface
 *
 * Firestore path: users/{userId}/portfolios/{portfolioId}/journals/{journalId}
 *
 * Represents a journal entry for trading reflection and analysis.
 * Can be linked to a specific trade or be a standalone reflection.
 */
export interface Journal {
  id: string
  portfolioId: string
  tradeId?: string      // Optional reference to a trade
  entryReason?: string  // Why did you enter this position?
  exitStrategy?: string // What's your exit plan?
  emotions?: string     // How are you feeling about this trade?
  lessonsLearned?: string // What did you learn from this trade?
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Journal Create Input (without auto-generated fields)
 * Used when creating a new journal entry
 */
export interface JournalInput {
  portfolioId: string
  tradeId?: string
  entryReason?: string
  exitStrategy?: string
  emotions?: string
  lessonsLearned?: string
}

/**
 * Position Interface (computed from trades)
 *
 * Represents current holdings of a stock symbol.
 * This is calculated client-side from trades, not stored in Firestore.
 */
export interface Position {
  symbol: string
  quantity: number          // Current shares held
  averageBuyPrice: number   // Average cost basis (FIFO)
  totalCost: number         // Total money invested
  currentPrice?: number     // Latest price (manual input or from API)
  marketValue?: number      // Current value (quantity * currentPrice)
  unrealizedPnL?: number    // Unrealized profit/loss
  unrealizedPnLPercent?: number
}

/**
 * Closed Trade (for P&L calculation)
 *
 * Represents a completed trade pair (buy + sell) using FIFO matching.
 * Calculated client-side from trades.
 */
export interface ClosedTrade {
  symbol: string
  buyTradeId: string
  sellTradeId: string
  quantity: number
  buyPrice: number
  sellPrice: number
  buyDate: Timestamp
  sellDate: Timestamp
  realizedPnL: number
  realizedPnLPercent: number
  fees: number
}

/**
 * Portfolio Statistics (computed)
 *
 * Aggregated statistics for a portfolio.
 * Calculated client-side from trades and positions.
 */
export interface PortfolioStats {
  portfolioId: string
  totalValue: number          // Initial capital + realized P&L + unrealized P&L
  realizedPnL: number         // Total profit/loss from closed trades
  unrealizedPnL: number       // Profit/loss from open positions
  totalReturn: number         // Total return percentage
  totalReturnPercent: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number             // Percentage of winning trades
  profitFactor: number        // Total gains / Total losses
  averageGain: number
  averageLoss: number
  largestWin: number
  largestLoss: number
  currentPositions: Position[]
}

/**
 * Market Types supported
 */
export const MARKET_TYPES = {
  IDX: 'IDX',                 // Indonesia Stock Exchange
  US_STOCKS: 'US_STOCKS',     // US Stock Market
  CRYPTO: 'CRYPTO',           // Cryptocurrency
  FOREX: 'FOREX',             // Foreign Exchange
} as const

export type MarketType = typeof MARKET_TYPES[keyof typeof MARKET_TYPES]

/**
 * Supported currencies
 */
export const CURRENCIES = {
  IDR: 'IDR',  // Indonesian Rupiah
  USD: 'USD',  // US Dollar
  EUR: 'EUR',  // Euro
  SGD: 'SGD',  // Singapore Dollar
  JPY: 'JPY',  // Japanese Yen
} as const

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES]
