/**
 * AI Features Controller
 * Diwan Al Attour - Structured Copywriting & Catalog Tagging
 */

const { generatePerfumeDescription, generatePerfumeTags } = require('../config/gemini');

/**
 * POST /api/ai/generate-description
 */
exports.generateDescription = async (req, res) => {
  try {
    const {
      name,
      title,
      brand,
      gender,
      category,
      perfumeCategory,
      perfumeType,
      fragranceFamily,
      family,
      notes,
      topNotes,
      heartNotes,
      baseNotes,
      mood,
      season,
      occasion,
      description,
      action = 'generate'
    } = req.body;

    const productName = (name || title || '').trim();
    const fragranceNotes = (notes || topNotes || heartNotes || baseNotes || '').trim();
    const existingDesc = (description || '').trim();
    const fam = (fragranceFamily || family || '').trim();

    // Validation for Action 'improve'
    if (action === 'improve' && !existingDesc) {
      return res.status(400).json({
        success: false,
        message: 'Please add a description first, or use Generate Description.'
      });
    }

    // Validation for Action 'generate' / 'luxurious' / 'seo'
    if (!productName && !fragranceNotes && !existingDesc && !fam) {
      return res.status(400).json({
        success: false,
        message: 'Add a few more product details such as perfume name, fragrance family, or notes to generate an accurate description.'
      });
    }

    const generated = await generatePerfumeDescription({
      name: productName,
      title: productName,
      brand,
      gender,
      category,
      perfumeCategory: perfumeCategory || perfumeType,
      fragranceFamily: fam,
      notes: fragranceNotes,
      topNotes,
      heartNotes,
      baseNotes,
      mood,
      season,
      occasion,
      description: existingDesc,
      action
    });

    res.json({
      success: true,
      description: generated,
      action
    });
  } catch (err) {
    console.error('AI Description Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate AI description. Please try again.',
      error: err.message
    });
  }
};

/**
 * POST /api/ai/generate-tags
 */
exports.generateTags = async (req, res) => {
  try {
    const {
      name,
      title,
      brand,
      gender,
      category,
      perfumeCategory,
      perfumeType,
      fragranceFamily,
      family,
      notes,
      topNotes,
      heartNotes,
      baseNotes,
      mood,
      season,
      occasion,
      description
    } = req.body;

    const productName = (name || title || '').trim();
    const fragranceNotes = (notes || topNotes || heartNotes || baseNotes || '').trim();
    const existingDesc = (description || '').trim();
    const fam = (fragranceFamily || family || '').trim();

    if (!productName && !fragranceNotes && !existingDesc && !fam) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a Perfume Name, Fragrance Family, or Notes to generate tags.'
      });
    }

    const tags = await generatePerfumeTags({
      name: productName,
      title: productName,
      brand,
      gender,
      category,
      perfumeCategory: perfumeCategory || perfumeType,
      fragranceFamily: fam,
      notes: fragranceNotes,
      topNotes,
      heartNotes,
      baseNotes,
      mood,
      season,
      occasion,
      description: existingDesc
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
