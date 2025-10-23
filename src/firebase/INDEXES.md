# Firestore Indexes

Dokumen ini menjelaskan Firestore indexes yang digunakan dalam Stock Journal App.

## Overview

Firestore indexes diperlukan untuk melakukan query dengan filtering dan sorting. Indexes yang terdefinisi di `firestore.indexes.json` akan otomatis di-deploy saat menjalankan `firebase deploy --only firestore:indexes`.

## Indexes yang Dikonfigurasi

### 1. Trades - Filter by Symbol + Sort by Date

**Collection**: `trades`
**Fields**:
- `symbol` (ASCENDING)
- `date` (DESCENDING)

**Use Case**: Query trades untuk symbol tertentu, diurutkan berdasarkan tanggal terbaru
```typescript
const q = query(
  tradesRef,
  where('symbol', '==', 'BBCA'),
  orderBy('date', 'desc')
)
```

### 2. Trades - Filter by Type + Sort by Date

**Collection**: `trades`
**Fields**:
- `type` (ASCENDING)
- `date` (DESCENDING)

**Use Case**: Query trades berdasarkan type (BUY/SELL), diurutkan berdasarkan tanggal
```typescript
const q = query(
  tradesRef,
  where('type', '==', 'BUY'),
  orderBy('date', 'desc')
)
```

### 3. Trades - Sort by Date (Ascending)

**Collection**: `trades`
**Fields**:
- `date` (ASCENDING)

**Use Case**: Query trades diurutkan dari yang terlama (untuk FIFO calculation)
```typescript
const q = query(
  tradesRef,
  orderBy('date', 'asc')
)
```

### 4. Journals - Filter by TradeId + Sort by Created

**Collection**: `journals`
**Fields**:
- `tradeId` (ASCENDING)
- `createdAt` (DESCENDING)

**Use Case**: Query journal entries yang terkait dengan trade tertentu
```typescript
const q = query(
  journalsRef,
  where('tradeId', '==', tradeId),
  orderBy('createdAt', 'desc')
)
```

### 5. Journals - Sort by Created Date

**Collection**: `journals`
**Fields**:
- `createdAt` (DESCENDING)

**Use Case**: Query semua journal entries diurutkan berdasarkan tanggal pembuatan
```typescript
const q = query(
  journalsRef,
  orderBy('createdAt', 'desc')
)
```

### 6. Portfolios - Sort by Created Date

**Collection**: `portfolios`
**Fields**:
- `createdAt` (DESCENDING)

**Use Case**: Query portfolios diurutkan berdasarkan tanggal pembuatan
```typescript
const q = query(
  portfoliosRef,
  orderBy('createdAt', 'desc')
)
```

## Composite Indexes untuk Query Kompleks

Firebase akan otomatis menyarankan composite indexes yang dibutuhkan melalui error message di console ketika Anda menjalankan query yang memerlukan index tambahan.

### Contoh: Filter by Date Range + Symbol

Jika Anda perlu query seperti ini:
```typescript
const q = query(
  tradesRef,
  where('symbol', '==', 'BBCA'),
  where('date', '>=', startDate),
  where('date', '<=', endDate),
  orderBy('date', 'desc')
)
```

Firebase akan memberikan link untuk membuat composite index yang diperlukan.

## Single Field Indexes

Firestore secara otomatis membuat single field indexes untuk:
- Setiap field individual
- Collection ID fields
- Exempt fields yang ditandai di `fieldOverrides`

## Field Overrides

Field overrides digunakan untuk:
1. **Exclude fields dari indexing** (untuk field yang tidak pernah di-query)
2. **Customize index settings** untuk field tertentu

Saat ini tidak ada field overrides yang dikonfigurasi. Jika diperlukan untuk optimasi, bisa ditambahkan di `firestore.indexes.json`:

```json
{
  "fieldOverrides": [
    {
      "collectionGroup": "trades",
      "fieldPath": "notes",
      "indexes": []  // Exclude from indexing
    }
  ]
}
```

## Deployment

### Deploy Indexes ke Firebase

```bash
# Deploy semua indexes
firebase deploy --only firestore:indexes

# Deploy indexes dan rules sekaligus
firebase deploy --only firestore
```

### Monitoring Index Build

Setelah deploy, indexes akan di-build di Firebase Console. Untuk collection yang sudah memiliki data, proses build bisa memakan waktu beberapa menit hingga jam.

Cek status build di:
**Firebase Console → Firestore Database → Indexes**

## Best Practices

### 1. Index Only What You Query

Jangan membuat index untuk field yang tidak pernah digunakan dalam query. Indexes mengkonsumsi storage dan memperlambat write operations.

### 2. Use Composite Indexes Wisely

Composite indexes efektif untuk query kompleks, tapi pastikan query tersebut benar-benar digunakan dalam aplikasi.

### 3. Monitor Index Usage

Firebase Console menampilkan statistik tentang index usage. Review secara berkala untuk menghapus indexes yang tidak terpakai.

### 4. Consider Query Patterns

Design indexes berdasarkan query patterns yang paling sering digunakan:
- Dashboard: Butuh recent trades/journals → index by date DESC
- Filter by symbol: Butuh trades per stock → index by symbol + date
- Analytics: Butuh historical data → index by date ASC

## Troubleshooting

### Error: "The query requires an index"

Jika Anda mendapat error ini:
1. Firebase Console akan memberikan link untuk membuat index
2. Atau copy error message dan tambahkan ke `firestore.indexes.json`
3. Deploy ulang indexes: `firebase deploy --only firestore:indexes`

### Slow Query Performance

Jika query lambat meskipun sudah ada index:
1. Cek query menggunakan index yang tepat (Firebase Console → Performance)
2. Pertimbangkan menggunakan `limit()` untuk pagination
3. Cache hasil query di client-side dengan Vue computed properties

### Index Build Failed

Jika index build gagal di Firebase Console:
1. Cek apakah ada konflik dengan index yang sudah ada
2. Delete index yang konflik dan rebuild
3. Pastikan field types konsisten di semua documents

## References

- [Firestore Index Best Practices](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Understanding Query Performance](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Firestore Pricing - Index Storage](https://firebase.google.com/pricing)
