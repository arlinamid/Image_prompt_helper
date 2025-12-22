import { GoogleGenAI } from '@google/genai';
import { storage } from '../utils/browser-api';

const STORAGE_KEY = 'gemini_api_key';

let aiClient = null;
let currentApiKey = null;

/**
 * Initialize or get the Gemini AI client
 */
async function getClient(apiKey) {
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  if (aiClient && currentApiKey === apiKey) {
    return aiClient;
  }

  aiClient = new GoogleGenAI({ apiKey });
  currentApiKey = apiKey;
  return aiClient;
}

/**
 * Save API key to browser storage
 */
export async function saveApiKey(apiKey) {
  try {
    await storage.local.set({ [STORAGE_KEY]: apiKey });
  } catch (e) {
    console.error('Failed to save API key:', e);
    throw new Error('Storage not available');
  }
}

/**
 * Get API key from browser storage
 */
export async function getApiKey() {
  try {
    const result = await storage.local.get([STORAGE_KEY]);
    return result[STORAGE_KEY] || null;
  } catch (e) {
    console.warn('Storage access error:', e);
    return null;
  }
}

/**
 * Check if API key is configured
 */
export async function hasApiKey() {
  const key = await getApiKey();
  return !!key;
}

/**
 * Test if the API key is valid
 */
export async function testApiKey(apiKey) {
  try {
    const client = await getClient(apiKey);
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "OK" if you can hear me.',
    });
    return !!response?.text;
  } catch (error) {
    console.error('API key test failed:', error);
    return false;
  }
}

/**
 * Call Gemini API with a prompt
 */
async function callGemini(systemInstruction, userPrompt, image = null) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  try {
    const client = await getClient(apiKey);

    // Construct content parts
    const parts = [{ text: systemInstruction }];

    // Add images if provided
    if (image) {
      const images = Array.isArray(image) ? image : [image];

      images.forEach(img => {
        // image object structure: { mimeType: string, data: base64string }
        parts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data
          }
        });
      });

      // Add instruction about the image(s)
      const imageCount = images.length;
      parts.push({ text: `Note: The user has attached ${imageCount} image${imageCount > 1 ? 's' : ''} to this prompt. Use ${imageCount > 1 ? 'these images' : 'this image'} as context for the enhancement.` });
    }

    parts.push({ text: `User prompt: ${userPrompt}` });

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: parts }],
    });

    console.log('Gemini full response:', JSON.stringify(response, null, 2));

    // Check for blocked content
    if (response?.promptFeedback?.blockReason) {
      throw new Error('CONTENT_BLOCKED');
    }

    // Get the text response - handle function or property
    let text;
    if (typeof response.text === 'function') {
      text = response.text();
    } else {
      text = response.text;
    }

    if (!text) {
      // Try alternative access
      const candidates = response?.candidates;
      if (candidates && candidates[0]?.content?.parts?.[0]?.text) {
        return candidates[0].content.parts[0].text.trim();
      }
      console.error('No text in response:', response);
      throw new Error('NO_RESPONSE');
    }

    return text.trim();
  } catch (error) {
    console.error('Gemini API error:', error);

    if (error.message === 'API_KEY_MISSING' ||
      error.message === 'CONTENT_BLOCKED' ||
      error.message === 'NO_RESPONSE') {
      throw error;
    }

    if (error.message?.includes('API key not valid')) {
      throw new Error('INVALID_API_KEY');
    }

    if (error.message?.includes('quota') || error.message?.includes('rate')) {
      throw new Error('RATE_LIMITED');
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      throw new Error('NETWORK_ERROR');
    }

    throw new Error('API_ERROR');
  }
}

/**
 * AI Personas for different enhancement styles
 */
