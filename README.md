# RumahJKT — Sistem Rekomendasi Properti Jakarta

Platform rekomendasi properti berbasis web untuk wilayah Jakarta. Sistem ini membantu pengguna menemukan properti yang paling sesuai dengan preferensi dan anggaran mereka menggunakan algoritma weighted scoring.

---

## Fitur Utama

- **Rekomendasi Cerdas** — Algoritma weighted scoring menghitung skor kecocokan (0–100%) antara preferensi user dan data properti berdasarkan harga, wilayah, fasilitas, dan tipe
- **Filter Multi-Kriteria** — Filter berdasarkan harga, wilayah, tipe properti, jumlah kamar, sertifikat, dan fasilitas
- **3 Mode Tampilan** — Grid, List, dan Peta interaktif (Leaflet + CARTO dark tiles)
- **Perbandingan Properti** — Bandingkan hingga 3 properti secara side-by-side dengan highlight nilai terbaik
- **Wishlist** — Simpan properti favorit (membutuhkan login)
- **Detail Properti** — Galeri foto, spesifikasi lengkap, fasilitas, dan tombol hubungi via WhatsApp
- **Autentikasi** — Login, register, dan reset password via email (Supabase Auth)
- **Admin Dashboard** — CRUD properti, upload foto, manajemen status (khusus role admin)
- **Pagination** — 12 properti per halaman
- **Responsive** — Mobile-first dengan filter drawer untuk layar kecil

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v3 |
| Routing | React Router DOM v7 |
| State Management | Zustand v5 (filter, compare) + React Context (auth) |
| Animasi | Framer Motion v12 |
| Peta | React Leaflet v5 + Leaflet v1.9 |
| Backend / Database | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Form | React Hook Form v7 |

---

## Struktur Proyek

```
rumah-jakarta/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.jsx              # Root routing + AuthProvider
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles & design tokens
│   ├── pages/
│   │   ├── Home.jsx         # Halaman utama (listing + filter)
│   │   ├── Auth.jsx         # Login / Register / Forgot Password
│   │   ├── PropertyDetail.jsx  # Detail properti + galeri
│   │   ├── ComparePage.jsx  # Perbandingan properti
│   │   ├── WishlistPage.jsx # Wishlist user
│   │   ├── AdminDashboard.jsx  # Manajemen properti (admin)
│   │   └── PropertyForm.jsx # Form tambah/edit properti (admin)
│   ├── components/
│   │   ├── Navbar.jsx       # Header navigasi
│   │   ├── FilterPanel.jsx  # Sidebar filter
│   │   ├── PropertyCard.jsx # Card properti (grid + list)
│   │   ├── MapView.jsx      # Peta interaktif
│   │   ├── CompareBar.jsx   # Floating bar perbandingan
│   │   ├── ScoreBadge.jsx   # Badge skor kecocokan
│   │   └── ProtectedRoute.jsx  # Guard route (user + admin)
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state global
│   ├── hooks/
│   │   ├── UseAuth.jsx      # Hook akses auth context
│   │   └── UseProperties.js # Hook fetch + filter properti
│   ├── lib/
│   │   ├── supabase.js      # Supabase client + helpers
│   │   ├── Recommend.js     # Algoritma weighted scoring
│   │   └── UserProperties.js # Helper wishlist & properti by ID
│   └── store/
│       └── FilterStore.js   # Zustand store (filter, sort, compare, page)
├── seed.mjs                 # Script seeder data ke Supabase
├── .env                     # Environment variables (tidak di-commit)
└── package.json
```

---

## Algoritma Rekomendasi

Sistem menggunakan **weighted scoring** yang dihitung secara real-time di client:

| Kriteria | Bobot | Logika |
|---|---|---|
| Harga | 40% | Skor penuh jika ≤ budget; skor 50% jika lewat < 10% |
| Wilayah | 30% | Skor penuh jika wilayah cocok atau filter kosong |
| Fasilitas | 20% | Proporsional: (fasilitas cocok / fasilitas diminta) × 20 |
| Tipe Properti | 10% | Skor penuh jika tipe sama atau filter kosong |

**Label output:**
- ≥ 90% → Sangat Cocok
- ≥ 75% → Cocok
- < 75% → Kurang Cocok

---

## Skema Database (Supabase)

### Tabel `properties`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | Primary key |
| nama | text | Nama properti |
| harga | bigint | Harga dalam Rupiah |
| tipe | text | rumah / apartemen / ruko / tanah / villa |
| kota_wilayah | text | Jakarta Selatan / Utara / Barat / Timur / Pusat |
| kecamatan | text | Nama kecamatan |
| alamat | text | Alamat lengkap |
| luas_bangunan | int | m² |
| luas_tanah | int | m² |
| kamar_tidur | int | Jumlah kamar tidur |
| kamar_mandi | int | Jumlah kamar mandi |
| lantai | int | Jumlah lantai |
| garasi | int | Kapasitas garasi |
| sertifikat | text | SHM / HGB / SHGB / Strata |
| fasilitas | text[] | Array nama fasilitas |
| foto_urls | text[] | Array URL foto dari Supabase Storage |
| lat | float | Latitude untuk peta |
| lng | float | Longitude untuk peta |
| deskripsi | text | Deskripsi properti |
| status | text | aktif / nonaktif / terjual |
| created_at | timestamptz | Waktu dibuat |

### Tabel lainnya
- **`profiles`** — Data user (nama, email, role)
- **`wishlist`** — Relasi user ↔ properti
- **`ratings`** — Rating properti (tersedia di DB, belum ditampilkan di UI)

---

## Cara Menjalankan

### Prasyarat
- Node.js v18+
- Akun Supabase (sudah dikonfigurasi)

### Langkah

```bash
# 1. Clone repository
git clone <repo-url>
cd rumah-jakarta

# 2. Install dependencies
npm install

# 3. Buat file .env (sudah tersedia, tidak perlu diubah)
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 4. Jalankan development server
npm run dev
```

Buka browser di **http://localhost:5173**

### Perintah Lain

```bash
npm run build    # Build untuk production
npm run preview  # Preview hasil build
npm run lint     # Cek kode dengan ESLint
```

---

## Konfigurasi Environment

Buat file `.env` di root folder `rumah-jakarta/`:

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

> Jangan commit file `.env` ke repository. File ini sudah ada di `.gitignore`.

---

## Role & Akses

| Role | Akses |
|---|---|
| Guest (belum login) | Lihat listing, detail, peta, perbandingan |
| User (login) | + Wishlist, hubungi via WhatsApp |
| Admin | + Dashboard CRUD, tambah/edit/hapus properti, upload foto |

Untuk membuat akun admin, set kolom `role = 'admin'` di tabel `profiles` via Supabase dashboard.

---

## Keep-Alive Supabase

Proyek ini menggunakan GitHub Actions untuk mencegah Supabase free tier di-pause karena inaktivitas. Workflow berjalan setiap 4 hari sekali dan melakukan query ringan ke database.

File: `.github/workflows/keep-supabase-alive.yml`

Setup secrets yang diperlukan di GitHub repository:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

## Lisensi

Proyek ini dibuat untuk keperluan portofolio. Bebas digunakan sebagai referensi.
