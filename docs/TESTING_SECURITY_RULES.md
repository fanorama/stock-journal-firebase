# Testing Firestore Security Rules

## Prerequisites

1. **Firebase CLI** harus sudah terinstal:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project** sudah dikonfigurasi:
   ```bash
   firebase login
   firebase use <project-id>
   ```

## Running Security Rules Tests

### Method 1: Menggunakan Firebase Emulator (Recommended)

**Step 1: Start Firebase Emulator**
```bash
# Terminal 1: Start emulator
npm run emulator

# Atau manual:
firebase emulators:start --only firestore
```

Emulator akan berjalan di:
- Firestore Emulator: http://localhost:8080
- Emulator UI: http://localhost:4000

**Step 2: Run Tests**
```bash
# Terminal 2: Run tests
npm run test:security-rules

# Atau run all tests:
npm test
```

### Method 2: One Command (Automatic)

```bash
# This will start emulator, run tests, then stop emulator
npm run emulator:test
```

### Method 3: Watch Mode (Development)

```bash
# Terminal 1: Keep emulator running
npm run emulator

# Terminal 2: Run tests in watch mode
npm run test:watch
```

## Test Coverage

Test file mencakup **semua security rules** untuk:

### ✅ Users Collection (Task 6.1)
- [x] Deny unauthenticated read access
- [x] Deny unauthenticated write access
- [x] Allow user to read their own document
- [x] Deny user reading another user's document
- [x] Allow user to create their own document with required fields
- [x] Deny creating document without email field
- [x] Deny user deleting their own document

### ✅ Portfolios Subcollection (Task 6.2)
- [x] Deny unauthenticated access to portfolios
- [x] Allow user to create portfolio with valid data
- [x] Deny creating portfolio without required name field
- [x] Deny creating portfolio with empty name
- [x] Deny creating portfolio with name > 100 characters
- [x] Deny creating portfolio with negative initialCapital
- [x] Deny creating portfolio with invalid baseCurrency
- [x] Allow valid baseCurrency values (IDR, USD, EUR, SGD, JPY)
- [x] Deny creating portfolio with invalid marketType
- [x] Allow valid marketType values (IDX, US_STOCKS, CRYPTO, FOREX)
- [x] Deny user accessing another user's portfolios
- [x] Allow user to update their own portfolio
- [x] Allow user to delete their own portfolio

### ✅ Trades Subcollection (Task 6.3)
- [x] Allow user to create trade with valid data
- [x] Deny creating trade without required symbol field
- [x] Deny creating trade with invalid type
- [x] Allow valid trade types (BUY and SELL)
- [x] Deny creating trade with zero quantity
- [x] Deny creating trade with negative quantity
- [x] Deny creating trade with zero price
- [x] Deny creating trade with negative price
- [x] Deny creating trade with negative fees
- [x] Allow creating trade with zero fees
- [x] Deny creating trade with notes > 1000 characters
- [x] Deny creating trade with symbol > 10 characters
- [x] Allow user to update their own trade
- [x] Allow user to delete their own trade

### ✅ Journals Subcollection (Task 6.4)
- [x] Allow user to create journal with valid data
- [x] Allow creating journal without optional fields
- [x] Deny creating journal without portfolioId
- [x] Deny creating journal with entryReason > 5000 characters
- [x] Deny creating journal with exitStrategy > 5000 characters
- [x] Deny creating journal with emotions > 5000 characters
- [x] Deny creating journal with lessonsLearned > 5000 characters
- [x] Allow user to update their own journal
- [x] Allow user to delete their own journal

## Test Structure

```typescript
describe('Firestore Security Rules', () => {
  describe('Users Collection', () => {
    test('should deny unauthenticated read access', ...)
    test('should allow user to read their own document', ...)
    // ... more tests
  })

  describe('Portfolios Subcollection', () => {
    test('should allow user to create portfolio with valid data', ...)
    // ... more tests
  })

  describe('Trades Subcollection', () => {
    test('should allow user to create trade with valid data', ...)
    // ... more tests
  })

  describe('Journals Subcollection', () => {
    test('should allow user to create journal with valid data', ...)
    // ... more tests
  })
})
```

## Expected Test Results

Jika semua security rules sudah benar, Anda akan melihat output seperti ini:

```
PASS __tests__/firestore.rules.test.ts
  Firestore Security Rules
    Users Collection
      ✓ should deny unauthenticated read access (XXms)
      ✓ should allow user to read their own document (XXms)
      ... (7 tests)
    Portfolios Subcollection
      ✓ should allow user to create portfolio with valid data (XXms)
      ... (13 tests)
    Trades Subcollection
      ✓ should allow user to create trade with valid data (XXms)
      ... (14 tests)
    Journals Subcollection
      ✓ should allow user to create journal with valid data (XXms)
      ... (9 tests)

Test Suites: 1 passed, 1 total
Tests:       43 passed, 43 total
Snapshots:   0 total
Time:        X.XXXs
```

## Troubleshooting

### Error: "405 Method Not Allowed"

**Cause**: Firebase Emulator tidak berjalan.

**Solution**:
```bash
# Start emulator di terminal terpisah
firebase emulators:start --only firestore
```

### Error: "ECONNREFUSED localhost:8080"

**Cause**: Emulator port sudah digunakan oleh aplikasi lain.

**Solution**:
```bash
# Check process using port 8080
lsof -i :8080

# Kill process if needed
kill -9 <PID>

# Or change port in test file
# Edit __tests__/firestore.rules.test.ts
# Change port from 8080 to another port
```

### Error: "Rules not found"

**Cause**: Path ke firestore.rules salah.

**Solution**: Pastikan file `firestore.rules` ada di root directory project.

### Tests Failing

**Debugging Steps**:
1. Check Firebase Emulator logs
2. Verify firestore.rules syntax
3. Check test data matches validation rules
4. Review error messages untuk specific validation failures

## Manual Testing dengan Emulator UI

1. Start emulator:
   ```bash
   firebase emulators:start
   ```

2. Buka browser: http://localhost:4000

3. Navigate ke Firestore tab

4. Test security rules secara manual:
   - Try creating documents as authenticated/unauthenticated users
   - Test field validations
   - Verify access controls

## CI/CD Integration

Untuk menjalankan tests di CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Test Security Rules

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm install -g firebase-tools
      - run: firebase emulators:exec --only firestore "npm run test:security-rules"
```

## Next Steps

After testing passes:
1. ✅ Task 6.6 Complete: Security rules tested
2. ➡️ Task 6.7: Deploy security rules to Firebase
3. ➡️ Continue with Task 7: Portfolio Management Implementation

## References

- [Firebase Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- Jest Documentation: https://jestjs.io/docs/getting-started
