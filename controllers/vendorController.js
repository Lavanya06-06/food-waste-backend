const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// POST /api/vendors/register
exports.register = async (req, res) => {
  const { name, email, password, address, lat, lng } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT id FROM vendors WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO vendors (name, email, password, address, location)
       VALUES (?, ?, ?, ?, ST_GeomFromText(?, 4326))`,
      [name, email, hashed, address, `POINT(${lat} ${lng})`]
    );

    res.status(201).json({
      message  : 'Vendor registered successfully!',
      vendorId : result.insertId
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// POST /api/vendors/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM vendors WHERE email = ?', [email]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const vendor = rows[0];

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: vendor.id, email: vendor.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message : 'Login successful!',
      token,
      vendor  : {
        id     : vendor.id,
        name   : vendor.name,
        email  : vendor.email,
        address: vendor.address
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/vendors/:id  (protected)
exports.getVendor = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, address,
              ST_X(location) AS lat,
              ST_Y(location) AS lng
       FROM vendors WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('GetVendor error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// GET /api/vendors/me/listings  (protected)
exports.getMyListings = async (req, res) => {
  const vendor_id = req.vendor.id;

  try {
    const [listings] = await db.query(
      `SELECT id, title, description, image_url,
              original_price, discounted_price,
              expiry_time, food_type, status, created_at
       FROM food_items
       WHERE vendor_id = ?
       ORDER BY created_at DESC`,
      [vendor_id]
    );

    const total     = listings.length;
    const available = listings.filter(i => i.status === 'available').length;
    const claimed   = listings.filter(i => i.status === 'claimed').length;
    const expired   = listings.filter(i => i.status === 'expired').length;

    res.json({
      stats: { total, available, claimed, expired },
      listings
    });

  } catch (err) {
    console.error('GetMyListings error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};