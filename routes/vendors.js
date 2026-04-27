const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  register,
  login,
  getVendor,
  getMyListings,
} = require('../controllers/vendorController');

router.post('/register',       register);
router.post('/login',          login);
router.get ('/me/listings', auth, getMyListings); // ← "me" not ":id"
router.get ('/:id',         auth, getVendor);

module.exports = router;