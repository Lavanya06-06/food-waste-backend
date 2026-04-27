const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const upload  = require('../config/cloudinary');

// POST /api/upload  (protected)
router.post('/', auth, upload.single('image'), (req, res) => {
    
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    res.status(201).json({
      message  : 'Image uploaded successfully!',
      image_url: req.file.path,   // Cloudinary URL — save this in food_items
    });

  } catch (err) {
    res.status(500).json({ message: 'Upload failed.', error: err.message });
  }
});

module.exports = router;