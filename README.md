
# MAGNET - Internship and Electronic Monitoring Integrated System

MAGNET is a modern web-based internship management application for organizations, with comprehensive features for administrators, mentors, and internship participants. Available in Indonesian and English.
<br> (Gulir kebawah untuk **Readme dalam Bahasa Indonesia🆔**) 

## 🚀 Main Features

### 👥 Multi-Role Management
- **Administrator**: Complete system management, quota, and settings
- **Mentor**: Intern monitoring and assessment
- **Intern**: Attendance, leave requests, and progress tracking

### 📊 Dashboard & Monitoring
- Real-time statistics dashboard for all roles
- Attendance and activity monitoring for participants
- Internship period tracking with interactive calendar
- Complete attendance and leave history with detailed information

### 🏢 Division & Placement Management
- Participant placement in divisions/teams
- Edit internship data and participant status
- Mentor-intern relationship management
- Quota management per division

### 📍 Attendance & Location System
- Geofencing for attendance location validation
- Attendance location monitoring with maps
- Flexible attendance radius settings
- Real-time location validation

### 📋 Assessment & Evaluation
- Structured internship assessment system
- Periodic assessments for participants
- Progress and development tracking
- Automatic assessment reports

### 📜 Certificates & Documentation
- Automatic internship certificate generation
- Certificate upload and preview
- Certificate download in various formats
- Customizable certificate templates

### 🔐 Security & Authentication
- Secure Firebase authentication
- Role-based access protection
- Token and session management validation
- Sensitive data encryption

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14, React 18 |
| **Styling** | Tailwind CSS, CSS Modules |
| **Authentication** | Firebase Auth |
| **Database** | MongoDB |
| **State Management** | React Context API |
| **Maps & Location** | Leaflet.js |
| **File Upload** | Multer, Firebase Storage |
| **PDF Generation** | jsPDF, html2canvas |
| **Deployment** | Vercel |

## 📦 Project Structure

```
Intern-Management-Web/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── absen/            # Attendance pages
│   ├── sertifikat/       # Certificate pages
│   └── ...
├── components/            # Reusable React components
│   ├── ui/               # UI components
│   └── ...
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── models/               # MongoDB schema models
├── public/               # Static assets
│   ├── assets/           # Images and media
│   └── uploads/          # Uploaded files
└── utils/                # Helper functions
```

## ⚡ Installation & Setup

### Prerequisites
- Node.js 22+ (Or latest LTS version is more likely)
- MongoDB database
- Firebase project
- Leaflet.js

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/Intern-Management-Web.git
cd Intern-Management-Web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create `.env` file with the following configuration:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Firebase Configuration
GOOGLE_CREDENTIALS=your_firebase_service_account_json
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Leaflet.js Configuration (Optional)
NEXT_PUBLIC_LEAFLET_TILE_LAYER=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Application Settings
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Setup Database
```bash
# Ensure MongoDB is running
# Database will be created automatically on first access
```

### 5. Run Application
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### 6. Access Application
Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Additional Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication with Email/Password
3. Setup Firestore Database
4. Download service account key
5. Setup Firebase Storage for file uploads

### MongoDB Setup
1. Create MongoDB Atlas cluster or local setup
2. Create `magnet_db` database
3. Setup user with read/write permissions
4. Update connection string in `.env`

### Leaflet.js Setup
1. Leaflet.js is already included in project dependencies
2. Uses OpenStreetMap as default tile layer
3. No API key required for basic usage
4. For custom tile layers, update `NEXT_PUBLIC_LEAFLET_TILE_LAYER` environment variable

## 📚 Documentation & Support

### API Documentation
- **Authentication**: `/api/auth/*`
- **Intern Management**: `/api/intern/*`
- **Attendance**: `/api/absen/*`
- **Certificates**: `/api/sertifikat/*`
- **Assessment**: `/api/assessment/*`

### Troubleshooting
- **Database Connection**: Check MongoDB URI and network access
- **Firebase Auth**: Ensure service account key is valid
- **File Upload**: Check Firebase Storage permissions
- **Maps Loading**: Ensure Leaflet.js is installed and tile layer is accessible

### Support
- 📧 Email: bps1871.bps.go.id
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/Intern-Management-Web/issues)
- 📖 Documentation: `/docs` (coming soon)

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Development Team

- **BPS Kota Bandar Lampung** - Development Team

