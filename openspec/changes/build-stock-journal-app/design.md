# Stock Journal App - Design Document

## Context

This is a greenfield web application for personal stock trading journal with Firebase as the backend. The application needs to support multiple portfolios, trade tracking, journaling, portfolio analytics, and data visualization across web browsers with real-time sync.

**Stakeholders:**
- Individual traders who want to improve their trading performance through systematic journaling
- Primary user: Self (personal project)
- Target market: Indonesia Stock Exchange (IDX/BEI) traders

**Constraints:**
- Must use Firebase (Firestore + Authentication)
- Multi-device sync required
- Multiple portfolios per user
- Manual price input (no real-time market data integration initially)
- Budget: Personal project, use Firebase free tier initially

## Goals / Non-Goals

**Goals:**
- Build functional MVP with core features: multiple portfolios, trades tracking, journaling, P&L calculation, basic analytics
- Clean, maintainable codebase using modern best practices
- Responsive UI that works on desktop, tablet, and mobile
- Type-safe development with TypeScript
- Real-time data sync across devices using Firestore
- Fast development velocity using proven frameworks and libraries

**Non-Goals:**
- Real-time market data integration (manual input only in MVP)
- Advanced charting/technical analysis tools
- Automated trade import from broker APIs
- Social features or portfolio sharing
- Tax reporting features (for now)

## Decisions

### Technology Stack

**Frontend: Vue 3 + Vite + TypeScript**
- **Decision:** Use Vue 3 with Composition API and `<script setup>` syntax
- **Why:**
  - Composition API provides better TypeScript support and code organization
  - Vite offers fast development experience with HMR
  - Vue's reactive system works perfectly with Firestore real-time listeners
  - Excellent Firebase integration via VueFire library
- **Alternatives considered:**
  - React: More Firebase examples but steeper learning curve, more boilerplate
  - Svelte: Smaller bundle size but smaller ecosystem

**UI Framework: Material-Tailwind v3**
- **Decision:** Use Material-Tailwind v3 components
- **Why:**
  - Pre-built components accelerate development
  - Material Design provides professional, consistent look
  - Good TypeScript support
  - Responsive components out of the box
- **Alternatives considered:**
  - Vuetify: More mature but heavier bundle size
  - Headless UI + custom Tailwind: More flexible but slower development

**State Management: Pinia + VueFire**
- **Decision:** Use Pinia with VueFire for Firebase integration
- **Why:**
  - Official Vue state management library
  - VueFire provides reactive Firestore bindings
  - Automatic sync between Pinia stores and Firestore
  - Excellent TypeScript support
- **Alternatives considered:**
  - Direct Firebase SDK: More manual work, lose reactivity benefits
  - Vuex: Older, more verbose API

**Backend: Firebase (Firestore + Authentication + Hosting)**
- **Decision:** Use Firebase suite for entire backend
- **Why:**
  - **Firestore:** NoSQL, real-time, offline support, free tier generous
  - **Authentication:** Built-in email/Google auth, secure by default
  - **Hosting:** Fast CDN, HTTPS automatic, easy deployment
  - **No server maintenance:** Serverless, scales automatically
  - **Cost-effective:** Free tier covers MVP needs, pay-as-you-grow
- **Alternatives considered:**
  - PostgreSQL + Express: More work to setup, need server hosting, no real-time sync
  - Supabase: Good alternative but less mature ecosystem
  - AWS Amplify: More complex, steeper learning curve

**Database: Cloud Firestore**
- **Decision:** Use Firestore in native mode
- **Why:**
  - NoSQL document model fits portfolio hierarchy well
  - Real-time listeners for live updates
  - Offline persistence built-in
  - Automatic scaling
  - Strong security rules engine
- **Alternatives considered:**
  - Realtime Database: Older, less powerful querying
  - SQL options: Poor fit for real-time sync, more complex setup

**Charts: ApexCharts**
- **Decision:** Use ApexCharts for data visualization
- **Why:**
  - Modern, interactive charts with good defaults
  - Responsive and mobile-friendly
  - Vue 3 wrapper available (vue3-apexcharts)
  - Good documentation
- **Alternatives considered:**
  - Chart.js: Simpler but less features
  - D3.js: More powerful but steeper learning curve

### Architecture Patterns

**Firestore Data Model - Portfolio Hierarchy**

