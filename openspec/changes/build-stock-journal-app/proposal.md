# Build Stock Journal App

## Why

Traders membutuhkan cara yang terstruktur untuk mendokumentasikan dan menganalisis aktivitas trading mereka. Tanpa journal yang proper, sulit untuk belajar dari kesalahan, mengidentifikasi pattern yang profitable, dan meningkatkan performa trading secara konsisten. Dengan Firebase sebagai backend, aplikasi dapat menyediakan real-time sync dan multi-device access.

## What Changes

- Membuat aplikasi web personal journal untuk stock trading dengan Vue 3, Material-Tailwind v3, dan Pinia
- **Firebase Firestore** sebagai NoSQL database untuk data persistence dengan real-time updates
- **Firebase Authentication** untuk user login (email/Google) dan multi-device sync
- **Multiple portfolios** support - user dapat membuat dan manage berbagai portfolio terpisah
- Fokus pada **Indonesia Stock Exchange (IDX/BEI)** dengan single currency (IDR) per portfolio
- Sistem tracking transaksi saham (buy/sell) dengan input manual per portfolio
- Journal notes dan refleksi untuk setiap trade dalam context portfolio
- Kalkulasi otomatis profit/loss per portfolio dan per trade
- Dashboard dengan portfolio selector dan statistik performa trading
- Frontend responsive dengan Material-Tailwind v3 components
- State management menggunakan Pinia dengan Firestore integration

## Impact

**Affected specs:**
- `portfolio-management` - CRUD operations untuk manage multiple portfolios
- `firebase-integration` - Firebase setup, Firestore schema, dan Authentication
- `trade-management` - Tracking transaksi buy/sell dalam portfolio hierarchy
- `journal-entries` - Notes dan refleksi terikat ke portfolio dan trade
- `portfolio-analytics` - Kalkulasi P&L per portfolio dengan multi-currency support
- `dashboard-visualization` - Dashboard dengan portfolio selector dan real-time updates
- `frontend-ui` - Vue 3 components dengan Firebase SDK dan Material-Tailwind

**Affected code:**
- New project initialization
- Frontend: Vue 3 app structure, Pinia stores with Firestore, Material-Tailwind components
- Firebase: Firestore schema, Security Rules, Authentication configuration
- No traditional backend server needed (serverless dengan Firebase)
