/**
 * Google Gemini API Client Configuration & AI Helpers
 * Diwan Al Attour - Haute Parfumerie Luxury Storefront
 */

require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// 12 Visual Style Environmental Presets for Luxury Editorial Enhancer
const STYLE_PRESETS = {
  'luxury-floral': {
    name: 'Luxury Floral',
    description: 'Elegant flowers, soft botanical elements, ivory silk and champagne lighting.',
    icon: '🌸'
  },
  'rose-romance': {
    name: 'Rose Romance',
    description: 'Velvet Taif roses, blush marble, soft morning golden mist.',
    icon: '🌹'
  },
  'dark-oud': {
    name: 'Dark Oud',
    description: 'Rich oud wood, amber, deep warm tones, dramatic premium lighting.',
    icon: '🪵'
  },
  'fresh-botanical': {
    name: 'Fresh Botanical',
    description: 'Fresh greenery, natural stones, soft daylight and subtle water elements.',
    icon: '🌿'
  },
  'arabian-luxury': {
    name: 'Arabian Luxury',
    description: 'Ornate golden brass tray, royal draped gold silk satin, desert dusk glow.',
    icon: '👑'
  },
  'minimal-luxury': {
    name: 'Minimal Luxury',
    description: 'Clean geometric limestone podium, neutral warm beige studio backdrop, soft shadows.',
    icon: '🏛️'
  },
  'royal-gold': {
    name: 'Royal Gold',
    description: 'Gleaming golden accents, champagne crystal reflections, opulent royal ambiance.',
    icon: '✨'
  },
  'natural-elegance': {
    name: 'Natural Elegance',
    description: 'Organic natural stone, wild delicate blossoms, airy gentle sunbeams.',
    icon: '🍃'
  },
  'romantic-luxury': {
    name: 'Romantic Luxury',
    description: 'Soft candlelight glow, velvet pastel drapery, delicate flower petals.',
    icon: '🕯️'
  },
  'modern-luxury': {
    name: 'Modern Luxury',
    description: 'Sleek architectural podium, ultra-clean studio lighting, refined minimalism.',
    icon: '💎'
  },
  'warm-amber': {
    name: 'Warm Amber',
    description: 'Glowing amber resins, warm spiced woods, rich golden dusk illumination.',
    icon: '🔥'
  },
  'fresh-clean': {
    name: 'Fresh & Clean',
    description: 'Crystal clear water droplets, pristine white marble, luminous crisp daylight.',
    icon: '💧'
  }
};

/**
 * Generate Text / Vision with Gemini API
 */
async function generateText({ prompt, systemInstruction, imageBuffer, imageMime = 'image/jpeg', model = 'gemini-3.6-flash' }) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const url = `${API_BASE}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const parts = [];
  if (imageBuffer) {
    parts.push({
      inlineData: {
        mimeType: imageMime,
        data: imageBuffer.toString('base64')
      }
    });
  }
  parts.push({ text: prompt });

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 600
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data.error?.message || response.statusText || 'Gemini API call failed';
    throw new Error(`Gemini API Error (${response.status}): ${errMsg}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No content returned by Gemini API');
  }

  return text.trim();
}

/**
 * Generate / Improve / Refine Perfume Product Description (with Vision + Olfactory analysis)
 */