```
users/{userId}
├── displayName, email, photoURL, createdAt
└── portfolios/{portfolioId}
    ├── name, description, initialCapital, baseCurrency, marketType, createdAt
    ├── trades (subcollection)
    │   └── {tradeId}
    │       └── symbol, type, quantity, price, date, fees, notes, createdAt
    └── journals (subcollection)
        └── {journalId}
            └── tradeId (optional), entryReason, exitStrategy, emotions, lessonsLearned, createdAt, updatedAt
```

**Why this structure:**
- **Users as top-level collection:** Natural Firebase Auth integration
- **Portfolios as subcollection:** Scoped to user, easy security rules
- **Trades/Journals as subcollections of portfolio:** Data locality, efficient queries, clear ownership
- **Denormalization:** Store calculated fields (e.g., portfolio stats) for performance

**Security Rules Strategy:**
- Users can only read/write their own data: `request.auth.uid == userId`
- Validated writes: Enforce required fields, data types, business rules
- No public data: All data private to authenticated users

**Frontend Architecture**

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   ├── portfolio/        # Portfolio-specific components
│   ├── trade/            # Trade components
│   ├── journal/          # Journal components
│   └── dashboard/        # Dashboard widgets
├── composables/
│   ├── useFirebase.ts    # Firebase initialization
│   ├── useAuth.ts        # Authentication logic
│   ├── usePortfolio.ts   # Portfolio operations
│   ├── useTrades.ts      # Trade operations
│   └── useAnalytics.ts   # P&L calculations
├── stores/
│   ├── auth.ts           # User authentication state
│   ├── portfolios.ts     # Portfolios with Firestore binding
│   ├── trades.ts         # Trades with Firestore binding
│   └── journals.ts       # Journals with Firestore binding
├── views/
│   ├── Login.vue
│   ├── Dashboard.vue
│   ├── Portfolios.vue
│   ├── Trades.vue
│   └── Journals.vue
├── router/
│   └── index.ts          # Route guards for auth
├── firebase/
│   ├── config.ts         # Firebase configuration
│   ├── firestore.ts      # Firestore helpers
│   └── auth.ts           # Auth helpers
└── types/
    └── models.ts         # TypeScript interfaces
```

**State Management with VueFire**

```typescript
// stores/portfolios.ts
import { defineStore } from 'pinia'
import { useCollection } from 'vuefire'
import { collection } from 'firebase/firestore'

