const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage Engine to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'insured_portal_claims', // The folder in cloudinary where images are stored
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // restrict file types
    // transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // optionally resize
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
