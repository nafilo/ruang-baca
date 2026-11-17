# Ruang Baca

Ruang Baca adalah aplikasi perpustakaan pribadi untuk Responsi Modul 5 Praktikum Pengembangan dan Pemrograman Berbasis Platform. Proyek menggunakan React, Vite, Axios, dan vite-plugin-pwa. Supabase menyediakan autentikasi dan Data API untuk koleksi buku.

## Fitur

- Tiga halaman SPA: Beranda, Koleksi Buku, dan Profil.
- CRUD koleksi buku melalui Supabase: tambah, lihat, edit, dan hapus.
- Pencarian judul, penulis, dan genre, serta filter genre.
- PWA yang dapat dipasang. Setelah sekali dibuka secara online, halaman dan navigasi tetap terbuka saat offline. Untuk memuat atau mengubah buku, aplikasi perlu terhubung ke Supabase.
- Tampilan responsif untuk desktop dan perangkat seluler.

## Siapkan Supabase

1. Di proyek Supabase pilihanmu, buka **SQL Editor → New query** dan jalankan isi `supabase/schema.sql` sekali. Skema membuat tabel `public.ruang_baca_books` dengan Row Level Security per pemilik.
2. Di pengaturan **Authentication**, aktifkan **Anonymous Sign-Ins**. Pengunjung memperoleh koleksi pribadi di browser yang dipakai tanpa perlu mengisi formulir login.
3. Salin **Project URL** dan **Publishable key**. Isikan nilainya ke `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`. Untuk uji lokal, pakai `.env.local` dengan format dari `.env.example`. Untuk deploy, tambahkan kedua variabel di Vercel sebelum build. Gunakan key dengan awalan `sb_publishable_`.

Sesi anonim tersimpan di browser agar koleksi tetap bisa dibuka setelah refresh. Browser lain atau penghapusan data situs akan menghasilkan sesi baru dengan koleksi sendiri.

## Menjalankan secara lokal

Gunakan Node.js 22.12+ dan jalankan perintah ini dari folder proyek.

```sh
npm ci
npm run dev
```

## Build dan uji PWA

```sh
npm run build
npm run preview
```

Buka alamat preview melalui localhost untuk menguji pemasangan aplikasi. Setelah service worker aktif, pilih **Offline** di tab **Application → Service Workers** pada DevTools, lalu refresh biasa. Buka Beranda, Koleksi Buku, dan Profil. Di halaman Koleksi Buku akan muncul petunjuk untuk menyambung kembali. Matikan **Offline** dan pastikan koleksi dimuat lagi.

## Deploy ke Vercel melalui GitHub

### 1. Siapkan GitHub

1. Masuk ke [GitHub](https://github.com/) atau buat akun jika belum punya.
2. Buat repository baru dengan nama `ruang-baca-arkan`.
3. Pilih **Private** atau **Public** sesuai preferensi.
4. Buat repository kosong. Proyek sudah memiliki README dan `.gitignore`.

### 2. Unggah proyek dari PowerShell

Buka PowerShell, lalu jalankan perintah berikut satu per satu:

```powershell
Set-Location 'D:\Responsi Mod 5 PPB\responsi-arkan'
npm ci
npm run build
git init
git status --short
git check-ignore -v .env
```

Perintah terakhir menunjukkan aturan `.gitignore` untuk `.env`. Simpan konfigurasi lokal di `.env.local` dan masukkan nilai untuk produksi lewat pengaturan Vercel.

Lalu tambahkan dan periksa file yang akan diunggah:

```powershell
git add .
git status --short
```

Pastikan `.env` tidak muncul sebagai file staged. Setelah itu:

```powershell
git commit -m "Build Ruang Baca PWA"
git branch -M main
git remote add origin https://github.com/USERNAME/ruang-baca-arkan.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub-mu. Jika Git belum dikonfigurasi, atur nama dan email dengan `git config --global user.name "Nama Kamu"` dan `git config --global user.email "email-github-kamu"`, lalu ulangi commit. Saat diminta login, selesaikan autentikasi GitHub di browser.

### 3. Deploy repository di Vercel

1. Buka [vercel.com/new](https://vercel.com/new) dan masuk menggunakan GitHub.
2. Pilih **Add New → Project**, lalu beri izin akses ke repository `ruang-baca-arkan` jika diminta.
3. Klik **Import** pada repository tersebut.
4. Pastikan **Root Directory** adalah `./` (root repository). Jika repository mencakup folder induk, pilih `responsi-arkan` sebagai root.
5. Pastikan pengaturan build berikut:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: biarkan otomatis; Vercel akan mendeteksi lockfile npm.
6. Tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` di **Environment Variables**.
7. Klik **Deploy** dan tunggu sampai Vercel menyatakan deployment berhasil. Buka domain `.vercel.app` yang ditampilkan.

### 4. Periksa deployment dan kumpulkan

1. Buka domain Vercel di browser dan cek halaman **Beranda**, **Koleksi Buku**, dan **Profil**.
2. Tambah buku, refresh halaman, lalu pastikan perubahan masih tersimpan. Coba edit dan hapus buku juga.
3. Setelah situs dibuka secara online, gunakan menu instalasi browser atau **Tambahkan ke layar utama**.
4. Buka situs saat online dan pastikan service worker aktif. Centang **Offline** di **Application → Service Workers**, lalu refresh dan cek ketiga halaman. Matikan simulasi offline untuk mengecek koleksi tampil kembali.
5. Salin URL publik `https://...vercel.app` ke [formulir pengumpulan responsi](https://docs.google.com/forms/d/e/1FAIpQLSewTNZPTPadOB8WvdmpVuOxWdu70TzBhoL5r2_5GEa4OgcOXg/viewform?usp=header).

Jika kamu mengubah kode setelah deploy, simpan dan kirim perubahannya dengan `git add .`, `git commit -m "Perbarui Ruang Baca"`, lalu `git push`. Vercel akan menjalankan deployment baru secara otomatis.

## Identitas

- Nama: Arkan Nafi Nurcahyo
- NIM: 21120124140160
- Kelompok: 33
- Shift: 5
