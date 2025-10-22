# Trade Management Specification

> **Note:** All trade operations are scoped within a portfolio context. Trades are stored in Firestore at `users/{userId}/portfolios/{portfolioId}/trades/{tradeId}`.

## ADDED Requirements

### Requirement: Record Stock Transactions

The system SHALL allow users to record stock buy and sell transactions with complete details including stock symbol, quantity, price, date, and transaction type.

#### Scenario: Record buy transaction
- **WHEN** user creates a new buy transaction with symbol "BBCA", quantity 100, price 8500, and date "2025-10-23"
- **THEN** the system saves the transaction and displays it in the transaction list

#### Scenario: Record sell transaction
- **WHEN** user creates a new sell transaction for an existing position
- **THEN** the system saves the transaction and updates the position accordingly

#### Scenario: Invalid transaction data
- **WHEN** user submits a transaction with missing required fields (symbol, quantity, or price)
- **THEN** the system displays validation errors and prevents submission

### Requirement: View Transaction History

The system SHALL display all stock transactions in chronological order with filtering and sorting capabilities.

#### Scenario: View all transactions
- **WHEN** user opens the transaction history page
- **THEN** the system displays all transactions sorted by date (newest first)

#### Scenario: Filter by stock symbol
- **WHEN** user filters transactions by symbol "BBCA"
- **THEN** the system displays only transactions for BBCA

#### Scenario: Filter by transaction type
- **WHEN** user filters by transaction type "BUY"
- **THEN** the system displays only buy transactions

### Requirement: Edit Transaction

The system SHALL allow users to edit existing transactions to correct errors or update information.

#### Scenario: Update transaction details
- **WHEN** user edits a transaction's quantity from 100 to 150
- **THEN** the system updates the transaction and recalculates related metrics

#### Scenario: Prevent editing with invalid data
- **WHEN** user tries to update a transaction with invalid price (negative or zero)
- **THEN** the system displays validation error and prevents the update

### Requirement: Delete Transaction

The system SHALL allow users to delete transactions with confirmation to prevent accidental deletion.

#### Scenario: Delete transaction successfully
- **WHEN** user confirms deletion of a transaction
- **THEN** the system removes the transaction and updates related calculations

#### Scenario: Cancel deletion
- **WHEN** user cancels the deletion confirmation
- **THEN** the system keeps the transaction unchanged

### Requirement: Calculate Position

The system SHALL automatically calculate current positions by aggregating buy and sell transactions for each stock symbol.

#### Scenario: Calculate position from multiple transactions
- **WHEN** user has 3 buy transactions (100, 50, 200 shares) and 1 sell transaction (150 shares) for BBCA
- **THEN** the system calculates current position as 200 shares (350 bought - 150 sold)

#### Scenario: Calculate average buy price
- **WHEN** user has multiple buy transactions with different prices
- **THEN** the system calculates weighted average buy price based on quantity

#### Scenario: Position fully closed
- **WHEN** total sell quantity equals total buy quantity for a stock
- **THEN** the system marks the position as closed with final P&L
