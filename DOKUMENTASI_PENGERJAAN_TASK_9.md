# DOKUMENTASI PROSES PENGERJAAN (STEP-BY-STEP)
## TASK 9: Fullstack React + Laravel Sanctum API
### Login + Inventaris CRUD, Proteksi ID Restriction, Toast Notifications, & SEO

---

## 📋 INFORMASI PROYEK
* **Nama Proyek**: InventarisPro - Sistem Manajemen Inventaris Berbasis API
* **Lingkup Kerja**: Fullstack Development (Backend Laravel 11 API + Frontend React Vite SPA)
* **Lokasi Backend**: `D:\magang\task\8\inventaris-api\`
* **Lokasi Frontend**: `D:\magang\task\9\inventaris-client\`
* **Database**: MySQL (`inventaris_api`)

---

## 🛠️ TECH STACK & ARSITEKTUR
* **Backend**: Laravel 11, Laravel Sanctum (Token-Based Auth), Eloquent ORM, MySQL.
* **Frontend**: React 19, Vite, React Router DOM v7, Axios, Context API, Lucide React, Modern Vanilla CSS + Tailwind Utility Classes.
* **Keamanan & Proteksi**:
  - Laravel Sanctum Bearer Token.
  - Eloquent User Scoping (Data Isolation / ID Restriction per User).
  - Anti-Spam Honeypot Protection pada seluruh form.
  - Private Route Guard pada frontend React.
* **Pengujian**: Postman Collection (`Inventaris_API_Postman_Collection.json`) & PowerShell REST CLI.

---

## 🚀 TAHAPAN PENGERJAAN STEP-BY-STEP

```
+-----------------------------------------------------------------------------+
|                                ALUR PENGERJAAN                              |
+-----------------------------------------------------------------------------+
| 1. Backend: Database Migration (user_id FK pada categories & items)         |
| 2. Backend: Relasi Model (User, Category, Item)                             |
| 3. Backend: Form Requests & Kustomisasi Pesan Validasi                      |
| 4. Backend: Controller Scoping (CategoryController & ItemController)       |
| 5. Backend: Auth Controller & Endpoint Profile (/me)                        |
| 6. Backend: Database Seeder & Akun Uji Coba Multi-User                      |
| 7. Frontend: Setup React + Vite & Desain Sistem Modern (CSS)                |
| 8. Frontend: Axios Client + Token Interceptor & 401 Handler                 |
| 9. Frontend: Toast Notification System (ToastContext)                       |
| 10. Frontend: State Autentikasi & Proteksi Rute (AuthContext & PrivateRoute)|
| 11. Frontend: Halaman Login & Registrasi (Anti-Spam & Duplicate Check)      |
| 12. Frontend: Halaman Dashboard, Inventaris (Items), & Kategori             |
| 13. Frontend: Penerapan SEO Lengkap, Metadata, & JSON-LD Schemas            |
| 14. Testing: Postman Collection & Verifikasi ID Restriction                 |
| 15. Maintenance: Skrip Backup Database & Source Code Otomatis               |
+-----------------------------------------------------------------------------+
```

---

### TAHAP 1: Perancangan Database & Migrasi (Backend)
**Tujuan**: Menjamin bahwa setiap kategori dan barang memiliki pemilik (`user_id`), sehingga user tidak bisa melihat atau memanipulasi data milik user lain.

1. **Membuat Migration**:
   Menambahkan kolom `user_id` bertipe Foreign Key dengan opsi cascade delete pada tabel `categories` dan `items`.
   * **File**: `database/migrations/2026_09_16_033622_add_user_id_to_categories_and_items_tables.php`
   ```php
   Schema::table('categories', function (Blueprint $table) {
       $table->dropUnique(['name']); // Menghapus unique global agar user berbeda bisa membuat kategori bernama sama
       $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
   });
   Schema::table('items', function (Blueprint $table) {
       $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
   });
   ```

---

### TAHAP 2: Definisi Relasi pada Model Eloquent
**Tujuan**: Menghubungkan model User, Category, dan Item.

1. **Model `User.php`** (`app/Models/User.php`):
   - Menambahkan relasi `hasMany` ke `Category` dan `Item`.
   ```php
   public function categories(): HasMany { return $this->hasMany(Category::class); }
   public function items(): HasMany { return $this->hasMany(Item::class); }
   ```
2. **Model `Category.php`** (`app/Models/Category.php`):
   - Menambahkan `user_id` ke `$fillable` dan relasi `belongsTo` ke `User`.
3. **Model `Item.php`** (`app/Models/Item.php`):
   - Menambahkan `user_id` ke `$fillable` dan relasi `belongsTo` ke `User` & `Category`.

---

### TAHAP 3: Form Request & Kustomisasi Pesan Error
**Tujuan**: Menyeragamkan validasi input dan menyediakan pesan kesalahan yang ramah pengguna, termasuk penanganan duplikasi email saat registrasi.

1. **`RegisterRequest.php`**:
   - Menambahkan rule `unique:users,email`.
   - Mengatur custom message:
     ```php
     'email.unique' => 'Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun yang sudah ada.'
     ```
2. **`LoginRequest.php`**:
   - Memastikan email dan password tervalidasi dengan pesan berbahasa Indonesia.
3. **`CategoryRequest.php` & `ItemRequest.php`**:
   - Validasi nama, SKU, kategori, stok, dan harga.
   - Pengecekan keunikan SKU disesuaikan dengan ID barang saat update (`Rule::unique('items', 'sku')->ignore(...)`).

---

### TAHAP 4: Implementasi ID Restriction pada Controller
**Tujuan**: Mencegah ID Insecure Direct Object Reference (IDOR) / akses tidak sah antar pengguna via Postman maupun browser.

1. **`CategoryController.php`**:
   - **`index()`**: Hanya mengambil kategori milik user yang sedang aktif:
     ```php
     $categories = $request->user()->categories()->withCount('items')->get();
     ```
   - **`store()`**: Menyimpan kategori otomatis dengan `user_id` pembuat:
     ```php
     $category = $request->user()->categories()->create($request->validated());
     ```
   - **`show()`, `update()`, `destroy()`**: Melakukan query terbatas pada akun user:
     ```php
     $category = $request->user()->categories()->find($id);
     if (!$category) {
         return response()->json([
             'success' => false,
             'message' => 'Kategori tidak ditemukan atau Anda tidak memiliki akses ke data ini.'
         ], 404);
     }
     ```

2. **`ItemController.php`**:
   - **Pencegahan Cross-Category Hijack**: Saat membuat atau mengubah barang, sistem memvalidasi apakah `category_id` benar-benar milik user tersebut:
     ```php
     $catExists = $request->user()->categories()->where('id', $request->category_id)->exists();
     if (!$catExists) {
         return response()->json([
             'success' => false,
             'message' => 'Kategori yang dipilih tidak valid atau bukan milik akun Anda.'
         ], 422);
     }
     ```
   - **Proteksi Akses Data**:
     Jika user mencoba mengedit/menghapus barang milik user lain, sistem menolak dengan pesan:
     `"Barang tidak ditemukan atau Anda tidak diizinkan mengubah data milik pengguna lain."` (Status 403).

---

### TAHAP 5: Database Seeder & Akun Uji Multi-User
**Tujuan**: Menyiapkan data awal agar skenario ID restriction langsung bisa diuji tanpa konfigurasi manual.

* **File**: `database/seeders/DatabaseSeeder.php`
* **Data yang disiapkan**:
  1. **User 1 (Admin)**: `test@example.com` / `password` (memiliki 3 kategori: *Elektronik, Furniture, Alat Tulis* dan 7 item).
  2. **User 2 (Restricted)**: `user2@example.com` / `password` (memiliki 1 kategori: *Kategori Khusus User 2* dan 1 item rahasia).
* **Perintah**:
  ```bash
  php artisan migrate:fresh --seed
  ```

---

### TAHAP 6: Pembuatan Frontend React (Vite)
**Tujuan**: Membangun client Single Page Application yang interaktif, elegan, dan terintegrasi dengan API.

1. **Inisialisasi Project**:
   Direktori: `D:\magang\task\9\inventaris-client\`
2. **Konfigurasi Lingkungan (`.env`)**:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_WHATSAPP_NUMBER=6281234567890
   ```
