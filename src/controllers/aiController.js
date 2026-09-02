/**
 * AI Features Controller
 * Diwan Al Attour - Image Enhancement, Copywriting & Tagging
 */

const { generatePerfumeDescription, generatePerfumeTags, STYLE_PRESETS } = require('../config/gemini');
const { generateLuxuryEditorialImage, STYLE_RENDERERS } = require('../utils/imageEnhancer');
const { cloudinary, hasCloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

/**
 * Intelligent Style Resolver
 * Supports Mode: 'auto' | 'style' | 'custom'
 */
function resolveEnhancementStyle({ mode = 'auto', style = 'luxury-floral', customSelections = {}, notes = '', title = '', mood = '', category = '', description = '' }) {
  const cleanNotes = (notes || '').toLowerCase();
  const cleanMood = (mood || '').toLowerCase();
  const cleanCategory = (category || '').toLowerCase();
  const cleanDesc = (description || '').toLowerCase();

  // --- MODE 1: AI AUTO ENHANCE (Intelligently maps perfume personality to optimal style) ---
  if (mode === 'auto') {
    if (cleanNotes.includes('rose') || cleanDesc.includes('rose') || cleanMood.includes('romantic')) {
      return { styleKey: 'rose-romance', styleName: 'AI Auto: Rose Romance' };
    }
    if (cleanNotes.includes('jasmine') || cleanNotes.includes('lily') || cleanNotes.includes('floral') || cleanNotes.includes('white flower') || cleanNotes.includes('gardenia')) {
      return { styleKey: 'luxury-floral', styleName: 'AI Auto: Luxury Floral' };
    }
    if (cleanNotes.includes('oud') || cleanNotes.includes('agarwood') || cleanNotes.includes('incense') || cleanNotes.includes('smoke') || cleanNotes.includes('leather')) {
      return { styleKey: 'dark-oud', styleName: 'AI Auto: Dark Oud' };
    }
    if (cleanNotes.includes('amber') || cleanNotes.includes('vanilla') || cleanNotes.includes('tonka') || cleanNotes.includes('cinnamon')) {
      return { styleKey: 'warm-amber', styleName: 'AI Auto: Warm Amber' };
    }
    if (cleanNotes.includes('citrus') || cleanNotes.includes('bergamot') || cleanNotes.includes('lemon') || cleanNotes.includes('green') || cleanNotes.includes('leaf')) {
      return { styleKey: 'fresh-botanical', styleName: 'AI Auto: Fresh Botanical' };
    }
    if (cleanNotes.includes('aquatic') || cleanNotes.includes('marine') || cleanNotes.includes('water') || cleanNotes.includes('ocean') || cleanNotes.includes('fresh')) {
      return { styleKey: 'fresh-clean', styleName: 'AI Auto: Fresh & Clean' };
    }
    if (cleanNotes.includes('lavender') || cleanNotes.includes('herbal')) {
      return { styleKey: 'natural-elegance', styleName: 'AI Auto: Natural Elegance' };
    }
    if (cleanMood.includes('opulent') || cleanMood.includes('regal') || cleanMood.includes('royal')) {
      return { styleKey: 'arabian-luxury', styleName: 'AI Auto: Arabian Luxury' };
    }
    if (cleanCategory.includes('men')) {
      return { styleKey: 'modern-luxury', styleName: 'AI Auto: Modern Luxury' };
    }
    return { styleKey: 'minimal-luxury', styleName: 'AI Auto: Minimal Luxury' };
  }

  // --- MODE 2: CHOOSE A STYLE ---
  if (mode === 'style') {
    const validKey = STYLE_RENDERERS[style] ? style : 'luxury-floral';
    const preset = STYLE_PRESETS[validKey] || STYLE_PRESETS['luxury-floral'];
    return { styleKey: validKey, styleName: preset.name };
  }

  // --- MODE 3: CUSTOMIZE ENHANCEMENT ---
  if (mode === 'custom') {
    const env = Array.isArray(customSelections.environment) ? customSelections.environment : [];
    const flowers = Array.isArray(customSelections.flowers) ? customSelections.flowers : [];
    const atmosphere = Array.isArray(customSelections.atmosphere) ? customSelections.atmosphere : [];

    if (flowers.includes('rose')) return { styleKey: 'rose-romance', styleName: 'Custom: Rose Romance' };
    if (flowers.includes('jasmine') || flowers.includes('lily')) return { styleKey: 'luxury-floral', styleName: 'Custom: Luxury Floral' };
    if (env.includes('oud-wood')) return { styleKey: 'dark-oud', styleName: 'Custom: Dark Oud' };
    if (env.includes('amber')) return { styleKey: 'warm-amber', styleName: 'Custom: Warm Amber' };
    if (env.includes('water')) return { styleKey: 'fresh-clean', styleName: 'Custom: Fresh & Clean' };
    if (env.includes('greenery') || env.includes('leaves')) return { styleKey: 'fresh-botanical', styleName: 'Custom: Fresh Botanical' };
    if (atmosphere.includes('regal')) return { styleKey: 'royal-gold', styleName: 'Custom: Royal Gold' };
    if (atmosphere.includes('romantic')) return { styleKey: 'romantic-luxury', styleName: 'Custom: Romantic Luxury' };
    if (atmosphere.includes('minimal')) return { styleKey: 'minimal-luxury', styleName: 'Custom: Minimal Luxury' };
    return { styleKey: 'luxury-floral', styleName: 'Custom: Luxury Editorial' };
  }

  return { styleKey: 'luxury-floral', styleName: 'Luxury Floral' };
}

/**
 * POST /api/ai/generate-description
 */
exports.generateDescription = async (req, res) => {
  try {
    const { title, category, notes, mood, description, imageUrl, action } = req.body;

    if (!title && !notes && !description && !imageUrl && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a Product Name, Fragrance Notes, or an Image so AI can analyze the fragrance.'
      });
    }

    // Prepare Vision Buffer if available
    let imageBuffer = null;
    let imageMime = 'image/jpeg';

    if (req.file) {
      imageBuffer = req.file.buffer;
      imageMime = req.file.mimetype || 'image/jpeg';
    } else if (imageUrl && imageUrl.startsWith('assets/')) {
      const fullPath = path.join(__dirname, '..', '..', imageUrl);
      if (fs.existsSync(fullPath)) {
        imageBuffer = fs.readFileSync(fullPath);
      }
    }

    const generated = await generatePerfumeDescription({
      title,
      category,
      notes,
      mood,
      description,
      imageBuffer,
      imageMime,
      action: action || 'generate'
    });

    res.json({
      success: true,
      description: generated,
      action: action || 'generate'
    });
  } catch (err) {
    console.error('AI Description Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI description. Please try again.',
      error: err.message
    });
  }
};

