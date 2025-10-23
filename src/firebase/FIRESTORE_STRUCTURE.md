# Firestore Database Structure

This document describes the Firestore database schema for the Stock Journal App.

## Overview

The database uses a **hierarchical collection structure** with user data organized as subcollections under each user document. This design ensures:

- **Data locality**: Related data is stored together for efficient queries
- **Security**: Easy to implement user-scoped security rules
- **Scalability**: Natural partitioning by user ID
- **Real-time sync**: Efficient real-time listeners at portfolio level

## Collection Hierarchy

```
users/{userId}
├── displayName: string
├── email: string
├── photoURL: string (optional)
├── createdAt: Timestamp
│
└── portfolios (subcollection)
    └── {portfolioId}
        ├── name: string
        ├── description: string (optional)
        ├── initialCapital: number
        ├── baseCurrency: string
        ├── marketType: string
        ├── createdAt: Timestamp
        ├── updatedAt: Timestamp
        │
        ├── trades (subcollection)
        │   └── {tradeId}
        │       ├── portfolioId: string
        │       ├── symbol: string
        │       ├── type: 'BUY' | 'SELL'
        │       ├── quantity: number
        │       ├── price: number
        │       ├── date: Timestamp
        │       ├── fees: number (optional)
        │       ├── notes: string (optional)
        │       ├── createdAt: Timestamp
        │       └── updatedAt: Timestamp
        │
        └── journals (subcollection)
            └── {journalId}
                ├── portfolioId: string
                ├── tradeId: string (optional)
                ├── entryReason: string (optional)
                ├── exitStrategy: string (optional)
                ├── emotions: string (optional)
                ├── lessonsLearned: string (optional)
                ├── createdAt: Timestamp
                └── updatedAt: Timestamp
```

## Data Models

### User Document

