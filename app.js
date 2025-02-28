require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');  // Tambahkan ini untuk mengimpor fs
const https = require('https');  // Tambahkan untuk HTTPS
const pool = require('./db');

const app = express();

// Uji koneksi ke database
pool.getConnection()
  .then((conn) => {
    console.log("Database connected successfully.");
    conn.release();
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Middleware untuk mengalihkan HTTP ke HTTPS hanya di lingkungan produksi
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.protocol === 'http') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Pengaturan CORS untuk mengizinkan hanya domain yang aman (HTTPS)
const corsOptions = {
  origin: ['https://ppassyafiiyahbungah.com', 'http://localhost:3000'],  // Menambahkan localhost untuk pengembangan
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

// Import route modules (tanpa otentikasi global)
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const articlesRoutes = require('./routes/articles');
const galleryRoutes = require('./routes/gallery');

// Public routes (tidak dilindungi)
app.use('/api/auth', authRoutes);

// Contoh penerapan adminAuth hanya untuk metode selain GET
const adminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
  
  const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
  if (!token)
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  
  jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_key", (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
    req.user = user;
    next();
  });
};

// Untuk rute news, articles, gallery: jika metode GET, langsung next; jika tidak, terapkan adminAuth.
app.use("/api/news", (req, res, next) => {
  if (req.method === "GET") next();
  else adminAuth(req, res, next);
}, newsRoutes);

app.use("/api/articles", (req, res, next) => {
  if (req.method === "GET") next();
  else adminAuth(req, res, next);
}, articlesRoutes);

app.use("/api/gallery", (req, res, next) => {
  if (req.method === "GET") next();
  else adminAuth(req, res, next);
}, galleryRoutes);

// HTTPS Setup (Jika menggunakan HTTPS)
const options = {
  cert: fs.readFileSync('/etc/letsencrypt/live/ppassyafiiyahbungah.com/fullchain.pem'),  // Sesuaikan dengan jalur yang benar
  key: fs.readFileSync('/etc/letsencrypt/live/ppassyafiiyahbungah.com/privkey.pem')  // Sesuaikan dengan jalur yang benar
};

https.createServer(options, app).listen(3002, () => {
  console.log('Server is running on https://localhost:3002');
});

// Set Port dan Jalankan Server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