/**
 * POST /api/ai/generate-tags
 */
exports.generateTags = async (req, res) => {
  try {
    const { title, category, notes, mood, description } = req.body;

    const tags = await generatePerfumeTags({
      title,
      category,
      notes,
      mood,
      description
    });

    res.json({
      success: true,
      tags
    });
  } catch (err) {
    console.error('AI Tags Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI tags. Please try again.',
      error: err.message
    });
  }
};

/**
 * POST /api/ai/enhance-image
 * Creates a high-end luxury editorial Generative AI environment around the perfume bottle
 */
exports.enhanceImage = async (req, res) => {
  try {
    const {
      imageUrl,
      mode = 'auto',
      style = 'luxury-floral',
      customSelections,
      title,
      category,
      notes,
      mood,
      description
    } = req.body;

    let parsedCustomSelections = customSelections;
    if (typeof customSelections === 'string') {
      try {
        parsedCustomSelections = JSON.parse(customSelections);
      } catch (e) {
        parsedCustomSelections = {};
      }
    }

    if (!imageUrl && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload or provide an original product image to enhance.'
      });
    }

    let originalUrl = imageUrl;
    let inputSource;

    // 1. Process Source Image (in-memory buffer or remote URL)
    if (req.file) {
      inputSource = req.file.buffer;
      originalUrl = `data:${req.file.mimetype || 'image/jpeg'};base64,${req.file.buffer.toString('base64')}`;
    } else if (imageUrl) {
      const cleanUrl = String(imageUrl).split('?')[0].trim();
      const relativePath = cleanUrl.replace(/^\/+/, '');
      const fullPath = path.join(__dirname, '..', '..', relativePath);

      if (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:')) {
        inputSource = cleanUrl;
        originalUrl = cleanUrl;
      } else if (fs.existsSync(fullPath)) {
        inputSource = fullPath;
        originalUrl = relativePath;
      } else {
        inputSource = cleanUrl;
        originalUrl = cleanUrl;
      }
    } else {
      inputSource = path.join(__dirname, '..', '..', 'assets', 'products', 'jasmine_white.jpg');
      originalUrl = 'assets/products/jasmine_white.jpg';
    }

    // 2. Resolve Environment Style
    const { styleKey, styleName } = resolveEnhancementStyle({
      mode,
      style,
      customSelections: parsedCustomSelections || {},
      notes,
      title,
      mood,
      category,
      description
    });

    // 3. Render 1000x1000 Luxury Editorial Composition
    const { buffer: enhancedBuffer } = await generateLuxuryEditorialImage(inputSource, styleKey);

    // Return in-memory Base64 Data URL (prevents Live Server file-watcher page reload)
    const enhancedUrl = `data:image/jpeg;base64,${enhancedBuffer.toString('base64')}`;

    res.json({
      success: true,
      originalUrl,
      enhancedUrl,
      mode,
      style: styleName,
      message: `Enhanced with ${styleName} environment`
    });
  } catch (err) {
    console.error('AI Image Enhancement Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'AI image enhancement failed. Please try again.',
      error: err.message
    });
  }
};

