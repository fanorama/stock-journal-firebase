# Portfolio Analytics Specification

> **Note:** All analytics calculations are per-portfolio. Metrics are calculated client-side using Pinia getters from portfolio's trades data.

## ADDED Requirements

### Requirement: Calculate Trade Profit and Loss

The system SHALL automatically calculate profit and loss for each closed trade based on buy and sell transactions.

#### Scenario: Calculate P&L for closed position
- **WHEN** user has buy transaction at 8500 (100 shares) and sell transaction at 9000 (100 shares)
- **THEN** the system calculates P&L as +50,000 IDR (profit of 500 per share × 100 shares)

#### Scenario: Calculate P&L with multiple buys and sells
- **WHEN** user has multiple buy transactions with different prices and sells in batches
- **THEN** the system uses FIFO (First In First Out) method to calculate realized P&L

#### Scenario: Calculate percentage gain
- **WHEN** user closes a position with profit
- **THEN** the system calculates percentage gain based on average buy price

### Requirement: Calculate Unrealized P&L

The system SHALL calculate unrealized profit and loss for open positions based on current price input.

#### Scenario: Calculate unrealized P&L for open position
- **WHEN** user has an open position with average buy price 8500 and inputs current price 9000
- **THEN** the system calculates unrealized P&L as +500 per share

#### Scenario: Update unrealized P&L with new price
- **WHEN** user updates the current price for a stock
- **THEN** the system recalculates unrealized P&L for all open positions of that stock

### Requirement: Calculate Portfolio Total Value

The system SHALL calculate total portfolio value including cash balance and value of all open positions.

#### Scenario: Calculate total portfolio value
- **WHEN** user has cash balance 10,000,000 and open positions worth 5,000,000
- **THEN** the system displays total portfolio value as 15,000,000 IDR

#### Scenario: Update portfolio value on price change
- **WHEN** user updates current price for any stock with open position
- **THEN** the system recalculates and updates total portfolio value

### Requirement: Calculate Performance Metrics

The system SHALL calculate trading performance metrics including win rate, average gain/loss, and total return.

#### Scenario: Calculate win rate
- **WHEN** user has 7 profitable trades and 3 losing trades out of 10 closed trades
- **THEN** the system displays win rate as 70%

#### Scenario: Calculate average gain and loss
- **WHEN** user has completed multiple trades
- **THEN** the system calculates average gain from winning trades and average loss from losing trades separately

#### Scenario: Calculate total return
- **WHEN** user has initial capital 100,000,000 and current portfolio value 115,000,000
- **THEN** the system calculates total return as +15% (15,000,000 profit)

#### Scenario: Calculate profit factor
- **WHEN** user has total gross profit 20,000,000 and total gross loss 8,000,000
- **THEN** the system calculates profit factor as 2.5 (20M / 8M)

### Requirement: Track Period Performance

The system SHALL allow users to view performance metrics for specific time periods (daily, weekly, monthly, yearly).

#### Scenario: View monthly performance
- **WHEN** user selects monthly view for October 2025
- **THEN** the system displays all trades and performance metrics for that month only

#### Scenario: Compare period performance
- **WHEN** user views year-to-date performance
- **THEN** the system calculates cumulative P&L and metrics from start of year to current date