async function generatePerfumeDescription({ title, category, notes, mood, description, imageBuffer, imageMime, action = 'generate' }) {
  const systemInstruction = `You are an elite master perfumer and luxury copywriter for "Diwan Al Attour", a prestigious haute parfumerie house.
Your writing style is sophisticated, sensory, elegant, concise, and emotionally captivating.
CRITICAL RULES:
1. Target length: EXACTLY 40 to 70 words.
2. If perfume bottle photograph is provided, examine its design, glass texture, liquid color, label, and cap to reflect its visual majesty accurately.
3. If fragrance notes or ingredients are provided, describe their olfactory unfolding from top to base notes.
4. NEVER make medical, therapeutic, or performance/longevity claims unless explicitly provided.
5. Return ONLY the final description text with no quotes, headings, bullet points, or markdown formatting.`;

  let prompt = '';
  const context = `Product Name: ${title || 'Luxury Fragrance'}
Target Gender/Category: ${category || 'Unisex'}
Fragrance Notes: ${notes || (imageBuffer ? 'Derived from bottle visual character' : 'Precious florals, rich woods, and golden amber')}
Mood / Character: ${mood || 'Opulent, regal, and timeless'}`;

  switch (action) {
    case 'improve':
      prompt = `Enhance and refine this existing perfume description into a polished luxury editorial standard:
${context}
Existing Description: "${description}"
Make it more captivating, sensory, and fluid while strictly preserving the provided fragrance details.`;
      break;

    case 'shorten':
      prompt = `Condense this perfume description into a punchy, ultra-concise 30-45 word luxury statement:
${context}
Existing Description: "${description}"`;
      break;

    case 'luxurious':
      prompt = `Rewrite this description with the most opulent, poetic, and prestigious vocabulary fitting royal high perfumery:
${context}
Existing Description: "${description || ''}"`;
      break;

    case 'seo':
      prompt = `Write an engaging, SEO-optimized e-commerce product description (50-65 words) that naturally incorporates the perfume name, gender category, and fragrance notes:
${context}
Existing Description: "${description || ''}"`;
      break;

    case 'generate':
    default:
      prompt = `Write a complete, intoxicating luxury perfume description:
${context}`;
      break;
  }

  let text = await generateText({ prompt, systemInstruction, imageBuffer, imageMime });
  text = text.replace(/^\`\`\`[a-z]*\n?/gi, '').replace(/\n?\`\`\`$/gi, '').trim();
  text = text.replace(/^["']|["']$/g, '').trim();
  return text;
}

/**
 * Generate Product Tags
 */
async function generatePerfumeTags({ title, category, notes, mood, description }) {
  const systemInstruction = `You are a luxury e-commerce catalog specialist. Return 5 to 8 clean, relevant product tags based ONLY on the provided perfume information.
Format output as a single line of comma-separated tags ONLY (e.g. "Taif Rose, White Musk, Floral, Luxury, Women's Fragrance, Sensual"). Do not output markdown, reasoning, bullet points, or thoughts.`;

  const prompt = `Product: ${title || 'Luxury Fragrance'}
Category: ${category || 'Unisex'}
Fragrance Notes: ${notes || ''}
Mood: ${mood || ''}
Description: ${description || ''}`;

  const rawText = await generateText({ prompt, systemInstruction });
  
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const tagLine = lines.find(l => l.includes(',') && !l.toLowerCase().includes('constraint') && !l.toLowerCase().includes('tag')) || lines[lines.length - 1] || rawText;
  
  const ignoredWords = ['markdown', 'preamble', 'constraint', 'instruction', 'bullet', 'thought', 'output', 'format', 'tag', 'generate'];
  const tags = tagLine
    .split(',')
    .map(t => t.trim().replace(/^[\*\-#\d\.\s]+/, '').replace(/[\*\#"]/g, ''))
    .filter(t => {
      const lower = t.toLowerCase();
      return t.length > 1 && t.length < 35 && !t.includes(':') && !ignoredWords.some(w => lower.includes(w));
    });

  if (tags.length >= 3) {
    return tags;
  }

  const fallback = [
    title,
    category ? `${category}'s Fragrance` : 'Luxury Perfume',
    ...(notes ? notes.split(',').map(n => n.trim()) : []),
    mood,
    'Haute Parfumerie'
  ].filter(Boolean);

  return [...new Set(fallback)].slice(0, 7);
}

module.exports = {
  GEMINI_API_KEY,
  STYLE_PRESETS,
  generateText,
  generatePerfumeDescription,
  generatePerfumeTags
};
