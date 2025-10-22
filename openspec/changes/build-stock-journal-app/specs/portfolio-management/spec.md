# Portfolio Management Specification

## ADDED Requirements

### Requirement: Create Portfolio

The system SHALL allow users to create new portfolios with name, description, initial capital, base currency, and market type.

#### Scenario: Create portfolio with all fields
- **WHEN** user creates portfolio with name "IDX Long-term", description "Buy and hold Indonesian stocks", initialCapital 100000000, baseCurrency "IDR", marketType "IDX"
- **THEN** Firestore creates document at `users/{userId}/portfolios/{portfolioId}` with all fields and auto-generated ID

#### Scenario: Create portfolio with required fields only
- **WHEN** user creates portfolio with only name and initialCapital
- **THEN** Firestore creates portfolio with default baseCurrency "IDR" and empty description

#### Scenario: Invalid portfolio creation
- **WHEN** user submits portfolio without required fields (name or initialCapital)
- **THEN** system displays validation error and prevents creation

#### Scenario: Negative initial capital
- **WHEN** user enters negative or zero initial capital
- **THEN** system displays validation error

### Requirement: List User Portfolios

The system SHALL display all portfolios owned by the authenticated user.

#### Scenario: View all portfolios
- **WHEN** authenticated user opens portfolios page
- **THEN** system displays list of all user's portfolios sorted by creation date (newest first)

#### Scenario: Empty portfolio list
- **WHEN** user has no portfolios
- **THEN** system displays empty state with "Create your first portfolio" message

#### Scenario: Real-time portfolio updates
- **WHEN** portfolio is added/updated from another device
- **THEN** portfolio list updates automatically without refresh

### Requirement: View Portfolio Details

The system SHALL display complete portfolio information including calculated statistics.

#### Scenario: View portfolio overview
- **WHEN** user clicks on a portfolio
- **THEN** system displays name, description, initial capital, base currency, market type, and creation date

#### Scenario: View portfolio performance stats
- **WHEN** user views portfolio details
- **THEN** system displays total portfolio value, realized P&L, unrealized P&L, total return percentage, and number of trades

#### Scenario: View portfolio positions
- **WHEN** user views portfolio details
- **THEN** system displays current open positions with symbols, quantities, average buy price, current value, and unrealized P&L

### Requirement: Edit Portfolio

The system SHALL allow users to update portfolio information.

#### Scenario: Update portfolio name and description
- **WHEN** user edits portfolio name from "Portfolio A" to "IDX Growth"
- **THEN** Firestore updates the portfolio document and UI reflects changes immediately

#### Scenario: Cannot change base currency after trades exist
- **WHEN** user tries to change base currency and portfolio has existing trades
- **THEN** system displays warning and prevents currency change

#### Scenario: Update initial capital
- **WHEN** user updates initial capital
- **THEN** system recalculates total return percentage based on new initial capital

### Requirement: Delete Portfolio

The system SHALL allow users to delete portfolios with confirmation.

#### Scenario: Delete empty portfolio
- **WHEN** user confirms deletion of portfolio with no trades
- **THEN** Firestore deletes portfolio document and all subcollections (trades, journals)

#### Scenario: Delete portfolio with data
- **WHEN** user attempts to delete portfolio with trades
- **THEN** system displays warning about data loss and requires confirmation

#### Scenario: Cancel deletion
- **WHEN** user cancels deletion confirmation
- **THEN** portfolio remains unchanged

#### Scenario: Cascading delete
- **WHEN** portfolio is deleted
- **THEN** all trades and journal entries in that portfolio are also deleted

### Requirement: Portfolio Selector

The system SHALL provide portfolio selector UI for switching between portfolios.

#### Scenario: Portfolio selector in header
- **WHEN** user is on dashboard or trades page
- **THEN** header displays dropdown showing current active portfolio name

#### Scenario: Switch active portfolio
- **WHEN** user selects different portfolio from dropdown
- **THEN** system updates active portfolio context and refreshes dashboard/trades data for selected portfolio

#### Scenario: Persist selected portfolio
- **WHEN** user selects a portfolio and refreshes browser
- **THEN** system remembers the selected portfolio (via localStorage or query param)

#### Scenario: No portfolio selected on first login
- **WHEN** user logs in for the first time with no portfolios
- **THEN** system shows welcome screen prompting to create first portfolio

### Requirement: Set Active Portfolio

The system SHALL maintain active portfolio state across the application.

#### Scenario: Active portfolio state
- **WHEN** user selects a portfolio
- **THEN** Pinia store sets active portfolio ID and all data queries scope to that portfolio

#### Scenario: Route to portfolio context
- **WHEN** user navigates to trades or journal page
- **THEN** URL includes portfolio ID (e.g., `/portfolio/{id}/trades`) or state persists active portfolio

#### Scenario: Invalid portfolio access
- **WHEN** user tries to access portfolio they don't own
- **THEN** system returns 404 or redirects to portfolios list

### Requirement: Portfolio Statistics Calculation

The system SHALL calculate and display portfolio performance statistics.

#### Scenario: Calculate total portfolio value
- **WHEN** user views portfolio with open positions and cash balance
- **THEN** system calculates total value = (current price × open quantity for all symbols) + remaining cash

#### Scenario: Calculate realized P&L
- **WHEN** portfolio has closed positions
- **THEN** system sums all realized gains/losses from FIFO-matched trades

#### Scenario: Calculate unrealized P&L
- **WHEN** portfolio has open positions
- **THEN** system calculates unrealized P&L = (current price - average buy price) × open quantity for each symbol

#### Scenario: Calculate total return
- **WHEN** viewing portfolio performance
- **THEN** system calculates total return % = ((current portfolio value - initial capital) / initial capital) × 100

#### Scenario: Win rate calculation
- **WHEN** portfolio has closed positions
- **THEN** system calculates win rate = (number of profitable trades / total closed trades) × 100

### Requirement: Default Portfolio

The system SHALL allow users to set a default portfolio for quick access.

#### Scenario: Set default portfolio
- **WHEN** user marks a portfolio as default
- **THEN** system stores default portfolio ID in user preferences

#### Scenario: Auto-select default portfolio
- **WHEN** user logs in
- **THEN** system automatically selects the default portfolio (if set)

#### Scenario: Dashboard without default
- **WHEN** user has multiple portfolios but no default set
- **THEN** system prompts user to select a portfolio or shows combined view
