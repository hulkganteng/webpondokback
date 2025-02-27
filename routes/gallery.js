// routes/gallery.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const upload = require('../upload'); // Import konfigurasi Multer

// GET semua item galeri
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET item galeri berdasarkan id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ error: 'Gallery item not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// CREATE item galeri dengan upload gambar
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, caption } = req.body;
    const image = req.file ? req.file.filename : null;
    const [result] = await pool.query(
      'INSERT INTO gallery (title, image, caption) VALUES (?, ?, ?)',
      [title, image, caption]
    );
    res.status(201).json({ id: result.insertId, title, image, caption });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE item galeri berdasarkan id dengan opsi upload gambar baru
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, caption } = req.body;
    const image = req.file ? req.file.filename : null;
    
    let query, params;
    if (image) {
      query = 'UPDATE gallery SET title = ?, image = ?, caption = ? WHERE id = ?';
      params = [title, image, caption, req.params.id];
    } else {
      query = 'UPDATE gallery SET title = ?, caption = ? WHERE id = ?';
      params = [title, caption, req.params.id];
    }
    
    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Gallery item not found' });
    res.json({ id: req.params.id, title, image, caption });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE item galeri berdasarkan id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Gallery item not found' });
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