3. **Design System & Styling (`src/index.css`)**:
   - Palet warna modern: Indigo, Slate, Emerald, Rose, Amber.
   - Glassmorphism efek kartu transparan (`backdrop-blur-md`).
   - Micro-animations: smooth fade-in, scale hover, button pulse.

---

### TAHAP 7: Axios Client, Toast System, & Auth Context

1. **Axios Client (`src/api/axiosClient.js`)**:
   - Otomatis menyisipkan header `Authorization: Bearer <token>` dari `localStorage`.
   - Menangani response 401 Unauthorized secara global (auto-logout & event `auth_unauthorized`).
2. **Toast System (`src/context/ToastContext.jsx`)**:
   - Sistem notifikasi floating toast non-intrusive di pojok kanan atas.
   - Tipe notifikasi: `success` (hijau), `error` (merah), `warning` (kuning), `info` (biru).
   - Durasi otomatis 4 detik dengan animasi slide-in/slide-out dan tombol dismiss manual.
3. **Auth Context (`src/context/AuthContext.jsx`)**:
   - Menyimpan state `user`, `token`, dan fungsi `login`, `register`, `logout`.
   - **Pesan Duplikat Akun**: Menangkap respon error email duplikat dari API dan mengeluarkan notifikasi:
     ```javascript
     message = 'account has already register';
     ```
   - Sinkronisasi status user saat aplikasi dibuka pertama kali via endpoint `GET /api/me`.