export const usePortfolioStore = defineStore('portfolios', () => {
  const { data: portfolios, pending, error } = useCollection(
    collection(db, `users/${userId}/portfolios`)
  )

  return { portfolios, pending, error }
})
```

**Benefits:**
- Automatic reactivity: Firestore updates → Pinia state → Vue components
- No manual subscription management
- TypeScript type safety throughout

### Data Model Details

**Portfolio Document:**
```typescript
interface Portfolio {
  id: string
  name: string
  description?: string
  initialCapital: number
  baseCurrency: string  // 'IDR', 'USD', etc.
  marketType: string    // 'IDX', 'US_STOCKS', 'CRYPTO', 'FOREX'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Trade Document:**
```typescript
interface Trade {
  id: string
  portfolioId: string
  symbol: string        // 'BBCA', 'BBRI', etc.
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  date: Timestamp
  fees?: number         // Transaction fees
  notes?: string        // Quick notes
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Journal Document:**
```typescript
interface Journal {
  id: string
  portfolioId: string
  tradeId?: string      // Optional reference to trade
  entryReason?: string
  exitStrategy?: string
  emotions?: string
  lessonsLearned?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Calculations

**Position Calculation (FIFO - in frontend)**
- **Decision:** Calculate positions client-side from trades
- **Why:**
  - Firestore queries limited for aggregation
  - Client has all trades via real-time subscription
  - Flexibility to change calculation method
- **Algorithm:**
  1. Subscribe to all trades for portfolio
  2. Group by symbol
  3. Sort by date (oldest first)
  4. Apply FIFO matching for P&L
  5. Calculate in Pinia store getters (reactive)

**Performance Metrics (Client-side computed)**
- Win Rate, Profit Factor, Average Gain/Loss calculated in Pinia getters
- Reactively update as trades change
- Cache expensive calculations using `computed()` with proper dependencies

**Firestore Queries Strategy:**
- Use composite indexes for efficient filtering
- Limit initial loads, paginate if needed
- Leverage Firestore offline persistence for faster loads

## Risks / Trade-offs

**Risk: Firestore cost at scale**
- **Impact:** Free tier: 50K reads/day, 20K writes/day - may exceed with multiple devices
- **Mitigation:**
  - Use Firestore offline persistence (reduces reads)
  - Implement efficient query patterns
  - Monitor usage via Firebase console
  - Optimize security rules to prevent unnecessary reads

**Risk: Client-side calculations performance**
- **Impact:** Large portfolios (1000+ trades) may slow down
- **Mitigation:**
  - Start with client-side, sufficient for MVP (< 500 trades)
  - If needed, add Cloud Functions for aggregation
  - Implement pagination and lazy loading

**Risk: NoSQL data modeling complexity**
- **Impact:** Denormalization requires careful planning, potential data inconsistency
- **Mitigation:**
  - Keep model simple initially
  - Use Firestore transactions for critical updates
  - Document data model clearly

**Trade-off: Real-time sync vs cost**
- **Chosen:** Real-time sync enabled
- **Trade-off:** More reads but better UX
- **Justification:** Personal app, unlikely to hit limits; can disable real-time if needed

**Trade-off: Multi-currency now vs later**
- **Chosen:** Support multi-currency structure from start
- **Trade-off:** More complexity upfront vs easier migration
- **Justification:** Database schema change harder later, UI can stay simple (IDR focus)

## Migration Plan

**Phase 1: MVP (Current Proposal)**
1. Set up Firebase project (Firestore + Auth + Hosting)
2. Implement authentication flow (email + Google)
3. Build portfolio management UI
4. Implement trade tracking with FIFO P&L
5. Build journal entry system
6. Create dashboard with basic analytics
7. Deploy to Firebase Hosting

**Phase 2: Enhancements (Future)**
- Real-time price API integration (Alpha Vantage, Yahoo Finance)
- Advanced analytics (Sharpe ratio, max drawdown, win streaks)
- Export features (CSV, PDF reports)
- Dark mode support
- Notifications (email/push for reminders)

**Phase 3: Scale (Future)**
- Cloud Functions for backend aggregation (if client-side too slow)
- Mobile apps (Flutter or React Native)
- Automated trade import from broker CSV
- Advanced charting with technical indicators

**Rollback Strategy:**
- Firebase Console for manual data management
- Firestore export/import for backups
- Git version control for code
- Document manual rollback procedures

## Open Questions

1. **Firestore indexes:** Which composite indexes needed?
   - **Answer during implementation:** Add indexes as queries demand
   - **Firebase console will suggest required indexes**

2. **Offline behavior:** How to handle offline edits conflicts?
   - **Default:** Firestore's automatic conflict resolution (last write wins)
   - **Future:** Implement custom conflict resolution if needed

3. **Portfolio limits:** Max portfolios per user?
   - **Proposed:** No hard limit initially
   - **Can add limit in security rules if needed (e.g., 10 portfolios max)**

4. **Currency exchange rates:** How to handle multi-currency portfolio valuation?
   - **MVP:** Each portfolio in its own currency, no cross-portfolio aggregation
   - **Future:** Fetch exchange rates API and convert to base currency

5. **Data export format:** CSV, JSON, or PDF?
   - **Future decision:** Start with CSV (simplest)
   - **Can add PDF reports later**

## Security Considerations

**Firestore Security Rules:**
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

**Authentication Security:**
- Email verification required
- Password reset flow
- Google OAuth for easier login
- Session management via Firebase Auth

## Technical Debt Accepted for MVP

1. **No Cloud Functions:** Pure client-side, add server-side logic later if needed
2. **Basic error logging:** Console errors only, add Sentry/LogRocket later
3. **No rate limiting:** Firebase handles, but no app-level throttling
4. **Simple validation:** Basic client-side only, comprehensive rules later
5. **No data versioning:** No audit trail of changes (can add later)

## Success Metrics

**MVP Success Criteria:**
- [ ] User can register and login (email + Google)
- [ ] User can create and switch between multiple portfolios
- [ ] User can create, edit, delete trades per portfolio
- [ ] User can create, edit, delete journal entries
- [ ] Portfolio P&L calculations are accurate (FIFO)
- [ ] Dashboard displays real-time analytics
- [ ] Works on desktop and mobile browsers
- [ ] Data syncs across devices in real-time
- [ ] Firestore security rules prevent unauthorized access

**Performance Targets:**
- Dashboard loads in <2 seconds (initial load)
- Real-time updates appear in <500ms
- Firestore queries <200ms (with persistence)
- Frontend bundle size <600KB (gzipped)
- Lighthouse score >90 (Performance, Accessibility)

**Firebase Usage Targets (Free Tier):**
- Document reads: <40K/day (stay under 50K limit)
- Document writes: <15K/day (stay under 20K limit)
- Storage: <500MB (well under 1GB limit)
