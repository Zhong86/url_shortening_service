const express = require('express'); 
const router = express.Router(); 
const pool = require('../config/database');

router.get('/shorten/:shortUrl', getUrl, async (req, res) => {
  try {
    res.status(200).json({ url: req.urlData.url }); 
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
}); 

router.get('/shorten/:shortUrl/stats', getUrl, async (req, res) => {
  try {
    res.status(200).json(req.urlData); 
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
});

router.post('/shorten', async (req, res) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO urlshortener (url, shortCode, createdAt, updatedAt) VALUES (?,?,NOW(),NOW())', 
      [req.body.url, 'tmp'] 
    );

    const shortUrl = encodeBase62(result.insertId); 

    await pool.query(
      'UPDATE urlshortener SET shortCode = ? WHERE id = ?', 
      [shortUrl, result.insertId]
    ); 

    res.status(201).json({ shortUrl: shortUrl }); 
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
}); 

router.put('/shorten/:shortUrl', getUrl, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE urlshortener SET url = ?, updatedAt = NOW() WHERE shortCode = ?', 
      [req.urlData.url, req.params.shortUrl]
    ); 

    const [rows] = await pool.query(
      'SELECT * FROM urlshortener WHERE shortCode = ?', 
      [req.params.shortUrl]
    ); 

    res.status(200).json(rows[0]); 
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
}); 

router.delete('/shorten/:shortUrl', getUrl, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM urlshortener WHERE shortCode = ?', 
      [req.params.shortUrl]
    ); 

    res.sendStatus(204); 
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
}); 

async function getUrl(req, res, next) {
  let rows; 
  try {
    const [rows] = await pool.query(
      'SELECT * FROM urlshortener WHERE shortCode = ?', 
      [req.params.shortUrl]
    ); 

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Short URL not found' }); 
    }  

    req.urlData = rows[0]; 
    next(); 
  } catch (error) {
    return res.status(500).json({ message: error.message }); 
  }
}

function encodeBase62(num) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = ''; 

  while (num > 0) {
    result = chars[num % 62] + result; 
    num = Math.floor(num / 62); 
  }
  return result || '0'; 
}

module.exports = router; 
