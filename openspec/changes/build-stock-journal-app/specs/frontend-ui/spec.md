# Frontend UI Specification

> **Note:** Frontend uses Firebase SDK with VueFire for Firestore integration. Authentication required for all app routes except login/register. Portfolio selector in header/navbar for switching between portfolios.

## ADDED Requirements

### Requirement: Vue 3 Application Structure

The system SHALL be built using Vue 3 with Composition API and TypeScript.

#### Scenario: Initialize Vue 3 app
- **WHEN** application starts
- **THEN** the app uses Vue 3 with Vite build tool and TypeScript support

#### Scenario: Use Composition API
- **WHEN** components are created
- **THEN** components use `<script setup>` syntax with Composition API

#### Scenario: Type safety
- **WHEN** developing components and stores
- **THEN** TypeScript provides type checking and IDE autocompletion

### Requirement: Material-Tailwind Components

The system SHALL use Material-Tailwind v3 components for consistent UI design.

#### Scenario: Use Material-Tailwind components
- **WHEN** building UI elements
- **THEN** application uses Material-Tailwind Button, Card, Input, Select, Dialog, and other components

#### Scenario: Consistent theming
- **WHEN** application renders
- **THEN** all components follow Material-Tailwind's theme configuration and color palette

#### Scenario: Responsive components
- **WHEN** viewing on different screen sizes
- **THEN** Material-Tailwind components adapt layout using built-in responsive utilities

### Requirement: Pinia State Management

The system SHALL use Pinia for application state management.

#### Scenario: Trade store
- **WHEN** managing trade data
- **THEN** application uses Pinia store with state, getters, and actions for trades

#### Scenario: Journal store
- **WHEN** managing journal entries
- **THEN** application uses dedicated Pinia store for journal data

#### Scenario: Portfolio store
- **WHEN** calculating portfolio metrics
- **THEN** application uses Pinia store with computed getters for analytics

#### Scenario: Reactive state updates
- **WHEN** store state changes
- **THEN** all components using that state automatically re-render

### Requirement: Trade Management Pages

The system SHALL provide dedicated pages for viewing and managing trades.

#### Scenario: Trades list page
- **WHEN** user navigates to `/trades`
- **THEN** application displays table of all trades with filtering and sorting

#### Scenario: Add trade form
- **WHEN** user clicks "Add Trade" button
- **THEN** application displays modal dialog with form for creating new trade

#### Scenario: Edit trade form
- **WHEN** user clicks edit icon on a trade
- **THEN** application displays modal with pre-filled form for editing

#### Scenario: Delete confirmation
- **WHEN** user clicks delete icon
- **THEN** application displays confirmation dialog before deletion

### Requirement: Journal Pages

The system SHALL provide pages for creating and viewing journal entries.

#### Scenario: Journal list page
- **WHEN** user navigates to `/journal`
- **THEN** application displays list of journal entries with preview and search

#### Scenario: Create journal entry
- **WHEN** user clicks "New Entry" button
- **THEN** application displays form with fields for entry reason, strategy, emotions, and lessons

#### Scenario: Edit journal entry
- **WHEN** user clicks edit on entry
- **THEN** application displays form pre-filled with existing entry data

#### Scenario: Link to trade
- **WHEN** creating or editing entry
- **THEN** user can select associated trade from dropdown list

### Requirement: Dashboard Page

The system SHALL provide dashboard page with overview of portfolio and performance.

#### Scenario: Dashboard layout
- **WHEN** user navigates to `/` or `/dashboard`
- **THEN** application displays grid layout with summary cards, charts, and recent activity

#### Scenario: Summary cards
- **WHEN** viewing dashboard
- **THEN** cards display total portfolio value, P&L, win rate, and number of trades

#### Scenario: P&L chart
- **WHEN** viewing dashboard
- **THEN** line chart displays cumulative P&L over time with period selector

#### Scenario: Recent trades widget
- **WHEN** viewing dashboard
- **THEN** widget shows last 5 trades with quick stats

### Requirement: Responsive Navigation

The system SHALL provide responsive navigation that works on all screen sizes.

#### Scenario: Desktop navigation
- **WHEN** viewing on desktop
- **THEN** application displays sidebar navigation with menu items for Dashboard, Trades, Journal, and Analytics

#### Scenario: Mobile navigation
- **WHEN** viewing on mobile
- **THEN** application displays hamburger menu that toggles sidebar visibility

#### Scenario: Active route highlighting
- **WHEN** user is on a page
- **THEN** corresponding navigation item is highlighted

### Requirement: Form Validation

The system SHALL validate form inputs client-side before submission.

#### Scenario: Required field validation
- **WHEN** user submits form with empty required fields
- **THEN** application displays error messages below each invalid field

#### Scenario: Type validation
- **WHEN** user enters non-numeric value in price field
- **THEN** application displays validation error

#### Scenario: Business rule validation
- **WHEN** user enters negative quantity or zero price
- **THEN** application displays error message and prevents submission

#### Scenario: Clear validation on correction
- **WHEN** user corrects invalid field
- **THEN** error message disappears immediately

### Requirement: Loading States

The system SHALL display loading indicators during asynchronous operations.

#### Scenario: Loading data
- **WHEN** fetching data from API
- **THEN** application displays loading spinner or skeleton screens

#### Scenario: Submitting form
- **WHEN** user submits form and API request is pending
- **THEN** submit button shows loading state and is disabled

#### Scenario: Error state
- **WHEN** API request fails
- **THEN** application displays error message with retry option

### Requirement: Data Visualization

The system SHALL use chart library for visualizing portfolio data.

#### Scenario: Render line chart
- **WHEN** displaying P&L over time
- **THEN** application uses chart library (Chart.js or ApexCharts) to render interactive line chart

#### Scenario: Render pie chart
- **WHEN** displaying win/loss distribution
- **THEN** application renders pie chart with percentages

#### Scenario: Interactive charts
- **WHEN** user hovers over chart elements
- **THEN** tooltip displays detailed information

#### Scenario: Responsive charts
- **WHEN** viewing on different screen sizes
- **THEN** charts resize and adapt to container width

### Requirement: API Integration

The system SHALL integrate with backend API using composable functions.

#### Scenario: API composable
- **WHEN** components need to fetch data
- **THEN** they use composable functions (e.g., `useTradeApi`, `useJournalApi`) for API calls

#### Scenario: Error handling
- **WHEN** API request fails
- **THEN** composable returns error state and components display user-friendly message

#### Scenario: Request cancellation
- **WHEN** component unmounts during pending request
- **THEN** API request is cancelled to prevent memory leaks
