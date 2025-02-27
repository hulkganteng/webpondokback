require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./db');

// Import route modules (tanpa otentikasi global)
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const articlesRoutes = require('./routes/articles');
const galleryRoutes = require('./routes/gallery');

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

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

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

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
