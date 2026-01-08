const express = require('express'); 
const port = 8000; 
const api = '/api'; 

const app = express(); 
app.use(express.json()); 

const shortUrlRoute = require('./routes/shortUrlRoute'); 
app.use(api, shortUrlRoute); 

const router = express.Router(); 
const pool = require('./config/database');
router.get('/:shortUrl', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM urlshortener WHERE shortCode = ?', 
      [req.params.shortUrl]
    ); 

    if (!rows[0]) {
      return res.status(404).json({ message: 'Short URL not found' });
    }
    
    await pool.query(
      'UPDATE urlshortener SET accessCount = accessCount + 1 WHERE shortCode = ?', 
      [req.params.shortUrl]
    ); 

    res.redirect(rows[0].url); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); 
app.use(router); 

app.listen(port, () => {
  console.log('Connected on port: ' + port); 
}); 
