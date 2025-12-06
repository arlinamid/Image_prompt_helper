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
async function callGemini(systemInstruction, userPrompt) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  try {
    const client = await getClient(apiKey);
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemInstruction}\n\nUser prompt: ${userPrompt}`,
    });

    console.log('Gemini response:', response);

    // Check for blocked content
    if (response?.promptFeedback?.blockReason) {
      throw new Error('CONTENT_BLOCKED');
    }

    // Get the text response
    const text = response?.text;
    
    if (!text) {
      // Try alternative access
      const candidates = response?.candidates;
      if (candidates && candidates[0]?.content?.parts?.[0]?.text) {
        return candidates[0].content.parts[0].text.trim();
      }
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
 * Enhance a prompt for better AI image generation
 */
export async function enhancePrompt(prompt) {
  if (!prompt?.trim()) {
    throw new Error('EMPTY_PROMPT');
  }

  const systemInstruction = `You are an expert AI image prompt engineer. Your task is to enhance the given prompt to create more detailed, vivid, and effective prompts for AI image generation tools like Midjourney, DALL-E, and Stable Diffusion.

Rules:
1. Keep the original intent and subject of the prompt
2. Add artistic style, lighting, mood, and composition details
3. Include relevant technical terms (camera angles, art styles, rendering quality)
4. Make it more specific and descriptive
5. Keep it concise but detailed (aim for 50-150 words)
6. Return ONLY the enhanced prompt, no explanations

Example:
Input: "a cat sitting on a chair"
Output: "A majestic tabby cat sitting elegantly on a vintage velvet armchair, soft golden hour lighting streaming through a nearby window, bokeh background with warm amber tones, professional pet photography, sharp focus on the cat's expressive eyes, 8K resolution, photorealistic rendering"`;

  return await callGemini(systemInstruction, prompt);
}

/**
 * Generate creative variations of a prompt
 */
export async function generateVariations(prompt, count = 3) {
  if (!prompt?.trim()) {
    throw new Error('EMPTY_PROMPT');
  }

  const systemInstruction = `You are an expert AI image prompt engineer. Generate ${count} creative variations of the given prompt for AI image generation.

Rules:
1. Each variation should have a different artistic style, mood, or interpretation
2. Keep the core subject but explore different angles, lighting, or aesthetics
3. Make each variation distinct and interesting
4. Keep variations concise but detailed (50-100 words each)
5. Return ONLY the variations, numbered 1-${count}, each on its own line
6. Do not include explanations or headers

Example format:
1. [First variation here]
2. [Second variation here]
3. [Third variation here]`;

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