export const AI_PERSONAS = {
  photographer: {
    name: 'Photographer',
    icon: 'Camera',
    description: 'Professional photography style with technical camera settings',
    systemInstruction: `You are a world-class professional photographer with expertise in all photography styles - portrait, landscape, street, wildlife, fashion, and product photography.

Your task: Transform the given prompt into a professional photography description.

Include these elements:
- Camera and lens details (Canon, Sony, 85mm f/1.4, etc.)
- Lighting setup (natural light, studio strobes, golden hour, Rembrandt lighting)
- Camera settings (aperture, shutter speed, ISO when relevant)
- Composition techniques (rule of thirds, leading lines, negative space)
- Post-processing style (film grain, color grading, contrast)
- Mood and atmosphere

Rules:
1. Keep the original subject
2. Make it sound like a professional photo shoot description
3. Use authentic photography terminology
4. Keep it 60-120 words
5. Return ONLY the enhanced prompt, no explanations`
  },

  painter: {
    name: 'Painter',
    icon: 'Palette',
    description: 'Classical and modern art styles with painterly techniques',
    systemInstruction: `You are a master artist with deep knowledge of art history, from Renaissance masters to contemporary digital art.

Your task: Transform the given prompt into an artistic masterpiece description.

Include these elements:
- Art movement or style (Impressionism, Baroque, Art Nouveau, etc.)
- Specific artist influence when relevant (in the style of...)
- Medium and technique (oil on canvas, watercolor, impasto, glazing)
- Color palette and harmony (complementary, analogous, chiaroscuro)
- Brushwork and texture descriptions
- Emotional and symbolic elements

Rules:
1. Keep the original subject
2. Make it sound like a museum artwork description
3. Use authentic fine art terminology
4. Keep it 60-120 words
5. Return ONLY the enhanced prompt, no explanations`
  },

  prompter: {
    name: 'Image Prompter',
    icon: 'Sparkles',
    description: 'Optimized prompts for AI image generation',
    systemInstruction: `You are an expert AI image prompt engineer specializing in Midjourney, DALL-E, Stable Diffusion, and other AI art generators.

Your task: Optimize the prompt for maximum AI image generation quality.

Include these elements:
- Detailed subject description
- Style keywords (photorealistic, cinematic, ethereal, etc.)
- Lighting and atmosphere (volumetric, dramatic, soft)
- Quality boosters (8K, ultra detailed, masterpiece, trending on ArtStation)
- Composition hints (close-up, wide shot, bird's eye view)
- Render engine hints when appropriate (Unreal Engine, Octane render)

Rules:
1. Keep the original subject
2. Use proven AI prompt keywords and structures
3. Prioritize clarity and specificity
4. Keep it 60-120 words
5. Return ONLY the enhanced prompt, no explanations`
  }
};

const IMAGE_MODIFICATION_INSTRUCTION = `You are an expert AI image editor.
Your task: Write a precise, clear instruction for an AI model to modify the attached image based on the user's prompt.

Rules:
1. ALWAYS begin or end with "Maintain strict character and facial consistency with the original image."
2. Focus strictly on the modifications requested by the user.
3. Do not describe the entire scene from scratch.
4. Output should be a direct instruction (e.g., "Change the lighting to...", "Add a hat to...").
5. Keep it concise but ensure the consistency requirement is present.`;

/**
 * Enhance a prompt with selected AI persona
 */
export async function enhancePrompt(prompt, persona = 'prompter', image = null) {
  if (!prompt?.trim()) {
    throw new Error('EMPTY_PROMPT');
  }

  const selectedPersona = AI_PERSONAS[persona] || AI_PERSONAS.prompter;

  // If an image is attached, we want to instruct the model to modify it, not describe a new scene
  const systemInstruction = image
    ? IMAGE_MODIFICATION_INSTRUCTION
    : selectedPersona.systemInstruction;

  return await callGemini(systemInstruction, prompt, image);
}

/**
 * Generate creative variations of a prompt using selected persona
 */
export async function generateVariations(prompt, count = 3, persona = 'prompter') {
  if (!prompt?.trim()) {
    throw new Error('EMPTY_PROMPT');
  }

  const selectedPersona = AI_PERSONAS[persona] || AI_PERSONAS.prompter;
  const personaContext = persona === 'photographer'
    ? 'different photography styles, camera angles, and lighting setups'
    : persona === 'painter'
      ? 'different art movements, techniques, and artistic interpretations'
      : 'different visual styles, moods, and artistic directions';

  const systemInstruction = `You are a ${selectedPersona.name}. Generate ${count} creative variations of the given prompt.

Context: Create variations exploring ${personaContext}.

Rules:
1. Each variation should have a distinctly different style or approach
2. Keep the core subject but explore different interpretations
3. Use terminology appropriate to your expertise as a ${selectedPersona.name.toLowerCase()}
4. Keep variations concise but detailed (50-100 words each)
5. Return ONLY the variations, numbered 1-${count}, each on its own line
6. Do not include explanations or headers

Format:
1. [First variation]
2. [Second variation]
3. [Third variation]`;

  const response = await callGemini(systemInstruction, prompt);

  // Parse the numbered variations
  const lines = response.split('\n').filter(line => line.trim());
  const variations = [];

  for (const line of lines) {
    // Remove numbering and clean up
    const cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim();
    if (cleaned) {
      variations.push(cleaned);
    }
  }

  return variations.slice(0, count);
}

