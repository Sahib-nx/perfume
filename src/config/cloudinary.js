const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dpbnn1ec';
const apiKey = process.env.CLOUDINARY_API_KEY || '125326199743724';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'mZTqCcDyELZPscbA2v1VLRVTPnw';

const hasCloudinary = Boolean(
  cloudName &&
  apiKey &&
  apiSecret &&
  cloudName !== 'demo'
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log('✓ Cloudinary initialized successfully for cloud:', cloudName);
} else {
  console.log('ℹ Cloudinary credentials not provided or in demo mode. Local upload & direct URL mode active.');
}

module.exports = {
  cloudinary,
  hasCloudinary
};
