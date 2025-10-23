# Deployment Guide - Stock Journal App

## Overview

Aplikasi ini menggunakan **Firebase** untuk:
- **Firestore**: Database
- **Authentication**: User management
- **Hosting**: Static site hosting

## Prerequisites

1. **Firebase CLI** terinstal:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project** sudah dibuat di [Firebase Console](https://console.firebase.google.com/)

3. **Login** ke Firebase:
   ```bash
   firebase login
   ```

4. **Project** sudah di-link:
   ```bash
   firebase use <project-id>

   # Atau untuk melihat project yang tersedia:
   firebase projects:list
   ```

## Deployment Steps

### 1. Deploy Firestore Security Rules Only (Task 6.7)

```bash
# Deploy hanya security rules
firebase deploy --only firestore:rules

# Output yang diharapkan:
# === Deploying to 'your-project-id'...
#
# i  deploying firestore
# i  firestore: checking firestore.rules for compilation errors...
# ✔  firestore: rules file firestore.rules compiled successfully
# i  firestore: uploading rules firestore.rules...
# ✔  firestore: released rules firestore.rules to cloud.firestore
#
# ✔  Deploy complete!
```

**Verifikasi deployment:**
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Navigate ke: **Firestore Database → Rules**
3. Pastikan rules terbaru sudah ter-deploy

### 2. Deploy Firestore Indexes

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Output yang diharapkan:
# ✔  firestore: deployed indexes in firestore.indexes.json successfully
```

### 3. Deploy Full Application (Rules + Hosting)

```bash
# Build production bundle
npm run build

# Deploy everything (rules + hosting)
firebase deploy

# Atau deploy specific targets:
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

## Deployment Commands Summary

```bash
# Deploy only security rules (Task 6.7)
firebase deploy --only firestore:rules

# Deploy only indexes
firebase deploy --only firestore:indexes

# Deploy only hosting
firebase deploy --only hosting

# Deploy firestore (rules + indexes)
firebase deploy --only firestore

# Deploy everything
firebase deploy
```

## NPM Scripts untuk Deployment

Tambahkan ke `package.json`:

```json
{
  "scripts": {
    "deploy:rules": "firebase deploy --only firestore:rules",
    "deploy:indexes": "firebase deploy --only firestore:indexes",
    "deploy:firestore": "firebase deploy --only firestore",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "deploy": "npm run build && firebase deploy"
  }
}
```

Kemudian gunakan:

```bash
# Deploy rules saja
npm run deploy:rules

# Deploy hosting
npm run deploy:hosting

# Deploy semua
npm run deploy
```

## Security Rules Deployment Checklist

✅ **Before Deployment:**
- [ ] Review semua perubahan di `firestore.rules`
- [ ] Run local tests: `npm run test:security-rules`
- [ ] Verify rules syntax dengan Firebase CLI: `firebase deploy --only firestore:rules --dry-run`
- [ ] Backup existing rules (otomatis di Firebase Console)

✅ **During Deployment:**
- [ ] Deploy dengan command: `firebase deploy --only firestore:rules`
- [ ] Tunggu confirmation message
- [ ] Check untuk errors

✅ **After Deployment:**
- [ ] Verify rules di Firebase Console
- [ ] Test authentication flow di staging/production
- [ ] Monitor Firebase logs untuk permission errors
- [ ] Test dengan real user accounts

## Rolling Back Security Rules

Jika ada masalah setelah deployment:

**Method 1: Via Firebase Console**
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Go to **Firestore Database → Rules**
3. Click **Rules history**
4. Select previous version
5. Click **Restore**

**Method 2: Via CLI (Re-deploy old rules)**
1. Checkout previous git commit
2. Run: `firebase deploy --only firestore:rules`

**Method 3: Temporary Emergency Fix**
```bash
# ONLY FOR EMERGENCY - Opens database to all authenticated users
# Edit firestore.rules temporarily, then deploy
firebase deploy --only firestore:rules
```

## Monitoring After Deployment

### Check Firebase Logs
```bash
# Stream Firestore logs
firebase deploy --only firestore:rules && firebase firestore:logs

# Or in Firebase Console:
# Firestore → Usage → Request Metrics
```

### Monitor Permission Errors

Di Firebase Console:
1. **Firestore Database → Usage**
2. Look for **Permission Denied** errors spike
3. Click untuk melihat details

### Application Monitoring

Tambahkan error logging di aplikasi:

```typescript
// src/firebase/firestore.ts
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

const db = getFirestore()

// Log permission errors
db.onSnapshot(
  (snapshot) => {
    // Success
  },
  (error) => {
    if (error.code === 'permission-denied') {
      console.error('Firestore permission denied:', error)
      // Send to error tracking service (Sentry, etc.)
    }
  }
)
```

## Production Deployment Best Practices

### 1. Staging Environment (Recommended)

```bash
# Setup staging project
firebase use staging-project-id

# Deploy to staging first
firebase deploy --only firestore:rules

# Test thoroughly
npm run test:e2e

# Then deploy to production
firebase use production-project-id
firebase deploy --only firestore:rules
```

### 2. Gradual Rollout

1. Deploy rules di non-peak hours
2. Monitor logs closely for first 30 minutes
3. Keep Firebase Console open untuk quick rollback
4. Test critical user flows

### 3. Documentation

Update `FIRESTORE_SECURITY_RULES.md` dengan:
- Tanggal deployment
- Changes yang di-deploy
- Alasan perubahan
- Rollback plan if needed

## Troubleshooting Deployment

### Error: "Permission denied"

```bash
# Solution: Login ulang
firebase logout
firebase login
```

### Error: "Project not found"

```bash
# Solution: Set correct project
firebase use <project-id>

# Or add project
firebase use --add
```

### Error: "Rules compilation failed"

```bash
# Check syntax errors in firestore.rules
firebase deploy --only firestore:rules --dry-run

# Fix syntax errors, then deploy again
```

### Error: "Failed to load rules"

**Cause**: firestore.rules file tidak ditemukan

**Solution**:
```bash
# Verify file exists
ls -la firestore.rules

# Verify firebase.json points to correct file
cat firebase.json | grep rules
```

## Post-Deployment Verification

### Test dengan Firebase Console

1. Open **Firestore Database → Data**
2. Try manual CRUD operations:
   - Create user document
   - Create portfolio
   - Create trade
   - Verify permissions work

### Test dengan Application

```bash
# Run app locally pointing to production
npm run dev

# Test user flows:
# 1. Register new account
# 2. Create portfolio
# 3. Add trades
# 4. Create journal entries
# 5. Verify all operations work
```

### Check Firebase Usage

1. **Firestore → Usage**
   - Document reads/writes
   - Storage usage
   - Network egress

2. **Authentication → Usage**
   - Active users
   - Sign-in methods

3. Set up **Budget Alerts** to prevent unexpected costs

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only firestore:rules,hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

**Setup Firebase Token untuk CI/CD:**
```bash
# Generate token
firebase login:ci

# Add token to GitHub Secrets:
# Repository Settings → Secrets → New repository secret
# Name: FIREBASE_TOKEN
# Value: <token from previous command>
```

## Environment-Specific Deployments

### Development
```bash
firebase use dev-project-id
firebase deploy --only firestore:rules
```

### Staging
```bash
firebase use staging-project-id
firebase deploy --only firestore:rules
```

### Production
```bash
firebase use production-project-id
firebase deploy --only firestore:rules
```

## Task 6.7 Completion Checklist

- [x] ✅ Review firestore.rules file
- [x] ✅ Test security rules locally (Task 6.6)
- [ ] ⏳ Deploy rules: `firebase deploy --only firestore:rules`
- [ ] ⏳ Verify deployment di Firebase Console
- [ ] ⏳ Test application dengan deployed rules
- [ ] ⏳ Monitor logs untuk errors
- [ ] ⏳ Update tasks.md dengan status completed

## Support & Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **Firebase CLI Reference**: https://firebase.google.com/docs/cli
- **Firebase Console**: https://console.firebase.google.com/

## Next Steps After Task 6.7

Once security rules are deployed:
1. ✅ Task 6.7 Complete
2. ➡️ Move to **Task 7**: Portfolio Management Implementation
3. ➡️ Start building Pinia stores with VueFire integration
