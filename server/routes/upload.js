// routes/upload.js
const express = require('express');
const router = express.Router();
const upload = require('../utils/fileUpload');
const { protect } = require('../middleware/auth');

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file',
    });
  }

  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});

module.exports = router;