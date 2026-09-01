const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { cloudinary, hasCloudinary } = require('../config/cloudinary');
const { uploadDir } = require('../middleware/upload');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    // 1. If Cloudinary is configured, attempt upload to Cloudinary
    if (hasCloudinary) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'diwan_al_attour/products',
              resource_type: 'auto'
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        return res.json({
          success: true,
          imageUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          message: 'Uploaded to Cloudinary successfully'
        });
      } catch (cloudErr) {
        console.warn('⚠ Cloudinary upload warning:', cloudErr.message, '- Falling back to local disk storage');
      }
    }

    // 2. Fallback: Save to local directory assets/products/uploaded/
    const filename = `uploaded-${Date.now()}-${uuidv4().substring(0, 6)}${path.extname(req.file.originalname) || '.jpg'}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);
    const relativeUrl = `assets/products/uploaded/${filename}`;

    res.json({
      success: true,
      imageUrl: relativeUrl,
      message: 'Image uploaded and stored in assets/products/uploaded/'
    });
  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ success: false, message: 'Failed to process image upload', error: err.message });
  }
};
