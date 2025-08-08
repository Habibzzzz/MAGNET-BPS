1. Manajemen Multi-Role (Admin, Pembimbing, Peserta Magang)
Fungsi: Setiap user login dengan role berbeda (admin, mentor, intern) dan mendapatkan akses fitur sesuai peran.
Letak Kode:
Autentikasi & role:
auth (API autentikasi)
context (penyimpanan state user & role)
Dashboard.jsx (dashboard dinamis sesuai role)
Proteksi halaman:
middleware.js (jika ada, untuk proteksi route)
dashboard (halaman dashboard per role)

2. Dashboard & Monitoring
Fungsi: Statistik real-time, monitoring absensi, aktivitas, dan progress peserta.
Letak Kode:
dashboard (halaman dashboard utama)
ui (komponen statistik, grafik, tabel monitoring)
absen (API rekap absensi)
intern (API data peserta)

3. Manajemen Divisi & Penempatan
Fungsi: Admin menempatkan peserta ke divisi/tim, mengatur kuota, dan relasi pembimbing-peserta.
Letak Kode:
app/dashboard/divisi/ (halaman & form manajemen divisi)
models (schema MongoDB: divisi, peserta, pembimbing)
app/api/divisi/ (API divisi, jika ada)
components (form assign division, tabel relasi)

4. Sistem Absensi & Lokasi
Fungsi: Peserta melakukan absensi dengan validasi lokasi (geofencing), monitoring lokasi absensi.
Letak Kode:
absen (halaman absensi peserta)
components/ui/MapAbsensi.jsx (komponen peta, validasi lokasi)
absen (API absensi)
daftarHadirInfo.js (schema absensi)
lib/geofence.js (fungsi validasi radius, jika ada)

5. Penilaian & Assessment
Fungsi: Pembimbing memberikan penilaian berkala, tracking progress peserta.
Letak Kode:
app/dashboard/assessment/ (halaman penilaian)
assessment (API penilaian)
models/assessmentInfo.js (schema penilaian)
components/ui/AssessmentForm.jsx (form penilaian)

6. Sertifikat & Dokumentasi
Fungsi: Generate sertifikat otomatis, upload, preview, dan download sertifikat.
Letak Kode:
sertifikat (halaman sertifikat peserta)
sertifikat (API sertifikat)
components/ui/CertificatePreview.jsx (preview sertifikat)
lib/certificate.js (fungsi generate PDF, jika ada)
uploads (penyimpanan file sertifikat)

7. Keamanan & Autentikasi
Fungsi: Autentikasi Firebase, proteksi akses, validasi token/session.
Letak Kode:
auth (API autentikasi)
AuthContext.js (state autentikasi)
middleware.js (proteksi route, jika ada)
.env (konfigurasi rahasia)

8. File Upload (Laporan, Sertifikat, dll)
Fungsi: Upload file ke Firebase Storage, preview, dan download.
Letak Kode:
components/ui/FileUpload.jsx (komponen upload)
lib/firebase.js (fungsi upload ke Firebase Storage)
uploads (penyimpanan lokal, jika ada)
9. Maps & Geolocation
Fungsi: Validasi lokasi absensi dengan Leaflet.js dan OpenStreetMap.
Letak Kode:
components/ui/MapAbsensi.jsx (komponen peta)
lib/geofence.js (fungsi validasi lokasi)
.env (NEXT_PUBLIC_LEAFLET_TILE_LAYER)

10. Pengaturan Sistem
Fungsi: Admin mengatur radius absensi, kuota magang, pengaturan umum.
Letak Kode:
app/dashboard/settings/ (halaman pengaturan)
app/api/settings/ (API pengaturan)
models/settingsInfo.js (schema pengaturan)
Catatan:

Semua API utama ada di api
Semua halaman Next.js ada di app
Komponen UI reusable di ui
Model/schema database di models