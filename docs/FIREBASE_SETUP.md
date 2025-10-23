# Firebase Setup Guide

## Mendapatkan Firebase Credentials

Untuk mendapatkan Firebase credentials yang diperlukan, ikuti langkah-langkah berikut:

### 1. Buka Firebase Console

Akses [Firebase Console](https://console.firebase.google.com/)

### 2. Pilih Project

Pilih project **stock-jurnal-app** dari daftar project Anda.

### 3. Buka Project Settings

1. Klik icon **⚙️ (gear/roda gigi)** di samping "Project Overview" di sidebar kiri
2. Pilih **"Project settings"**

### 4. Register Web App (Jika Belum Ada)

1. Scroll ke bawah ke bagian **"Your apps"**
2. Jika belum ada web app, klik tombol **"Add app"**
3. Pilih icon **Web (</> icon)**
4. Beri nama app (misalnya: "Stock Journal Web")
5. **Centang** "Also set up Firebase Hosting for this app" (opsional)
6. Klik **"Register app"**

### 5. Copy Firebase Config

Setelah app terdaftar, Anda akan melihat kode konfigurasi seperti ini:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "stock-jurnal-app.firebaseapp.com",
  projectId: "stock-jurnal-app",
  storageBucket: "stock-jurnal-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

### 6. Update File .env

Copy nilai-nilai dari `firebaseConfig` ke file `.env` di root project:

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=stock-jurnal-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=stock-jurnal-app
VITE_FIREBASE_STORAGE_BUCKET=stock-jurnal-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 7. Verifikasi Setup

Setelah update `.env`, restart development server:

```bash
npm run dev
```

Buka browser console (F12) dan pastikan tidak ada error terkait Firebase initialization.

## Troubleshooting

### Error: "Missing required environment variable"

- Pastikan semua environment variables sudah diisi di file `.env`
- Restart development server setelah update `.env`

### Error: "Firebase: Error (auth/invalid-api-key)"

- Pastikan `VITE_FIREBASE_API_KEY` sudah benar
- Copy ulang dari Firebase Console

### Error: "Firebase: Firebase App named '[DEFAULT]' already exists"

- Ini biasanya terjadi jika app diinisialisasi lebih dari sekali
- Pastikan hanya import dari `src/firebase/config.ts` atau `src/firebase/index.ts`

## File Structure

```
src/firebase/
├── config.ts    # Firebase initialization dan configuration
└── index.ts     # Main exports untuk Firebase services
```

## Keamanan

⚠️ **PENTING**: File `.env` sudah ada di `.gitignore` dan **tidak akan** ter-commit ke repository. Jangan pernah commit credentials ke public repository!

## Next Steps

Setelah Firebase credentials dikonfigurasi, Anda dapat melanjutkan ke:
- Task 3.x: Firebase Authentication Implementation
- Task 5.x: Firestore Database Schema
- Task 7.x: Portfolio Management Implementation
