// routes/amazonRoutes.js
const express = require('express');
const router = express.Router();
const startOutboundCall = require('../services/amazon/startOutboundCall');

router.post('/call', async (req, res) => {
  const { phoneNumber, attributes } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const result = await startOutboundCall(phoneNumber, attributes);
    res.status(200).json({ message: 'Call initiated', result });
  } catch (error) {
    res.status(500).json({ error: 'Call failed', details: error.message });
  }
});

module.exports = router;
