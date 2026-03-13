# Inventory Management System

Inventory Management System berbasis **Next.js 14**, **TypeScript**, **Tailwind CSS**, **shadcn/ui-style components**, **Recharts**, dan **Excel (`.xlsx`)** sebagai database utama.

Project ini membaca data inventory dari workbook Excel dengan dua sheet utama:

- `Stationary`
- `Pantry`

Setiap item diparse ke struktur data terstandarisasi dan kategori diisi otomatis berdasarkan nama sheet.

## Fitur

- Dashboard ringkasan:
  - Total Items
  - Stationary Items
  - Pantry Items
  - Low Stock Items
  - Total Monthly Usage
- Charts:
  - Monthly Usage
  - Stationary vs Pantry Usage
  - Top Used Items
- Inventory table:
  - Search
  - Filter category
  - Sort
  - Pagination
- Halaman detail item:
  - Edit `Plan Order`, `Order`, dan `Use`
  - `End Stock` dihitung otomatis
  - `Stock` bulan berikutnya mengikuti `End Stock` bulan sebelumnya
- Low stock alert:
  - Badge merah jika `endStock < minimumStock`
  - Suggested order otomatis
- Reports page:
  - Total usage per month
  - Total cost per month
  - Most used items
  - Low stock report
- Import Excel
- Export Excel

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI + shadcn/ui-style components
- Recharts
- `xlsx`
- Excel workbook sebagai sumber data

## Program yang Perlu Diinstal

Sebelum menjalankan project ini, pastikan beberapa tools berikut sudah terpasang:

- `Git`
  - untuk clone repository dan pull update
- `Node.js`
  - direkomendasikan `Node.js 20 LTS`
  - `npm` akan ikut terinstal bersama Node.js
- Code editor
  - direkomendasikan `Visual Studio Code (VS Code)`
- Aplikasi pembuka file Excel
  - direkomendasikan `Microsoft Excel`
  - alternatif: `LibreOffice Calc`

## Clone Repository

Clone repository dengan perintah berikut:

```bash
git clone https://github.com/zuka-still-learning/stationary-pantry-inventory.git
```

Lalu masuk ke folder project:

```bash
cd stationary-pantry-inventory
```

## Struktur Folder

```bash
app/
  api/
    export/
    import/
    inventory/
  dashboard/
  import/
  inventory/
  pantry/
  reports/
  stationary/

components/
  charts/
  data-table/
  dashboard/
  import/
  monthly-table/
  sidebar/
  ui/

lib/
  calculation.ts
  constants.ts
  excel.ts
  inventory-service.ts
  utils.ts

types/
  inventory.ts

data/
  inventory.xlsx
```

## Struktur Excel

Workbook aktif berada di:

```bash
data/inventory.xlsx
```

Sheet yang dipakai:

- `Stationary`
- `Pantry`

Sheet `Pantry` boleh punya baris section seperti `FOOD` dan `NON FOOD`; baris seperti itu akan di-skip saat parsing karena bukan item inventory.

### Kolom utama

- `Item`
- `Unit`
- `Minimum Stock`
- `Price`

### Data bulanan

Setiap bulan memiliki 5 field:

- `Stock`
- `Plan Order`
- `Order`
- `Use`
- `End Stock`

Contoh:

```ts
January:
- stock_jan
- plan_order_jan
- order_jan
- use_jan
- end_stock_jan
```

## Formula Perhitungan

Project ini memakai aturan berikut:

```ts
endStock = stock + order - use
nextMonthStock = previousMonthEndStock
recommendedOrder = minimumStock - endStock
```

Jika `recommendedOrder` hasilnya negatif, sistem akan menampilkan `0`.

## Data Model

```ts
type MonthlyData = {
  stock: number
  planOrder: number
  order: number
  use: number
  endStock: number
}

type InventoryItem = {
  id: string
  item: string
  unit: string
  minimumStock: number
  price: number
  category: "Stationary" | "Pantry"
  months: Record<string, MonthlyData>
}
```

## Cara Menjalankan Project

### 1. Clone repository

```bash
git clone https://github.com/zuka-still-learning/stationary-pantry-inventory.git
cd stationary-pantry-inventory
```

### 2. Install dependency

```bash
npm install
```

### 3. Jalankan development server

```bash
npm run dev
```

### 4. Buka aplikasi

```bash
http://localhost:3000
```

### 5. Build production

```bash
npm run build
```

### 6. Jalankan production server

```bash
npm run start
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Routes Utama

- `/dashboard`
- `/inventory`
- `/inventory/[id]`
- `/stationary`
- `/pantry`
- `/reports`
- `/import`

## API Routes

- `GET /api/inventory`
- `GET /api/inventory/[id]`
- `PATCH /api/inventory/[id]`
- `POST /api/import`
- `GET /api/export`

## Cara Kerja Import / Export

### Import

Upload file `.xlsx` baru melalui halaman:

```bash
/import
```

File akan menggantikan workbook aktif di:

```bash
data/inventory.xlsx
```

### Export

Workbook aktif bisa diunduh kembali melalui:

```bash
/api/export
```

## Catatan Penting

- Project ini menggunakan **Excel sebagai database**, jadi perubahan detail item akan ditulis kembali ke file workbook.
- Parser Excel diimplementasikan di:
  - `lib/excel.ts`
- Business logic perhitungan ada di:
  - `lib/calculation.ts`
- Service layer untuk mengambil dan update data ada di:
  - `lib/inventory-service.ts`
- Jika workbook tidak punya sheet `Stationary` dan `Pantry`, import akan ditolak.
- Jika kolom `Price` pada workbook kosong, maka **total cost report akan menjadi `0`**.

## Status Verifikasi

Project ini sudah diverifikasi dengan:

```bash
npm run lint
npm run build
```

## File Excel Awal

Workbook sumber yang dipakai untuk setup awal project ini berasal dari file:

```bash
Report ATK & Pantry ISC 1.xlsx
```

dan sudah disalin menjadi:

```bash
data/inventory.xlsx
```
