# Firestore Security Rules Documentation

## Overview

File ini mendokumentasikan Firestore Security Rules yang telah diimplementasikan untuk Stock Journal App. Security rules ini melindungi data user dan memastikan hanya user yang terautentikasi dapat mengakses data mereka sendiri.

## Struktur Hierarki Data

```
users/{userId}
├── displayName, email, photoURL, createdAt
└── portfolios/{portfolioId}
    ├── name, description, initialCapital, baseCurrency, marketType, createdAt, updatedAt
    ├── trades (subcollection)
    │   └── {tradeId}
    │       └── portfolioId, symbol, type, quantity, price, date, fees, notes, createdAt, updatedAt
    └── journals (subcollection)
        └── {journalId}
            └── portfolioId, tradeId, entryReason, exitStrategy, emotions, lessonsLearned, createdAt, updatedAt
```

## Prinsip Keamanan

### 1. Authentication Required
- Semua operasi read/write memerlukan user yang terautentikasi
- Unauthenticated users tidak dapat mengakses data apapun

### 2. User Isolation
- User hanya dapat mengakses data mereka sendiri
- Diimplementasikan dengan validasi: `request.auth.uid == userId`
- Tidak ada akses cross-user

### 3. Data Validation
- Semua field required divalidasi saat create/update
- Type checking untuk memastikan data sesuai dengan schema
- Size limits untuk string fields
- Value ranges untuk numeric fields

## Security Rules Details

### Users Collection (`/users/{userId}`)

**Access Control:**
- **Read**: User hanya bisa read document mereka sendiri
- **Create**: User bisa create document saat registration dengan validasi email dan createdAt
- **Update**: User bisa update profile mereka sendiri
- **Delete**: Disabled (users tidak boleh delete account sendiri, harus archived)

**Validations:**
- `email` field harus ada dan bertipe string
- `createdAt` harus valid timestamp

### Portfolios Subcollection (`/users/{userId}/portfolios/{portfolioId}`)

**Access Control:**
- **Read**: User hanya bisa read portfolios mereka sendiri
- **Create**: User bisa create portfolio dengan validasi lengkap
- **Update**: User bisa update portfolio dengan validasi
- **Delete**: User bisa delete portfolio (cascade delete di application layer)

**Validations (Create):**
- `name`: Required, string, length 1-100 characters
- `initialCapital`: Required, number, >= 0
- `baseCurrency`: Required, must be one of: 'IDR', 'USD', 'EUR', 'SGD', 'JPY'
- `marketType`: Required, must be one of: 'IDX', 'US_STOCKS', 'CRYPTO', 'FOREX'
- `createdAt`: Required, valid timestamp
- `updatedAt`: Required, valid timestamp

**Validations (Update):**
- Same as create, except `createdAt` tidak divalidasi (tidak boleh berubah)
- `updatedAt` harus selalu di-update

### Trades Subcollection (`/users/{userId}/portfolios/{portfolioId}/trades/{tradeId}`)

**Access Control:**
- **Read**: User hanya bisa read trades di portfolio mereka
- **Create**: User bisa create trade dengan validasi lengkap
- **Update**: User bisa update trade dengan validasi
- **Delete**: User bisa delete trade

**Validations (Create & Update):**
- `portfolioId`: Required, string
- `symbol`: Required, string, length 1-10 characters (stock ticker)
- `type`: Required, must be 'BUY' or 'SELL'
- `quantity`: Required, number, > 0
- `price`: Required, number, > 0
- `date`: Required, valid timestamp
- `createdAt`: Required, valid timestamp (create only)
- `updatedAt`: Required, valid timestamp
- `fees`: Optional, number, >= 0 if present
- `notes`: Optional, string, max 1000 characters if present

### Journals Subcollection (`/users/{userId}/portfolios/{portfolioId}/journals/{journalId}`)

**Access Control:**
- **Read**: User hanya bisa read journals di portfolio mereka
- **Create**: User bisa create journal dengan validasi
- **Update**: User bisa update journal dengan validasi
- **Delete**: User bisa delete journal