---

### TAHAP 8: Pembuatan Halaman & Fitur Aplikasi

1. **`Login.jsx` (Halaman Masuk & Registrasi)**:
   - Tab switch animasi antara "Masuk" dan "Daftar Baru".
   - Field tersembunyi Anti-Spam Honeypot (`_hp_check`).
   - Tombol autofill cepat akun demo (`test@example.com`).
2. **`Dashboard.jsx`**:
   - Statistik real-time (Total Barang, Total Kategori, Nilai Aset Inventaris, Stok Menipis).
   - Tabel 5 barang terbaru dengan badge status stok.
   - Tombol ekspor cadangan data JSON.
3. **`Items.jsx` (Manajemen Barang Lengkap)**:
   - Tabel inventaris dengan paginasi/scroll responsif.
   - Form modal tambah & edit barang dengan validasi real-time.
   - Filter dropdown kategori, pencarian teks instan, dan sorting (nama, harga, stok).
   - Generator kode SKU otomatis berdasarkan kategori terpilih.
   - Fitur Ekspor Data ke file CSV.
4. **`Categories.jsx` (Manajemen Kategori)**:
   - Kartu daftar kategori dengan counter jumlah barang di dalamnya.
   - Form modal tambah & edit kategori.
   - Konfirmasi hapus dengan peringatan cascade delete (peringatan bahwa barang di dalam kategori ikut terhapus).
5. **`About.jsx` & `NotFound.jsx`**:
   - Halaman profil aplikasi, penampil Schema JSON-LD aktif, dan halaman 404 interaktif.

---

### TAHAP 9: Optimasi SEO, Semantic Markup, & Anti-Spam

1. **`index.html`**:
   - Title tag deskriptif dan Meta Description yang optimal untuk pencarian.
   - Canonical URL tag (`rel="canonical"`).
   - Meta Tag OpenGraph (Facebook/WhatsApp link preview) & Twitter Card.
   - Tiga Schema JSON-LD terstruktur (`Organization`, `LocalBusiness`, `WebSite`).
2. **File Publik (`/public`)**:
   - `sitemap.xml`: Daftar 5 URL utama aplikasi beserta bobot prioritasnya.
   - `robots.txt`: Petunjuk crawling untuk bot mesin pencari (Googlebot, Bingbot).
   - `favicon.svg`: Icon logo vektor kustom.
3. **Analytics Tracking (`src/utils/analytics.js`)**:
   - Fungsi logging interaksi: `trackFormSubmit`, `trackClickCTA`, `trackClickWA`.

---

### TAHAP 10: Koleksi Pengujian Postman (ID Restriction Verification)

Dibuat file Postman Collection siap pakai:
* **File**: `D:\magang\task\9\Inventaris_API_Postman_Collection.json`

