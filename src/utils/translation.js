// Translation mock service - simulates AI translation
// In production, connect to Google Translate API, DeepL, or LibreTranslate

const TRANSLATIONS = {
  'ta-en': {
    'இந்த வீடியோ மிகவும் அருமையாக இருக்கிறது! மிகவும் நன்றி.': 'This video is very wonderful! Thank you very much.',
    'மிகவும் நல்ல தகவல்': 'Very good information',
  },
  'es-en': {
    '¡Fantástico contenido! Aprendí mucho con este video.': 'Fantastic content! I learned a lot from this video.',
    '¡Muy bien!': 'Very good!',
  },
  'ja-en': {
    'とても素晴らしい動画です！もっと見たいです。': 'This is a very wonderful video! I want to see more.',
  },
  'hi-en': {
    'बहुत बढ़िया वीडियो!': 'Very great video!',
    'मुझे यह बहुत पसंद आया': 'I liked this very much',
  },
  'fr-en': {
    'Excellent contenu!': 'Excellent content!',
    'Merci beaucoup': 'Thank you very much',
  },
  'de-en': {
    'Sehr gutes Video!': 'Very good video!',
  },
};

const LANG_NAMES = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
  kn: 'Kannada', ml: 'Malayalam', es: 'Spanish', fr: 'French',
  de: 'German', ja: 'Japanese', zh: 'Chinese', ar: 'Arabic',
  pt: 'Portuguese', ru: 'Russian',
};

// Detect language from text heuristically
export function detectLanguage(text) {
  if (!text) return 'en';
  const charCodes = [...text].map(c => c.charCodeAt(0));
  const avg = charCodes.reduce((a, b) => a + b, 0) / charCodes.length;

  // Tamil Unicode range: 2944–3071
  if (charCodes.some(c => c >= 2944 && c <= 3071)) return 'ta';
  // Telugu: 3072–3199
  if (charCodes.some(c => c >= 3072 && c <= 3199)) return 'te';
  // Malayalam: 3328–3455
  if (charCodes.some(c => c >= 3328 && c <= 3455)) return 'ml';
  // Kannada: 3200–3327
  if (charCodes.some(c => c >= 3200 && c <= 3327)) return 'kn';
  // Devanagari (Hindi): 2304–2431
  if (charCodes.some(c => c >= 2304 && c <= 2431)) return 'hi';
  // Japanese Hiragana/Katakana: 12288–12543
  if (charCodes.some(c => c >= 12288 && c <= 12543)) return 'ja';
  // Chinese CJK: 19968–40959
  if (charCodes.some(c => c >= 19968 && c <= 40959)) return 'zh';
  // Arabic: 1536–1791
  if (charCodes.some(c => c >= 1536 && c <= 1791)) return 'ar';
  // Cyrillic (Russian): 1024–1279
  if (charCodes.some(c => c >= 1024 && c <= 1279)) return 'ru';

  // Latin-based detection via common words
  const lower = text.toLowerCase();
  if (/\b(el|la|los|las|que|en|con|un|una|por)\b/.test(lower)) return 'es';
  if (/\b(le|la|les|des|une|pour|avec|que|dans)\b/.test(lower)) return 'fr';
  if (/\b(der|die|das|und|ist|in|ich|nicht|von)\b/.test(lower)) return 'de';
  if (/\b(o|a|os|as|de|que|em|um|uma|por|com)\b/.test(lower)) return 'pt';

  return 'en';
}

// Translate text to target language (mock AI translation)
export async function translateText(text, targetLang = 'en', sourceLang = null) {
  if (!text || text.trim() === '') return { translated: text, detected: 'en' };

  const detected = sourceLang || detectLanguage(text);

  if (detected === targetLang) {
    return { translated: text, detected };
  }

  // Simulate API delay
  await new Promise(r => setTimeout(r, 400 + Math.random() * 300));

  // Check mock translations
  const key = `${detected}-${targetLang}`;
  if (TRANSLATIONS[key] && TRANSLATIONS[key][text]) {
    return { translated: TRANSLATIONS[key][text], detected };
  }

  // Generate plausible mock translation
  const mockTranslated = generateMockTranslation(text, detected, targetLang);
  return { translated: mockTranslated, detected };
}

function generateMockTranslation(text, from, to) {
  const fromName = LANG_NAMES[from] || from;
  const toName = LANG_NAMES[to] || to;

  // Attempt to return sensible mock for common phrases
  const lower = text.toLowerCase().trim();

  if (to === 'en') {
    if (lower.includes('!') && lower.length < 30) return `[Translated from ${fromName}]: Wonderful! Amazing content!`;
    if (lower.length < 50) return `[Translated from ${fromName}]: This is really great content, thank you!`;
    return `[Translated from ${fromName}]: ${text.slice(0, 40)}... (AI Translation)`;
  }

  if (to === 'hi') return `[${fromName} से अनुवादित]: यह वास्तव में शानदार सामग्री है!`;
  if (to === 'ta') return `[${fromName} இலிருந்து மொழிபெயர்க்கப்பட்டது]: இது மிகவும் அருமையான உள்ளடக்கம்!`;
  if (to === 'es') return `[Traducido del ${fromName}]: ¡Este es un contenido realmente increíble!`;
  if (to === 'fr') return `[Traduit du ${fromName}]: C'est vraiment un excellent contenu!`;
  if (to === 'de') return `[Übersetzt aus dem ${fromName}]: Das ist wirklich toller Inhalt!`;
  if (to === 'ja') return `[${fromName}から翻訳]: これは本当に素晴らしいコンテンツです！`;

  return `[${fromName}→${toName}]: ${text.slice(0, 60)}`;
}

export function getLangName(code) {
  return LANG_NAMES[code] || code;
}

// Moderate comment for invalid special characters
export function moderateComment(text) {
  if (!text || text.trim() === '') return { valid: false, reason: 'Comment cannot be empty.' };

  // Block invalid special character sequences (not punctuation, not unicode letters/numbers)
  const invalidPattern = /[<>{}[\]|\\^~`@#$%*+=]{2,}/;
  if (invalidPattern.test(text)) {
    return { valid: false, reason: 'Comment contains invalid special characters.' };
  }

  // Block excessive repeated characters
  if (/(.)\1{8,}/.test(text)) {
    return { valid: false, reason: 'Comment contains excessive repeated characters.' };
  }

  // Block URLs disguised as content
  if (/(https?:\/\/[^\s]{20,}){2,}/.test(text)) {
    return { valid: false, reason: 'Comment contains too many links.' };
  }

  // Min length
  if (text.trim().length < 2) {
    return { valid: false, reason: 'Comment is too short.' };
  }

  return { valid: true };
}
