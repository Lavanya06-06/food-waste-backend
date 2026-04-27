const cloudinary              = require('cloudinary').v2;
const { CloudinaryStorage }   = require('multer-storage-cloudinary');
const multer                  = require('multer');
const dotenv                  = require('dotenv');

dotenv.config();

// Connect to Cloudinary
cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
});

// Set up storage — files go to "food-waste" folder in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder        : 'food-waste',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation : [{ width: 800, height: 600, crop: 'limit' }],
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = upload;