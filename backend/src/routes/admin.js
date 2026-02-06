const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/test', auth, (req, res) => {
  res.json({
    message: 'Autorizovan pristup',
    user: req.user
  });
});

module.exports = router;