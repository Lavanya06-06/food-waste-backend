const db = require('../config/db');

// GET /api/food-items?lat=12.9716&lng=77.5946
exports.getFoodItems = async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'lat and lng query params are required.' });
  }

  try {
    
   const [rows] = await db.query(
  `SELECT 
    f.id,
    f.title,
    f.description,
    f.image_url,
    f.original_price,
    f.discounted_price,
    f.expiry_time,
    f.food_type,
    f.status,
    f.created_at,
    v.name    AS vendor_name,
    v.address AS vendor_address,
    ROUND(
      ST_Distance_Sphere(
        v.location,
        ST_GeomFromText(?, 4326)
      ) / 1000, 2
    ) AS distance_km
  FROM food_items f
  JOIN vendors v ON f.vendor_id = v.id
  WHERE f.status = 'available'
    AND f.expiry_time > NOW()
    AND ST_Distance_Sphere(
          v.location,
          ST_GeomFromText(?, 4326)
        ) <= 5000
  ORDER BY distance_km ASC`,
  [`POINT(${lat} ${lng})`, `POINT(${lat} ${lng})`]
);

    res.json({
      count : rows.length,
      data  : rows
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// POST /api/food-items  (protected)
exports.createFoodItem = async (req, res) => {
  console.log('Body received:', req.body); // ← add this line
  const {
    title,
    description,
    image_url,
    original_price,
    discounted_price,
    expiry_time,
    food_type
  } = req.body;

  const vendor_id = req.vendor.id;

  if (!title || !original_price || !discounted_price || !expiry_time || !food_type) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO food_items 
        (vendor_id, title, description, image_url, original_price, discounted_price, expiry_time, food_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [vendor_id, title, description, image_url, original_price, discounted_price, expiry_time, food_type]
    );

    res.status(201).json({
      message    : 'Food item listed successfully!',
      foodItemId : result.insertId
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH /api/food-items/:id/status  (protected)
exports.updateStatus = async (req, res) => {
  const { status }  = req.body;
  const { id }      = req.params;
  const vendor_id   = req.vendor.id;

  const validStatuses = ['available', 'claimed', 'expired'];
  if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({
      message: 'Invalid status. Must be available, claimed or expired.'
    });
  }

  try {
    const [rows] = await db.query(
      'SELECT id FROM food_items WHERE id = ? AND vendor_id = ?',
      [id, vendor_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Food item not found or you do not own this listing.'
      });
    }

    await db.query(
      'UPDATE food_items SET status = ? WHERE id = ?',
      [status.toLowerCase(), id]
    );

    res.json({ message: `Status updated to ${status} successfully!` });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// PATCH /api/food-items/:id/claim  (PUBLIC - no auth needed)
exports.claimFood = async (req, res) => {
  const { id } = req.params;

  try {
    // Check item exists and is still available
    const [rows] = await db.query(
      'SELECT id, status FROM food_items WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Food item not found.' });
    }

    if (rows[0].status !== 'available') {
      return res.status(400).json({
        message: 'Sorry! This item has already been claimed or expired.'
      });
    }

    // Mark as claimed
    await db.query(
      'UPDATE food_items SET status = ? WHERE id = ?',
      ['claimed', id]
    );

    res.json({ message: 'Food item claimed successfully!' });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};