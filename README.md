# Subscriber Usage API

A complete backend service for recording and retrieving subscriber usage data, with automated CSV snapshots, SQL queries, and bug analysis.

---

## 📁 Project Structure

```
subscriber-usage-api/
├── src/
│   ├── app.js                        # Express server (Q1)
│   ├── routes/
│   │   └── usage.js                  # API endpoints
│   ├── models/
│   │   └── usageStore.js             # In-memory data store
│   ├── middleware/
│   │   └── validator.js              # Request validation
│   ├── cron/
│   │   └── snapshotCron.js           # Cron job scheduler (Q2)
│   └── scripts/
│       ├── cleanupSnapshots.js       # CSV cleanup script (Q2)
│       └── seedData.js               # Sample data seeder
├── public/
│   └── index.html                    # Frontend dashboard (bonus)
├── sql/
│   └── queries.sql                   # SQL queries (Q3)
├── docs/
│   └── Q4_bugfix.md                  # Bug analysis (Q4)
├── snapshots/                        # CSV output directory
├── package.json
├── .gitignore
└── README.md
```

1. Langkah 1 Persiapan & Install Node.js
Node.js (Versi 18 ke atas) & npm
Untuk mengecek apakah sudah terinstall
node -v
npm -v Jika belum ada, unduh installer resmi di: https://nodejs.org

2. Langkah-Langkah Instalasi & Running Server
Langkah A: Download / Clone & Masuk ke Folder Project
Buka Terminal / PowerShell / Command Prompt, lalu masuk ke folder project:
cd subscriber-usage-api (atau sesuaikan dengan nama folder tempat Anda menyimpan project ini)
Langkah B: Install Dependencies
Jalankan perintah ini untuk menginstall semua modul pendukung (express, node-cron, uuid, axios): npm install
Langkah C: Jalankan Backend Server (Q1)
Jalankan perintah utama berikut: npm start
Jika berhasil, terminal akan menampilkan output:
🚀 Subscriber Usage API running on http://localhost:3000
📡 API Endpoint: http://localhost:3000/api/usage
🌐 Frontend:    http://localhost:3000
 

## License

ISC