#### Skenario Uji di Postman:
| No | Nama Request | Ekspektasi Hasil |
|---|---|---|
| 1.1 | Login User 1 | Berhasil login, token disimpan ke variable `token_user1`. |
| 1.2 | Login User 2 | Berhasil login, token disimpan ke variable `token_user2`. |
| 1.3 | Register Email Duplikat (`test@example.com`) | 422 Error: *"Email sudah terdaftar. Silakan gunakan email lain..."* |
| 2.1 | User 1 Get Categories | Menampilkan **3 kategori** milik User 1. |
| 2.2 | User 2 Get Categories | Menampilkan **1 kategori** milik User 2 saja (terisolasi). |
| 2.5 | User 2 Akses Kategori ID 1 (Milik User 1) | **404 Blocked**: *"Kategori tidak ditemukan atau Anda tidak memiliki akses ke data ini."* |
| 2.7 | User 2 Coba Update Barang ID 1 (Milik User 1) | **403 Forbidden**: *"Barang tidak ditemukan atau Anda tidak diizinkan mengubah data milik pengguna lain."* |
| 2.8 | User 2 Coba Hapus Barang ID 1 (Milik User 1) | **403 Forbidden**: *"Barang tidak ditemukan atau Anda tidak diizinkan menghapus data milik pengguna lain."* |

---

### TAHAP 11: Skrip Cadangan (Backup Otomatis)

Dibuat skrip otomatisasi untuk mem-backup database dan source code ke direktori arsip:
* **File**: `D:\magang\task\9\backup-db.ps1`
* **Cara Eksekusi**:
  ```bash
  cd D:\magang\task\9\inventaris-client
  npm run backup
  ```
* **Hasil**:
  - `D:\magang\task\9\backups\inventaris_db_YYYYMMDD_HHmmss.json` (Snapshot data)
  - `D:\magang\task\9\backups\inventaris_client_src_YYYYMMDD_HHmmss.zip` (Arsip kode)

---

## 📍 PETA LOKASI KUSTOMISASI KODE (MESSAGE LOCATIONS)

Bila Anda ingin mengganti teks notifikasi atau pesan di kemudian hari, cari tanda **`📝 CUSTOM MESSAGE:`** pada file-file berikut:

| Komponen / Fitur | Lokasi File | Keterangan |
|---|---|---|
| **Pesan Email Duplikat** | `inventaris-api/app/Http/Requests/RegisterRequest.php` | Pesan validasi email unik di Laravel |
| **Toast Email Duplikat** | `inventaris-client/src/context/AuthContext.jsx` (baris 127) | Pesan `"account has already register"` di React |
| **Pesan Login & Logout** | `inventaris-api/app/Http/Controllers/Api/AuthController.php` | Respon sukses/gagal autentikasi |
| **Proteksi Kategori** | `inventaris-api/app/Http/Controllers/Api/CategoryController.php` | Respon CRUD & penolakan akses kategori |
| **Proteksi Barang** | `inventaris-api/app/Http/Controllers/Api/ItemController.php` | Respon CRUD & larangan aksi barang orang lain |
| **Validasi Form Input** | `inventaris-api/app/Http/Requests/CategoryRequest.php` & `ItemRequest.php` | Pesan error validasi kolom input |
| **Toast Notifikasi Barang** | `inventaris-client/src/pages/Items.jsx` | Toast sukses tambah/edit/hapus barang di browser |
| **Toast Notifikasi Kategori** | `inventaris-client/src/pages/Categories.jsx` | Toast sukses tambah/edit/hapus kategori di browser |

---

## 📌 CARA MENJALANKAN SISTEM SECARA LENGKAP

1. **Menjalankan Backend (Laravel API)**:
   ```bash
   cd D:\magang\task\8\inventaris-api
   php artisan serve --port=8000
   ```
   *Endpoint Base*: `http://127.0.0.1:8000/api`

2. **Menjalankan Frontend (React SPA)**:
   ```bash
   cd D:\magang\task\9\inventaris-client
   npm run dev
   ```
   *URL Aplikasi*: `http://127.0.0.1:5173`

3. **Akun Bawaan untuk Uji Coba**:
   - **Akun 1**: Email `test@example.com` | Password: `password`
   - **Akun 2**: Email `user2@example.com` | Password: `password`