**Validations (Create & Update):**
- `portfolioId`: Required, string
- `createdAt`: Required, valid timestamp (create only)
- `updatedAt`: Required, valid timestamp
- `tradeId`: Optional, string if present
- `entryReason`: Optional, string, max 5000 characters if present
- `exitStrategy`: Optional, string, max 5000 characters if present
- `emotions`: Optional, string, max 5000 characters if present
- `lessonsLearned`: Optional, string, max 5000 characters if present

## Helper Functions

### `isAuthenticated()`
Mengecek apakah user sudah login.
```javascript
function isAuthenticated() {
  return request.auth != null;
}
```

### `isOwner(userId)`
Mengecek apakah authenticated user adalah owner dari resource.
```javascript
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}
```

### `isValidTimestamp(timestamp)`
Memvalidasi timestamp field.
```javascript
function isValidTimestamp(timestamp) {
  return timestamp is timestamp || timestamp == request.time;
}
```

### `hasRequiredField(field)`
Mengecek apakah field required ada.
```javascript
function hasRequiredField(field) {
  return request.resource.data[field] != null;
}
```

## Security Requirements Coverage

✅ **Task 6.1**: Security rules for users collection
- User isolation dengan `isOwner(userId)`
- Validasi email dan createdAt
- Disable delete untuk data integrity

✅ **Task 6.2**: Security rules for portfolios subcollection
- User ownership validation
- Required fields validation (name, initialCapital, baseCurrency, marketType)
- Currency dan marketType enum validation
- Timestamp validation

✅ **Task 6.3**: Security rules for trades subcollection
- User ownership via portfolio hierarchy
- Complete field validation (symbol, type, quantity, price, date)
- Trade type enum validation ('BUY' | 'SELL')
- Optional fields validation (fees, notes)
- Numeric constraints (quantity > 0, price > 0, fees >= 0)

✅ **Task 6.4**: Security rules for journals subcollection
- User ownership via portfolio hierarchy
- Optional fields dengan max length validation
- Text fields max 5000 characters
- Optional tradeId reference validation

## Testing Security Rules

### Manual Testing Steps

1. **Test unauthenticated access** (should fail):
```javascript
// All operations should fail without authentication
db.collection('users').get() // Should fail
```

2. **Test cross-user access** (should fail):
```javascript
// User A trying to access User B's data
db.collection('users/userB/portfolios').get() // Should fail
```

3. **Test valid create operations** (should succeed):
```javascript
// Creating portfolio with all required fields
db.collection('users/myUserId/portfolios').add({
  name: 'My Portfolio',
  initialCapital: 10000000,
  baseCurrency: 'IDR',
  marketType: 'IDX',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
})
```

4. **Test invalid field validation** (should fail):
```javascript
// Missing required field
db.collection('users/myUserId/portfolios').add({
  name: 'Test',
  // Missing initialCapital - should fail
})

// Invalid enum value
db.collection('users/myUserId/portfolios').add({
  name: 'Test',
  initialCapital: 1000,
  baseCurrency: 'INVALID', // Should fail
  marketType: 'IDX'
})
```

### Using Firebase Emulator

```bash
# Start Firebase emulator
firebase emulators:start

# Run tests (after implementing Task 6.6)
npm run test:security-rules
```

## Deployment

To deploy these security rules to Firebase:

```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Or deploy all Firebase resources
firebase deploy
```

## Future Enhancements

1. **Rate Limiting**: Add per-user rate limiting untuk prevent abuse
2. **Advanced Validation**: Add business logic validation (e.g., prevent negative portfolio value)
3. **Audit Trail**: Add validation untuk track changes history
4. **Portfolio Limits**: Enforce max number of portfolios per user
5. **Trade Limits**: Enforce max trades per portfolio

## References

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules Best Practices](https://firebase.google.com/docs/firestore/security/rules-structure)
- Design Document: `/openspec/changes/build-stock-journal-app/design.md`
- Firebase Integration Spec: `/openspec/changes/build-stock-journal-app/specs/firebase-integration/spec.md`
