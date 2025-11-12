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
  strategyId?: string   // Optional reference to a strategy
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
  strategyId?: string
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

/**
 * Strategy Rule Types
 */
export const RULE_TYPES = {
  CHECKLIST: 'CHECKLIST',     // Simple checklist item
  CONDITION: 'CONDITION',     // Logical condition with field, operator, value
  TEMPLATE: 'TEMPLATE',       // Structured template with category
} as const

export type RuleType = typeof RULE_TYPES[keyof typeof RULE_TYPES]

/**
 * Rule Logical Operators for chaining conditions
 */
export const LOGICAL_OPERATORS = {
  AND: 'AND',
  OR: 'OR',
} as const

export type LogicalOperator = typeof LOGICAL_OPERATORS[keyof typeof LOGICAL_OPERATORS]

/**
 * Rule Comparison Operators
 */
export const COMPARISON_OPERATORS = {
  LESS_THAN: '<',
  GREATER_THAN: '>',
  LESS_THAN_OR_EQUAL: '<=',
  GREATER_THAN_OR_EQUAL: '>=',
  EQUALS: '==',
  NOT_EQUALS: '!=',
} as const

export type ComparisonOperator = typeof COMPARISON_OPERATORS[keyof typeof COMPARISON_OPERATORS]

/**
 * Strategy Rule Interface
 *
 * Represents a single rule within a trading strategy.
 * Rules can be of different types: checklist, condition, or template.
 */
export interface StrategyRule {
  id: string
  type: RuleType
  description: string

  // For CHECKLIST type
  checked?: boolean

  // For CONDITION type
  field?: string               // e.g., 'RSI', 'Volume', 'Price', 'MACD'
  operator?: ComparisonOperator
  value?: string | number
  logicalOp?: LogicalOperator  // For chaining multiple conditions

  // For TEMPLATE type
  category?: string            // e.g., 'Technical', 'Fundamental', 'Risk Management'
  templateData?: Record<string, any>
}

/**
 * Strategy Document Interface
 *
 * Firestore path: users/{userId}/strategies/{strategyId}
 *
 * Represents a trading strategy with entry and exit rules.
 * Strategies are global (not tied to a specific portfolio).
 */
export interface Strategy {
  id: string
  userId: string
  name: string
  description?: string
  entryRules: StrategyRule[]
  exitRules: StrategyRule[]
  tags?: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Strategy Create Input (without auto-generated fields)
 * Used when creating a new strategy
 */
export interface StrategyInput {
  name: string
  description?: string
  entryRules: StrategyRule[]
  exitRules: StrategyRule[]
  tags?: string[]
}

/**
 * Strategy Statistics (computed)
 *
 * Performance statistics for a specific strategy.
 * Calculated client-side from trades linked to this strategy.
 */
export interface StrategyStats {
  strategyId: string
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number             // Percentage of winning trades
  profitFactor: number        // Total gains / Total losses
  averageGain: number
  averageLoss: number
  largestWin: number
  largestLoss: number
  totalPnL: number            // Total profit/loss from all trades
  totalPnLPercent: number
}

/**
 * Watchlist Item Status
 *
 * Status lifecycle for watchlist items
 */
export const WATCHLIST_STATUS = {
  PLANNED: 'planned',       // Initial state when added to watchlist
  EXECUTED: 'executed',     // Item was traded (linked to actual trade)
  SKIPPED: 'skipped',       // Valid setup but consciously skipped
  MISSED: 'missed',         // Setup was good but missed opportunity
} as const

export type WatchlistStatus = typeof WATCHLIST_STATUS[keyof typeof WATCHLIST_STATUS]

/**
 * Daily Plan Status
 *
 * Lifecycle states for daily plans
 */
export const DAILY_PLAN_STATUS = {
  DRAFT: 'draft',           // Plan being created/edited
  ACTIVE: 'active',         // Plan ready for execution
  COMPLETED: 'completed',   // Plan finished and reviewed
} as const

export type DailyPlanStatus = typeof DAILY_PLAN_STATUS[keyof typeof DAILY_PLAN_STATUS]

/**
 * Watchlist Item Interface
 *
 * Represents a single stock entry in the daily watchlist.
 * Each item is tagged with a strategy and tracks execution status.
 */
export interface WatchlistItem {
  id: string
  symbol: string                  // Stock ticker (e.g., "BBCA", "TLKM")

  // Strategy association
  strategyId: string
  strategyName: string            // Denormalized for display without lookup

  // Planning notes
  notes: string                   // Reasoning for watchlist inclusion
  targetEntry?: number            // Optional target entry price
  targetExit?: number             // Optional target exit price

  // Execution tracking
  status: WatchlistStatus
  tradeId?: string                // Link to actual trade if executed
  outcome?: {
    actualEntry?: number
    actualExit?: number
    executedAt: Timestamp
    notes: string
  }

  // Metadata
  addedAt: Timestamp
  position: number                // For ordering
}

/**
 * Watchlist Item Create Input (without auto-generated fields)
 */
export interface WatchlistItemInput {
  symbol: string
  strategyId: string
  strategyName: string
  notes: string
  targetEntry?: number
  targetExit?: number
}

/**
 * Checklist Item Interface
 *
 * Represents a single item in the pre-market checklist.
 * Used for systematic preparation before trading.
 */
export interface ChecklistItem {
  id: string
  text: string                    // Checklist item description
  completed: boolean
  completedAt?: Timestamp
  position: number                // For ordering
  isTemplate: boolean             // true if from a template
}

/**
 * Checklist Item Create Input (without auto-generated fields)
 */
export interface ChecklistItemInput {
  text: string
  isTemplate?: boolean
}

/**
 * Review Data Interface
 *
 * Post-market review information for reflection and learning.
 */
export interface ReviewData {
  notes: string                   // Overall day reflection
  adherenceRate: number           // % of watchlist executed (0-100)
  completedAt?: Timestamp
}

/**
 * Daily Plan Document Interface
 *
 * Firestore path: users/{userId}/daily-plans/{planId}
 *
 * Represents a complete daily trading plan with watchlist, checklist, and review.
 * Plan ID is date-based (YYYY-MM-DD) for easy querying.
 */
export interface DailyPlan {
  id: string                      // Date string (YYYY-MM-DD)
  userId: string
  planDate: string                // ISO date string (YYYY-MM-DD)

  // Watchlist items for trading
  watchlist: WatchlistItem[]

  // Pre-market checklist
  checklist: ChecklistItem[]
  checklistProgress: {
    completed: number
    total: number
  }

  // Post-market review
  review: ReviewData

  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  status: DailyPlanStatus
}

/**
 * Daily Plan Create Input (without auto-generated fields)
 */
export interface DailyPlanInput {
  planDate: string
  watchlist?: WatchlistItem[]
  checklist?: ChecklistItem[]
}
