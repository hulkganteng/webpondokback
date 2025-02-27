// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_key";

// Endpoint Login: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Ambil admin berdasarkan email dari database
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const admin = rows[0];
    // Bandingkan password yang dikirim dengan password yang di-hash di database menggunakan bcrypt
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Jika login berhasil, buat token JWT dengan masa berlaku 1 jam
    const token = jwt.sign({ id: admin.id, email: admin.email }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint Register Admin: POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    // Cek apakah admin sudah ada
    const [existing] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Admin with this email already exists' });
    }
    
    // Hash password dengan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Simpan admin baru ke database
    const [result] = await pool.query(
      'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    res.status(201).json({ id: result.insertId, name, email });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
