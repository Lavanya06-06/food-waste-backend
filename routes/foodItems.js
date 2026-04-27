const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  getFoodItems,
  createFoodItem,
  updateStatus,
  claimFood 
} = require('../controllers/foodController');

router.get ('/',                    getFoodItems);         // Public
router.post('/',              auth, createFoodItem);       // 🔒 Vendor only
router.patch('/:id/status',   auth, updateStatus);         // 🔒 Vendor only
router.patch('/:id/claim',          claimFood);

module.exports = router;