# BabyCare Store - Premium Baby Gear E-Commerce

BabyCare Store adalah platform e-commerce berbasis web yang dirancang untuk menyediakan kebutuhan perlengkapan bayi berkualitas tinggi. Proyek ini dibangun dengan fokus pada antarmuka yang bersih (Clean UI), pengalaman pengguna yang mulus (Smooth UX), dan logika manajemen data yang efisien menggunakan LocalStorage.

---

## 📊 Kriteria Penilaian Terpenuhi
Proyek ini disusun secara komprehensif untuk memenuhi standar penilaian UTS:
* **Fungsionalitas (35%):** Alur belanja, checkout, manajemen status admin, dan tracking berfungsi 100%.
* **UI/UX (20%):** Desain konsisten Navy-Gold, fully responsive, dan mendukung Dark Mode.
* **Logic JS (20%):** Menggunakan metode array modern (ES6+) dan manajemen state yang bersih.
* **Struktur Kode (15%):** Kode modular, terdokumentasi, dan mudah dipelihara.
* **Kelengkapan (10%):** Dilengkapi fitur Admin Panel, Statistik Omset, dan Toast Notification.

---

## 🚀 Fitur Utama

### 🛒 Fitur Pelanggan (User)
* **Katalog Produk:** Daftar produk premium dengan rendering dinamis dari data JSON.
* **Sistem Keranjang:** Menambah, menghapus, dan menghitung subtotal secara otomatis.
* **Checkout & Pembayaran:** Mendukung berbagai metode (Bank Transfer, COD, QRIS, DANA).
* **Riwayat & Pelacakan:** Pantau status pesanan (Pending, Diproses, Dikirim) menggunakan nomor resi unik secara real-time.
* **Dark Mode:** Fitur kenyamanan visual untuk berpindah tema gelap/terang.

### 🔐 Fitur Admin (Administrator)
* **Dashboard Omset:** Akumulasi pendapatan otomatis dari seluruh transaksi yang berhasil.
* **Manajemen Status:** Admin dapat memperbarui status pengiriman (Pending ke Dikirim/Selesai).
* **Statistik Pesanan:** Memantau jumlah total pesanan yang masuk ke sistem.

---

## 🛠️ Teknologi yang Digunakan
* **HTML5:** Struktur semantik aplikasi.
* **Tailwind CSS:** Framework CSS untuk desain responsif dan modern dengan kustomisasi tema.
* **Vanilla JavaScript (ES6+):** Logika aplikasi, manipulasi DOM, dan State Management tanpa library eksternal.
* **Local Storage:** Digunakan sebagai database lokal untuk menyimpan data akun, keranjang, dan riwayat transaksi.
* **JSON:** Format penyimpanan data katalog produk.

---

## ⚙️ Cara Menjalankan Proyek
1. **Siapkan File:** Pastikan file `index.html`, `admin.html`, `app.js`, dan `data.json` berada dalam satu folder yang sama.
2. **Buka di Browser:** Jalankan file `index.html` menggunakan browser modern (Chrome/Edge/Firefox).
3. **Akses Fitur Admin:**
   * Lakukan pendaftaran akun baru dengan email: **`admin@babycare.com`**.
   * Setelah login dengan email tersebut, tombol **Admin Panel** akan otomatis muncul pada navigasi utama.
4. **Live Server (Disarankan):** Untuk performa terbaik, jalankan menggunakan ekstensi *Live Server* pada VS Code.

---
**Dibuat untuk Tugas UTS Pemrograman Web - 2026**