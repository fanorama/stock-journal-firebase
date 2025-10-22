# Firebase Integration Specification

## ADDED Requirements

### Requirement: Firebase Project Setup

The system SHALL initialize Firebase project with Firestore, Authentication, and Hosting services.

#### Scenario: Initialize Firebase project
- **WHEN** developer sets up the project for the first time
- **THEN** Firebase project is created with Firestore database, Authentication, and Hosting enabled

#### Scenario: Configure Firebase SDK
- **WHEN** application starts
- **THEN** Firebase SDK is initialized with project configuration (apiKey, authDomain, projectId, etc.)

#### Scenario: Enable required Firebase services
- **WHEN** Firebase project is configured
- **THEN** Firestore (Native mode), Authentication (Email/Password and Google), and Hosting are enabled

### Requirement: Firestore Database Schema

The system SHALL implement Firestore collections and subcollections following the portfolio hierarchy structure.

#### Scenario: Users collection structure
- **WHEN** user registers
- **THEN** Firestore creates document at `users/{userId}` with displayName, email, photoURL, createdAt

#### Scenario: Portfolios subcollection structure
- **WHEN** user creates a portfolio
- **THEN** Firestore creates document at `users/{userId}/portfolios/{portfolioId}` with name, description, initialCapital, baseCurrency, marketType, createdAt

#### Scenario: Trades subcollection structure
- **WHEN** user creates a trade in portfolio
- **THEN** Firestore creates document at `users/{userId}/portfolios/{portfolioId}/trades/{tradeId}` with all trade fields

#### Scenario: Journals subcollection structure
- **WHEN** user creates journal entry
- **THEN** Firestore creates document at `users/{userId}/portfolios/{portfolioId}/journals/{journalId}` with all journal fields

### Requirement: Firestore Security Rules

The system SHALL enforce security rules to protect user data and prevent unauthorized access.

#### Scenario: User can only access own data
- **WHEN** authenticated user attempts to read/write data
- **THEN** Firestore allows access only if `request.auth.uid == userId`

#### Scenario: Unauthenticated access denied
- **WHEN** unauthenticated user attempts to access any data
- **THEN** Firestore denies the request with permission error

#### Scenario: Cross-user access denied
- **WHEN** user A attempts to access user B's data
- **THEN** Firestore denies the request with permission error

#### Scenario: Portfolio ownership validation
- **WHEN** user attempts to create/modify portfolio
- **THEN** Firestore validates user owns the parent user document

#### Scenario: Required fields validation
- **WHEN** client writes portfolio document
- **THEN** Firestore security rules validate required fields (name, initialCapital, baseCurrency) are present

### Requirement: Firebase Authentication

The system SHALL provide user authentication with email/password and Google OAuth.

#### Scenario: Register with email and password
- **WHEN** user submits registration form with email and password
- **THEN** Firebase Auth creates new user account and sends email verification

#### Scenario: Login with email and password
- **WHEN** user submits valid credentials
- **THEN** Firebase Auth returns user token and authentication state updates

#### Scenario: Login with Google
- **WHEN** user clicks "Sign in with Google" button
- **THEN** Firebase Auth initiates Google OAuth flow and returns authenticated user

#### Scenario: Invalid credentials
- **WHEN** user submits incorrect email or password
- **THEN** Firebase Auth returns error and authentication fails

#### Scenario: Password reset
- **WHEN** user requests password reset with email
- **THEN** Firebase Auth sends password reset email with link

#### Scenario: Email verification
- **WHEN** user registers new account
- **THEN** Firebase Auth sends verification email and user cannot access app until verified

### Requirement: Authentication State Management

The system SHALL maintain authentication state across page refreshes and browser sessions.

#### Scenario: Persist authentication
- **WHEN** user logs in and closes browser
- **THEN** user remains authenticated when reopening the app

#### Scenario: Auth state observer
- **WHEN** authentication state changes (login, logout, token refresh)
- **THEN** application updates UI and stores accordingly

#### Scenario: Logout
- **WHEN** user clicks logout button
- **THEN** Firebase Auth clears session and redirects to login page

### Requirement: Firestore Real-time Listeners

The system SHALL use Firestore real-time listeners for automatic data synchronization.

