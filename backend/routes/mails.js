const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get all mails for user
router.get('/', authenticateToken, async (req, res) => {
  const { folder = 'inbox', search = '' } = req.query;
  const userId = req.user.id;

  try {
    let query = 'SELECT * FROM mails WHERE user_id = $1';
    const params = [userId];

    if (folder && folder !== 'all') {
      query += ' AND folder = $2';
      params.push(folder);
    }

    if (search) {
      query += ` AND (subject ILIKE $${params.length + 1} OR body ILIKE $${params.length + 1} OR sender ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch mails' });
  }
});

// Get single mail
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM mails WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mail not found' });
    }

    // Mark as read
    await pool.query('UPDATE mails SET is_read = true WHERE id = $1', [id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch mail' });
  }
});

// Send mail
router.post('/send', authenticateToken, async (req, res) => {
  const { to, subject, body, cc, bcc } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO mails (user_id, sender, recipient, subject, body, folder, is_read) VALUES ($1, (SELECT email FROM users WHERE id = $1), $2, $3, $4, $5, true) RETURNING *',
      [userId, to, subject, body, 'sent']
    );

    res.status(201).json({
      message: 'Mail sent successfully',
      mail: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send mail' });
  }
});

// Save draft
router.post('/draft', authenticateToken, async (req, res) => {
  const { to, subject, body } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO mails (user_id, sender, recipient, subject, body, folder, is_read) VALUES ($1, (SELECT email FROM users WHERE id = $1), $2, $3, $4, $5, true) RETURNING *',
      [userId, to, subject, body, 'drafts']
    );

    res.status(201).json({
      message: 'Draft saved',
      mail: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Delete mail
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await pool.query('DELETE FROM mails WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Mail deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete mail' });
  }
});

// Move to folder
router.patch('/:id/move', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { folder } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'UPDATE mails SET folder = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [folder, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mail not found' });
    }

    res.json({ message: 'Mail moved', mail: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to move mail' });
  }
});

module.exports = router;
