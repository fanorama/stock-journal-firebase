# Dashboard Visualization Specification

> **Note:** Dashboard displays data for the currently active/selected portfolio. Portfolio selector in header allows switching between portfolios.

## ADDED Requirements

### Requirement: Display Portfolio Summary

The system SHALL display a dashboard with key portfolio metrics including total value, total P&L, win rate, and number of trades.

#### Scenario: View portfolio summary cards
- **WHEN** user opens the dashboard
- **THEN** the system displays cards showing total portfolio value, realized P&L, unrealized P&L, and total return percentage

#### Scenario: View trading statistics
- **WHEN** user views the dashboard
- **THEN** the system displays total trades count, win rate, profit factor, and average gain/loss

#### Scenario: Real-time metric updates
- **WHEN** user adds a new trade or updates current price
- **THEN** the system immediately updates all dashboard metrics

### Requirement: Visualize P&L Over Time

The system SHALL display a chart showing profit and loss progression over time.

#### Scenario: View P&L line chart
- **WHEN** user views the dashboard
- **THEN** the system displays a line chart of cumulative P&L over time

#### Scenario: Filter chart by period
- **WHEN** user selects time period filter (7 days, 30 days, 90 days, 1 year, all time)
- **THEN** the system updates the chart to show data for selected period only

#### Scenario: Hover for details
- **WHEN** user hovers over a point on the P&L chart
- **THEN** the system displays tooltip with date and exact P&L value at that point

### Requirement: Visualize Trade Distribution

The system SHALL display charts showing distribution of trades by outcome, stock, and size.

#### Scenario: View win/loss pie chart
- **WHEN** user views the dashboard
- **THEN** the system displays a pie chart showing proportion of winning vs losing trades

#### Scenario: View trades by stock
- **WHEN** user views trade distribution section
- **THEN** the system displays a bar chart showing number of trades per stock symbol

#### Scenario: View trade size distribution
- **WHEN** user views analytics section
- **THEN** the system displays histogram of trade sizes (capital deployed per trade)

### Requirement: Display Recent Activity

The system SHALL show recent trades and journal entries on the dashboard.

#### Scenario: View recent trades list
- **WHEN** user opens the dashboard
- **THEN** the system displays the 5 most recent trades with symbol, date, type, and P&L

#### Scenario: View recent journal entries
- **WHEN** user views the dashboard
- **THEN** the system displays the 3 most recent journal entries with preview text

#### Scenario: Quick navigation from dashboard
- **WHEN** user clicks on a recent trade or journal entry
- **THEN** the system navigates to the detailed view of that item

### Requirement: Display Best and Worst Trades

The system SHALL highlight the best performing and worst performing trades.

#### Scenario: View top winners
- **WHEN** user views the dashboard
- **THEN** the system displays the 3 most profitable trades with symbol, P&L, and percentage gain

#### Scenario: View biggest losers
- **WHEN** user views the dashboard
- **THEN** the system displays the 3 most losing trades with symbol, P&L, and percentage loss

#### Scenario: View average holding period
- **WHEN** user views trading statistics
- **THEN** the system calculates and displays average number of days between buy and sell

### Requirement: Responsive Dashboard Layout

The system SHALL adapt dashboard layout for different screen sizes while maintaining readability.

#### Scenario: View on desktop
- **WHEN** user views dashboard on desktop (>1024px width)
- **THEN** the system displays metrics in multi-column grid with charts side-by-side

#### Scenario: View on tablet
- **WHEN** user views dashboard on tablet (768-1024px width)
- **THEN** the system adjusts layout to 2-column grid with stacked charts

#### Scenario: View on mobile
- **WHEN** user views dashboard on mobile (<768px width)
- **THEN** the system displays single-column layout with vertically stacked cards and charts