/**
 * POST /api/ai/upload-enhanced
 * Finalizes the accepted AI enhanced image into Cloudinary
 */
exports.uploadEnhancedToCloudinary = async (req, res) => {
  try {
    const { enhancedUrl, originalUrl } = req.body;
    const targetUrl = enhancedUrl || originalUrl;

    if (!targetUrl) {
      return res.status(400).json({ success: false, message: 'No image URL provided to finalize.' });
    }

    const cleanTargetUrl = String(targetUrl).trim();

    // 1. If it is already a permanent Cloudinary URL, return as is
    if (cleanTargetUrl.startsWith('https://res.cloudinary.com') || cleanTargetUrl.startsWith('http://res.cloudinary.com')) {
      return res.json({
        success: true,
        imageUrl: cleanTargetUrl,
        message: 'Image finalized successfully'
      });
    }

    // 2. If Cloudinary is enabled and target is Base64 Data URI or local path, upload to Cloudinary
    if (hasCloudinary) {
      if (cleanTargetUrl.startsWith('data:image/')) {
        const uploadResult = await cloudinary.uploader.upload(cleanTargetUrl, {
          folder: 'diwan_al_attour/products',
          resource_type: 'image'
        });

        return res.json({
          success: true,
          imageUrl: uploadResult.secure_url,
          message: 'Uploaded enhanced image to Cloudinary successfully'
        });
      }

      const relativeTarget = cleanTargetUrl.split('?')[0].replace(/^\/+/, '');
      const fullLocalPath = path.join(__dirname, '..', '..', relativeTarget);
      if (fs.existsSync(fullLocalPath)) {
        const uploadResult = await cloudinary.uploader.upload(fullLocalPath, {
          folder: 'diwan_al_attour/products',
          resource_type: 'image'
        });

        return res.json({
          success: true,
          imageUrl: uploadResult.secure_url,
          message: 'Uploaded accepted image to Cloudinary successfully'
        });
      }
    }

    // 3. Fallback if Cloudinary is not configured
    res.json({
      success: true,
      imageUrl: cleanTargetUrl,
      message: 'Image finalized successfully'
    });
  } catch (err) {
    console.error('Finalize Image Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload finalized image to Cloudinary',
      error: err.message
    });
  }
};
