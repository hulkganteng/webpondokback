// routes/articles.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET semua artikel
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM articles');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET artikel berdasarkan id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ error: 'Article not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// CREATE artikel
router.post('/', async (req, res) => {
  try {
    const { title, content, date, image } = req.body;
    const [result] = await pool.query(
      'INSERT INTO articles (title, content, date, image) VALUES (?, ?, ?, ?)',
      [title, content, date, image]
    );
    res.status(201).json({ id: result.insertId, title, content, date, image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// UPDATE artikel berdasarkan id
router.put('/:id', async (req, res) => {
  try {
    const { title, content, date, image } = req.body;
    const [result] = await pool.query(
      'UPDATE articles SET title = ?, content = ?, date = ?, image = ? WHERE id = ?',
      [title, content, date, image, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Article not found' });
    res.json({ id: req.params.id, title, content, date, image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE artikel berdasarkan id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