**Path**: `users/{userId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| displayName | string | No | User's display name from Firebase Auth |
| email | string | Yes | User's email address |
| photoURL | string | No | User's profile photo URL |
| createdAt | Timestamp | Yes | Account creation timestamp |

**Note**: User documents are automatically created when users register through Firebase Authentication.

### Portfolio Document

**Path**: `users/{userId}/portfolios/{portfolioId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Portfolio name (e.g., "Long-term Stocks", "Day Trading") |
| description | string | No | Optional description |
| initialCapital | number | Yes | Starting capital amount |
| baseCurrency | string | Yes | Currency code (IDR, USD, EUR, etc.) |
| marketType | string | Yes | Market type (IDX, US_STOCKS, CRYPTO, FOREX) |
| createdAt | Timestamp | Yes | Portfolio creation timestamp |
| updatedAt | Timestamp | Yes | Last update timestamp |

**Constraints**:
- `name`: 1-100 characters
- `initialCapital`: Must be positive number
- `baseCurrency`: One of supported currencies (see CURRENCIES constant)
- `marketType`: One of supported markets (see MARKET_TYPES constant)

### Trade Document

**Path**: `users/{userId}/portfolios/{portfolioId}/trades/{tradeId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| portfolioId | string | Yes | Reference to parent portfolio |
| symbol | string | Yes | Stock/asset symbol (e.g., BBCA, TLKM) |
| type | string | Yes | Trade type: 'BUY' or 'SELL' |
| quantity | number | Yes | Number of shares/units |
| price | number | Yes | Price per share/unit |
| date | Timestamp | Yes | Trade execution date |
| fees | number | No | Transaction fees (broker commission, tax) |
| notes | string | No | Quick notes about the trade |
| createdAt | Timestamp | Yes | Record creation timestamp |
| updatedAt | Timestamp | Yes | Last update timestamp |

**Constraints**:
- `symbol`: 1-20 characters, uppercase recommended
- `type`: Must be 'BUY' or 'SELL'
- `quantity`: Must be positive number
- `price`: Must be positive number
- `fees`: Must be non-negative if provided

**Index Requirements**:
- Composite index on `(date, symbol)` for filtering and sorting
- Single field index on `symbol` for symbol-based queries

### Journal Document

**Path**: `users/{userId}/portfolios/{portfolioId}/journals/{journalId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| portfolioId | string | Yes | Reference to parent portfolio |
| tradeId | string | No | Optional reference to specific trade |
| entryReason | string | No | Why did you enter this position? |
| exitStrategy | string | No | What's your exit plan? |
| emotions | string | No | How are you feeling about this trade? |
| lessonsLearned | string | No | What did you learn? |
| createdAt | Timestamp | Yes | Entry creation timestamp |
| updatedAt | Timestamp | Yes | Last update timestamp |

**Constraints**:
- All text fields: Max 5000 characters
- At least one of the optional fields should be filled

**Index Requirements**:
- Single field index on `tradeId` for trade-linked journals
- Composite index on `(createdAt, tradeId)` for filtering

## Design Decisions

### Why Subcollections?

**Benefits**:
1. **Security Rules**: Easy to write user-scoped rules (`request.auth.uid == userId`)
2. **Data Locality**: Related data stored together for efficient queries
3. **Natural Hierarchy**: Reflects the logical relationship between entities
4. **Real-time Listeners**: Efficient subscriptions at portfolio level
5. **Offline Persistence**: Better offline behavior with Firestore SDK

**Trade-offs**:
- Cannot query across users (not needed for personal app)
- Cascading deletes require manual handling or Cloud Functions
- Slightly more complex queries for cross-portfolio analytics (future feature)

### Why Denormalize portfolioId?

We store `portfolioId` in both Trade and Journal documents even though they're already in a subcollection under the portfolio. This is for:

1. **Query Flexibility**: Can query trades/journals with portfolio filter if needed
2. **Data Consistency**: Explicit reference makes relationships clear
3. **Future Proofing**: If we need to restructure collections, migrations are easier

### FIFO Calculation Strategy

Position and P&L calculations use **FIFO (First In, First Out)** method and are computed **client-side**:

**Why Client-side?**
- Firestore has limited aggregation capabilities
- Real-time subscriptions provide all trades data anyway
- Flexibility to change calculation logic without backend changes
- Sufficient performance for MVP (<500 trades per portfolio)

**When to Move to Server-side?**
- Portfolio has >1000 trades (performance degradation)
- Need batch processing for analytics
- Implement using Cloud Functions when needed

## Query Patterns

### Common Queries

**Get all portfolios for user:**
```typescript
const portfoliosRef = collection(db, `users/${userId}/portfolios`)
const q = query(portfoliosRef, orderBy('createdAt', 'desc'))
```

**Get trades for portfolio (with filters):**
```typescript
const tradesRef = collection(db, `users/${userId}/portfolios/${portfolioId}/trades`)
const q = query(
  tradesRef,
  where('symbol', '==', 'BBCA'),
  where('date', '>=', startDate),
  orderBy('date', 'desc')
)
```

**Get journals linked to a trade:**
```typescript
const journalsRef = collection(db, `users/${userId}/portfolios/${portfolioId}/journals`)
const q = query(journalsRef, where('tradeId', '==', tradeId))
```

### Performance Considerations

1. **Use Composite Indexes**: Firebase console will suggest required indexes
2. **Limit Query Results**: Use `limit()` for large datasets and implement pagination
3. **Cache Expensive Calculations**: Use Vue `computed()` for reactive calculations
4. **Leverage Offline Persistence**: Enables faster loads and offline work

## Security Rules

The security rules ensure that users can only access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Portfolios
      match /portfolios/{portfolioId} {
        allow read, write: if request.auth.uid == userId;

        // Trades in portfolio
        match /trades/{tradeId} {
          allow read, write: if request.auth.uid == userId;
        }

        // Journals in portfolio
        match /journals/{journalId} {
          allow read, write: if request.auth.uid == userId;
        }
      }
    }
  }
}
```

## Data Validation Rules (Future)

For production, add validation rules:

```javascript
// Example: Validate portfolio creation
match /portfolios/{portfolioId} {
  allow create: if request.auth.uid == userId
    && request.resource.data.name is string
    && request.resource.data.name.size() > 0
    && request.resource.data.initialCapital is number
    && request.resource.data.initialCapital > 0;
}
```

## Migration Strategy

### Phase 1: MVP (Current)
- Basic collections structure
- Client-side calculations
- Manual cascading deletes

### Phase 2: Production Hardening
- Add comprehensive validation rules
- Implement Cloud Functions for cascading deletes
- Add data versioning for audit trail

### Phase 3: Advanced Features
- Aggregate collections for analytics
- Cloud Functions for heavy calculations
- Data export/import utilities

## Backup Strategy

**Automated Backups** (Firebase Console):
1. Enable automatic backups in Firebase Console
2. Schedule: Daily at 2 AM UTC
3. Retention: 30 days

**Manual Export**:
```bash
firebase firestore:export gs://[BUCKET_NAME]/[EXPORT_FOLDER]
```

## Monitoring

**Key Metrics to Monitor**:
1. Document reads/writes per day (Firebase Console)
2. Query performance and errors
3. Storage size
4. Real-time listener connections

**Alert Thresholds**:
- Daily reads > 40K (approaching free tier limit)
- Daily writes > 15K (approaching free tier limit)
- Query duration > 500ms (performance issue)

## References

- [Firestore Data Model Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [VueFire Documentation](https://vuefire.vuejs.org/)