## ✉️ Contact Us
- **Email**: [bps1871.bps.go.id](mailto:bps1871.bps.go.id) 
- **Instagram**: [@bpsbandarlampung](https://instagram.com/bpsbandarlampung)

---

---

# MAGNET - Magang dan Monitoring Elektronik Terpadu

MAGNET adalah aplikasi web manajemen magang modern untuk organisasi, dengan fitur lengkap untuk admin, pembimbing, dan peserta magang. Tersedia dalam bahasa Indonesia dan Inggris.

## 🚀 Fitur Utama

### 👥 Manajemen Multi-Role
- **Admin**: Manajemen lengkap sistem, kuota, dan pengaturan
- **Pembimbing**: Monitoring peserta magang dan penilaian
- **Peserta Magang**: Absensi, izin, dan tracking progress

### 📊 Dashboard & Monitoring
- Dashboard statistik real-time untuk semua role
- Monitoring kehadiran dan aktivitas peserta
- Tracking periode magang dengan kalender interaktif
- Histori absensi dan izin dengan detail lengkap

### 🏢 Manajemen Divisi & Penempatan
- Penempatan peserta ke divisi/tim
- Edit data magang dan status peserta
- Relasi pembimbing-peserta magang
- Manajemen kuota per divisi

### 📍 Sistem Absensi & Lokasi
- Geofencing untuk validasi lokasi absensi
- Monitoring lokasi absensi dengan maps
- Pengaturan radius absensi yang fleksibel
- Validasi lokasi real-time

### 📋 Penilaian & Assessment
- Sistem penilaian magang terstruktur
- Assessment berkala untuk peserta
- Tracking progress dan perkembangan
- Laporan penilaian otomatis

### 📜 Sertifikat & Dokumentasi
- Generate sertifikat magang otomatis
- Upload dan preview sertifikat
- Download sertifikat dalam berbagai format
- Template sertifikat yang dapat dikustomisasi

### 🔐 Keamanan & Autentikasi
- Autentikasi Firebase yang aman
- Proteksi akses berdasarkan role
- Validasi token dan session management
- Enkripsi data sensitif

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| **Frontend** | Next.js 14, React 18 |
| **Styling** | Tailwind CSS, CSS Modules |
| **Authentication** | Firebase Auth |
| **Database** | MongoDB |
| **State Management** | React Context API |
| **Maps & Location** | Leaflet.js |
| **File Upload** | Multer, Firebase Storage |
| **PDF Generation** | jsPDF, html2canvas |
| **Deployment** | Vercel |

## 📦 Struktur Project

```
Intern-Management-Web/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── absen/            # Attendance pages
│   ├── sertifikat/       # Certificate pages
│   └── ...
├── components/            # Reusable React components
│   ├── ui/               # UI components
│   └── ...
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── models/               # MongoDB schema models
├── public/               # Static assets
│   ├── assets/           # Images and media
│   └── uploads/          # Uploaded files
└── utils/                # Helper functions
```

## ⚡ Cara Install & Jalankan

### Prerequisites
- Node.js 22+ (Or latest LTS version is more likely)
- MongoDB database
- Firebase project
- Leaflet.js

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/Intern-Management-Web.git
cd Intern-Management-Web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Buat file `.env` dengan konfigurasi berikut:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Firebase Configuration
GOOGLE_CREDENTIALS=your_firebase_service_account_json
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Leaflet.js Configuration (Optional)
NEXT_PUBLIC_LEAFLET_TILE_LAYER=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Application Settings
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Setup Database
```bash
# Pastikan MongoDB sudah running
# Database akan dibuat otomatis saat pertama kali akses
```

### 5. Jalankan Aplikasi
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### 6. Akses Aplikasi
Buka [http://localhost:3000](http://localhost:3000) di browser

## 🔧 Konfigurasi Tambahan

### Firebase Setup
1. Buat project Firebase baru
2. Enable Authentication dengan Email/Password
3. Setup Firestore Database
4. Download service account key
5. Setup Firebase Storage untuk upload file

### MongoDB Setup
1. Buat cluster MongoDB Atlas atau local
2. Buat database `magnet_db`
3. Setup user dengan read/write permissions
4. Update connection string di `.env`

### Leaflet.js Setup
1. Leaflet.js sudah termasuk dalam project dependencies
2. Menggunakan OpenStreetMap sebagai tile layer default
3. Tidak memerlukan API key untuk penggunaan dasar
4. Untuk custom tile layers, update environment variable `NEXT_PUBLIC_LEAFLET_TILE_LAYER`

## 📚 Dokumentasi & Bantuan

### API Documentation
- **Authentication**: `/api/auth/*`
- **Intern Management**: `/api/intern/*`
- **Attendance**: `/api/absen/*`
- **Certificates**: `/api/sertifikat/*`
- **Assessment**: `/api/assessment/*`

### Troubleshooting
- **Database Connection**: Periksa MongoDB URI dan network access
- **Firebase Auth**: Pastikan service account key valid
- **File Upload**: Periksa Firebase Storage permissions
- **Maps Loading**: Pastikan Leaflet.js terinstall dan tile layer dapat diakses

### Support
- 📧 Email: bps1871.bps.go.id
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/Intern-Management-Web/issues)
- 📖 Documentation: `/docs` (coming soon)

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Tim Pengembang

- **BPS Kota Bandar Lampung** - Development Team

## ✉️ Contact Us
- **Email**: [bps1871.bps.go.id](mailto:bps1871.bps.go.id) 
- **Instagram**: [@bpsbandarlampung](https://instagram.com/bpsbandarlampung)

---

© 2025 BPS Kota Bandar Lampung - MAGNET Intern Management System