#### Scenario: Portfolio listener
- **WHEN** user views portfolios list
- **THEN** Firestore listener subscribes to `users/{userId}/portfolios` and updates on any change

#### Scenario: Trades listener for portfolio
- **WHEN** user views trades in a portfolio
- **THEN** Firestore listener subscribes to `users/{userId}/portfolios/{portfolioId}/trades` and updates in real-time

#### Scenario: Automatic UI updates
- **WHEN** Firestore data changes (from any device)
- **THEN** application UI updates automatically without manual refresh

#### Scenario: Listener cleanup
- **WHEN** component unmounts or user navigates away
- **THEN** Firestore listeners are unsubscribed to prevent memory leaks

### Requirement: Firestore Offline Persistence

The system SHALL enable offline persistence for better performance and offline capability.

#### Scenario: Enable offline persistence
- **WHEN** application initializes Firestore
- **THEN** offline persistence is enabled for local caching

#### Scenario: Read from cache
- **WHEN** user loads data and offline cache exists
- **THEN** Firestore serves data from local cache first, then syncs with server

#### Scenario: Write while offline
- **WHEN** user creates/updates data while offline
- **THEN** Firestore queues operations and syncs when connection restored

#### Scenario: Conflict resolution
- **WHEN** offline writes conflict with server data
- **THEN** Firestore applies last-write-wins strategy

### Requirement: Firestore Queries and Indexes

The system SHALL implement efficient queries with proper indexing for performance.

#### Scenario: Query trades by symbol
- **WHEN** user filters trades by stock symbol within portfolio
- **THEN** Firestore query uses index on symbol field for fast retrieval

#### Scenario: Query trades by date range
- **WHEN** user filters trades by date range
- **THEN** Firestore query uses index on date field

#### Scenario: Composite index for complex queries
- **WHEN** user filters and sorts by multiple fields
- **THEN** Firestore uses composite index (Firebase console suggests required indexes)

#### Scenario: Pagination for large datasets
- **WHEN** portfolio has >100 trades
- **THEN** Firestore query uses `limit()` and `startAfter()` for pagination

### Requirement: Firestore Transactions

The system SHALL use Firestore transactions for operations requiring atomicity.

#### Scenario: Update portfolio stats atomically
- **WHEN** trade is created/updated
- **THEN** portfolio stats are updated in same transaction to maintain consistency

#### Scenario: Transaction failure rollback
- **WHEN** transaction fails due to conflict or error
- **THEN** all operations in transaction are rolled back

### Requirement: Firebase Hosting Deployment

The system SHALL deploy frontend application to Firebase Hosting.

#### Scenario: Build and deploy to hosting
- **WHEN** developer runs firebase deploy command
- **THEN** application builds and deploys to Firebase Hosting with HTTPS

#### Scenario: Custom domain support
- **WHEN** custom domain is configured
- **THEN** Firebase Hosting serves app on custom domain with auto SSL

#### Scenario: Cache headers for static assets
- **WHEN** user loads application
- **THEN** Firebase Hosting serves static assets with proper cache headers for performance

### Requirement: VueFire Integration

The system SHALL integrate VueFire library for reactive Firestore bindings in Vue components.

#### Scenario: Bind Firestore collection to Pinia store
- **WHEN** Pinia store initializes
- **THEN** VueFire `useCollection` creates reactive binding to Firestore collection

#### Scenario: Automatic reactivity
- **WHEN** Firestore data changes
- **THEN** Vue components re-render automatically with updated data

#### Scenario: Bind Firestore document
- **WHEN** component needs single document
- **THEN** VueFire `useDocument` creates reactive binding to Firestore document

### Requirement: Firebase Configuration Management

The system SHALL manage Firebase configuration securely across environments.

#### Scenario: Development environment config
- **WHEN** running in development
- **THEN** application uses development Firebase project configuration

#### Scenario: Production environment config
- **WHEN** deployed to production
- **THEN** application uses production Firebase project configuration

#### Scenario: Environment variables
- **WHEN** application builds
- **THEN** Firebase config is loaded from environment variables (not hardcoded)

#### Scenario: Secure API keys
- **WHEN** Firebase config contains API keys
- **THEN** API keys are restricted by HTTP referer and API key restrictions in Firebase console
