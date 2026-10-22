const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const API_KEY = 'b2c9429364dd0786969a8ddb';

app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Explicit route for the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint
app.get('/api/rates/:base', async (req, res) => {
  const baseCurrency = req.params.base.toUpperCase();
  const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.result === 'success') {
      res.json({
        success: true,
        base: data.base_code,
        rates: data.conversion_rates
      });
    } else {
      res.status(400).json({ success: false, error: data['error-type'] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch exchange rates.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});