/**
 * Google Gemini API Client Configuration & AI Helpers
 * Diwan Al Attour - Haute Parfumerie Luxury Storefront
 */

require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Generate Text with Gemini API using Flash Lite for fast, efficient generation
 */
async function generateText({ prompt, systemInstruction, models = ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'] }) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
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

  let lastError = null;

  for (const model of models) {
    const url = `${API_BASE}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text.trim();
        }

        if (response.status === 429) {
          lastError = new Error(`Rate limit on ${model}`);
          break; // Immediately try next available model in list
        }

        const errMsg = data.error?.message || response.statusText || 'Gemini API call failed';
        lastError = new Error(`Gemini Error (${model}): ${errMsg}`);
        break; // Switch to next model
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error('Failed to generate text after trying all models');
}

/**
 * Build a clean, structured product context string from available fields.
 * Safely ignores empty or undefined fields without inserting fake data.
 */
/**
 * Build a clean, structured product context string from available fields.
 * Explicitly marks missing fields to prevent the AI from guessing or hallucinating.
 */
function buildStructuredProductContext(data = {}) {
  const name = data.name || data.title;
  const brand = data.brand || 'Diwan Al Attour';
  const gender = data.gender || data.category || 'Unisex';
  const perfCategory = data.perfumeCategory || data.perfumeType || 'Eau de Parfum';
  const family = data.fragranceFamily || data.family;
  const notes = data.notes || data.fragranceNotes || [data.topNotes, data.heartNotes, data.baseNotes].filter(Boolean).join(', ');
  const mood = data.mood || data.character;
  const occasion = data.occasion || data.season;

  const lines = [
    `[CONFIRMED PRODUCT SPECIFICATIONS]`,
    `- Product Name: ${name || 'Luxury Fragrance'}`,
    `- Brand: ${brand}`,
    `- Target Gender: ${gender}`,
    `- Concentration / Category: ${perfCategory}`,
    `- Confirmed Fragrance Family: ${family ? family.trim() : 'Not specified (DO NOT GUESS OR ASSUME)'}`,
    `- Confirmed Fragrance Notes: ${notes ? notes.trim() : 'NONE PROVIDED (STRICTLY FORBIDDEN TO INVENT OR NAME ANY INGREDIENTS/NOTES)'}`,
    `- Confirmed Mood/Character: ${mood ? mood.trim() : 'Not specified'}`,
    `- Confirmed Season/Occasion: ${occasion ? occasion.trim() : 'Not specified (DO NOT INVENT OCCASIONS OR SEASONS)'}`
  ];

  return lines.join('\n');
}

/**
 * Generate / Improve / Refine Perfume Product Description
 * Relies strictly on structured product context; NEVER hallucinates unprovided facts.
 */
async function generatePerfumeDescription(data = {}) {
  const action = data.action || 'generate';
  const productContext = buildStructuredProductContext(data);
  const existingDesc = (data.description || '').trim();

  let systemInstruction = '';
  let prompt = '';

  switch (action) {
    case 'improve': {
      if (!existingDesc) {
        throw new Error('Please add a description first, or use Generate Description.');
      }
      systemInstruction = `You are an expert luxury perfume copywriter for "Diwan Al Attour".
Improve the supplied perfume description for a premium e-commerce website (45 to 65 words).
ABSOLUTE NEGATIVE CONSTRAINTS:
1. Preserve all factual information.
2. Improve grammar, sentence flow, vocabulary elegance, and luxury appeal.
3. DO NOT invent unlisted fragrance notes (do not add neroli, apple, peony, jasmine, rose, lily, sandalwood, musk, vanilla, amber, oud, etc. unless they appear in the confirmed specifications or original text).
4. DO NOT invent occasions or seasons (do not add bridal, office, garden party, spring, etc. unless provided).
5. Return ONLY the final improved text with no quotes, headings, or markdown.`;

      prompt = `${productContext}

Existing Description to Improve:
"${existingDesc}"

Task: Rewrite and elevate the above description into polished high-end luxury prose while preserving all factual constraints.`;
      break;
    }

    case 'luxurious': {
      systemInstruction = `You are an elite master perfumer and luxury copywriter for royal haute parfumerie.
Rewrite the supplied perfume description in a prestigious royal luxury tone (45 to 65 words).
ABSOLUTE NEGATIVE CONSTRAINTS:
1. Elevate the tone with opulent, sophisticated, and evocative high-perfumery vocabulary.
2. DO NOT invent unlisted fragrance notes or ingredients.
3. DO NOT invent unlisted seasons or occasions.
4. Return ONLY the rewritten description text with no quotes, headings, or markdown.`;

      prompt = `${productContext}

Current Description:
"${existingDesc || ''}"

Task: Rewrite in ultra-luxurious, poetic high-perfumery style based strictly on the confirmed specifications.`;
      break;
    }

    case 'seo': {
      systemInstruction = `You are an e-commerce SEO and luxury perfume copywriting specialist.
Optimize this perfume product description for search engines (50 to 65 words).
ABSOLUTE NEGATIVE CONSTRAINTS:
1. Naturally weave the confirmed Product Name, Brand, Target Gender, Fragrance Family, and confirmed Fragrance Notes.
2. DO NOT invent unsupplied fragrance notes, keywords, or seasons.
3. Keep the writing natural, readable, and premium without keyword stuffing.
4. Return ONLY the final SEO-optimized text with no quotes, headings, or markdown.`;

      prompt = `${productContext}

Current Description:
"${existingDesc || ''}"

Task: Produce a clean SEO-optimized product description using only the confirmed product specifications.`;
      break;
    }

    case 'generate':
    default: {
      systemInstruction = `You are a precision luxury perfume copywriter for "Diwan Al Attour".
Write a captivating, high-end e-commerce product description (45 to 65 words) based STRICTLY on the supplied [CONFIRMED PRODUCT SPECIFICATIONS].

ABSOLUTE NEGATIVE CONSTRAINTS - VIOLATION IS UNACCEPTABLE:
1. YOU MUST NEVER INVENT, ASSUME, OR GUESS FRAGRANCE NOTES OR INGREDIENTS.
   - If "Confirmed Fragrance Notes" is provided: You are ONLY allowed to mention the EXACT notes listed. You are STRICTLY FORBIDDEN from adding any other note, flower, fruit, wood, spice, or musk (e.g. NEVER add neroli, apple, peony, jasmine, lily, sandalwood, musk, vanilla, amber, oud, etc. unless explicitly listed in Confirmed Fragrance Notes).
   - If "Confirmed Fragrance Notes" is NONE PROVIDED: You are STRICTLY FORBIDDEN from naming ANY specific notes, flowers, fruits, woods, or ingredients. Describe the perfume solely using its confirmed Fragrance Family (e.g. "a luminous floral creation", "a distinguished woody composition") and general luxury elegance.
2. YOU MUST NEVER INVENT SEASONS OR OCCASIONS.
   - If "Confirmed Season/Occasion" is Not specified: Do NOT mention seasons (spring, summer, etc.) or occasions (bridal wear, office, garden party, date night, etc.).
3. Return ONLY the final description text. No quotes, headings, or markdown.`;

      prompt = `Write the luxury e-commerce product description based on these confirmed specifications:
${productContext}`;
      break;
    }
  }

  let text = await generateText({ prompt, systemInstruction });
  text = text.replace(/^\`\`\`[a-z]*\n?/gi, '').replace(/\n?\`\`\`$/gi, '').trim();
  text = text.replace(/^["']|["']$/g, '').trim();
  return text;
}

/**
 * Generate 6–12 E-Commerce Product Tags from Structured Context
 * Strictly adheres to supplied product facts; NO hallucinated notes.
 */
async function generatePerfumeTags(data = {}) {
  const productContext = buildStructuredProductContext(data);

  const systemInstruction = `You are an e-commerce search tag generator for "Diwan Al Attour".
Generate 6 to 12 concise, highly relevant search tags based STRICTLY on the supplied [CONFIRMED PRODUCT SPECIFICATIONS].

ABSOLUTE NEGATIVE CONSTRAINTS:
1. YOU MUST NEVER INVENT FRAGRANCE NOTES OR INGREDIENTS.
   - If "Confirmed Fragrance Notes" is NONE PROVIDED: Do NOT generate tags for specific flowers, fruits, woods, or spices (e.g. do NOT generate Rose, Jasmine, Oud, Vanilla, Sandalwood, etc.).
   - If "Confirmed Fragrance Notes" is provided: ONLY generate note tags for the EXACT notes listed.
2. Do not use hashtags (#).
3. Return ONLY a single line of comma-separated tags (e.g. "Majestic Blossom, Diwan Al Attour, Women Eau de Parfum, Floral Fragrance, Luxury Perfume").`;

  const prompt = `Generate search tags for this perfume:
${productContext}`;

  const rawText = await generateText({ prompt, systemInstruction });
  
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const tagLine = lines.find(l => l.includes(',') && !l.toLowerCase().includes('constraint') && !l.toLowerCase().includes('tag:')) || lines[lines.length - 1] || rawText;
  
  const ignoredWords = ['markdown', 'preamble', 'constraint', 'instruction', 'bullet', 'thought', 'output', 'format', 'tag', 'generate', 'note:'];
  const tags = tagLine
    .split(',')
    .map(t => t.trim().replace(/^[\*\-#\d\.\s]+/, '').replace(/[\*\#"]/g, ''))
    .filter(t => {
      const lower = t.toLowerCase();
      return t.length > 1 && t.length < 35 && !t.includes(':') && !ignoredWords.some(w => lower.includes(w));
    });

  if (tags.length >= 4) {
    return [...new Set(tags)].slice(0, 12);
  }

  // Safe fallback constructed strictly from available non-empty fields
  const safeFallback = [];
  const name = data.name || data.title;
  if (name) safeFallback.push(name.trim());
  safeFallback.push('Diwan Al Attour');
  const gender = data.gender || data.category;
  if (gender) safeFallback.push(`${gender}'s Fragrance`);
  const fam = data.fragranceFamily || data.family;
  if (fam) safeFallback.push(`${fam} Perfume`);
  if (data.notes) {
    data.notes.split(',').forEach(n => {
      const trimmed = n.trim();
      if (trimmed) safeFallback.push(trimmed);
    });
  }
  if (data.mood) safeFallback.push(data.mood);
  if (data.occasion) safeFallback.push(data.occasion);
  safeFallback.push('Eau de Parfum');

  return [...new Set(safeFallback)].filter(Boolean).slice(0, 10);
}

module.exports = {
  GEMINI_API_KEY,
  generateText,
  buildStructuredProductContext,
  generatePerfumeDescription,
  generatePerfumeTags
};
