// routes/news.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const upload = require('../upload'); // Konfigurasi Multer

// GET semua berita
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET berita berdasarkan id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'News not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// CREATE berita dengan upload gambar
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, content, date } = req.body;
    // Jika file diupload, ambil nama file; jika tidak, set sebagai null
    const image = req.file ? req.file.filename : null;
    const [result] = await pool.query(
      'INSERT INTO news (title, content, date, image) VALUES (?, ?, ?, ?)',
      [title, content, date, image]
    );
    res.status(201).json({ id: result.insertId, title, content, date, image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE berita berdasarkan id dengan opsi update gambar
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content, date } = req.body;
    const image = req.file ? req.file.filename : null;

    let query, params;
    if (image) {
      query = 'UPDATE news SET title = ?, content = ?, date = ?, image = ? WHERE id = ?';
      params = [title, content, date, image, req.params.id];
    } else {
      query = 'UPDATE news SET title = ?, content = ?, date = ? WHERE id = ?';
      params = [title, content, date, req.params.id];
    }

    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'News not found' });
    res.json({ id: req.params.id, title, content, date, image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE berita berdasarkan id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM news WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'News not found' });
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
