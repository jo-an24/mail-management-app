const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get all labels for user
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM labels WHERE user_id = $1 ORDER BY name',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

// Create label
router.post('/', authenticateToken, async (req, res) => {
  const { name, color } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO labels (user_id, name, color) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, color]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create label' });
  }
});

// Delete label
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await pool.query('DELETE FROM labels WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Label deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete label' });
  }
});

module.exports = router;
