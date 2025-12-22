import { runtime } from './browser-api';

/**
 * Get the URL for a browser extension asset
 * @param {string} path - Asset path relative to assets folder
 * @returns {string} Full extension URL
 */
export function getAssetURL(path) {
  // All dist builds use 'assets/' as the base path
  // The manifest always points to assets/contentScript.js
  return runtime.getURL(`assets/${path}`);
}

/**
 * Check if element is a contenteditable element
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if contenteditable
 */
export function isContentEditable(element) {
  return element.getAttribute('contenteditable') === 'true';
}

/**
 * Check if element is a ProseMirror editor (like ChatGPT)
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if ProseMirror
 */
export function isProseMirror(element) {
  return element.classList.contains('ProseMirror');
}

/**
 * Check if element is a Quill editor (like Gemini)
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if Quill editor
 */
export function isQuillEditor(element) {
  return element.classList.contains('ql-editor');
}

/**
 * Get input value from regular input or contenteditable
 * @param {HTMLElement} element - Input element
 * @returns {string} Input value
 */
export function getInputValue(element) {
  if (isContentEditable(element) || isProseMirror(element) || isQuillEditor(element)) {
    // Get text content and clean up extra whitespace/newlines
    const text = element.innerText || element.textContent || '';
    // Remove trailing newlines but preserve internal ones if needed
    return text.replace(/\n+$/, '').replace(/^\n+/, '');
  }
  return element.value || '';
}

/**
 * Set value on input element (handles React controlled inputs and contenteditable)
 * @param {HTMLElement} element - Input element
 * @param {string} value - Value to set
 */
export function setNativeInputValue(element, value) {
  if (isContentEditable(element) || isProseMirror(element) || isQuillEditor(element)) {
    // Clean value - remove extra newlines
    const cleanValue = value.replace(/\n+$/, '').replace(/^\n+/, '');

    // For ProseMirror (ChatGPT), wrap in <p> tag
    if (isProseMirror(element)) {
      element.innerHTML = `<p>${cleanValue}</p>`;
    } else if (isQuillEditor(element)) {
      // For Quill editor (Gemini), wrap in <p> tags to match Quill's internal format
      element.innerHTML = `<p>${cleanValue}</p>`;
    } else {
      // For other contenteditable
      element.textContent = cleanValue;
    }

    // Move cursor to end
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    // Dispatch input event - Quill and other editors listen for this
    element.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText'
    }));

    // Also dispatch a custom event that some frameworks listen for
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    // For regular inputs/textareas
    const previousValue = element.value;
    element.value = value;

    // Handle React's value tracker
    const tracker = element._valueTracker;
    if (tracker) {
      tracker.setValue(previousValue);
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

/**
 * Conditional class name helper (replacement for classnames library)
 * @param  {...any} args - Class names or condition objects
 * @returns {string} Combined class string
 */
export function cx(...args) {
  const classes = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === 'string') {
      classes.push(arg);
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

/**
 * Get the root selector for the current host
 * @returns {string} CSS selector for root element
 */
export function getRootSelector() {
  switch (document.location.hostname) {
    case 'www.bing.com':
      return '#b_content';
    case 'tengr.ai':
      // Use body as root - the page has dynamic containers
      return 'body';
    case 'app.leonardo.ai':
      // Use body to avoid conflicts with dynamic class names
      return 'body';
    case 'chatgpt.com':
      // Use body to avoid React hydration conflicts
      return 'body';
    case 'gemini.google.com':
      return 'body';
    case 'ideogram.ai':
      return 'body';
    default:
      console.log('Unknown host:', document.location.hostname);
      return 'body';
  }
}

/**
 * Get the input selector for the current host
 * @returns {string} CSS selector for input element
 */
export function getInputSelector() {
  switch (document.location.hostname) {
    case 'www.bing.com':
      return '#b_searchboxForm input';
    case 'tengr.ai':
      // Main prompt textarea - try multiple selectors
      return 'textarea[placeholder*="prompt"], textarea[placeholder*="Prompt"], .sticky textarea, textarea';
    case 'app.leonardo.ai':
      // Support both legacy (#prompt-textarea) and normal mode (chakra textarea)
      return '#prompt-textarea, textarea[class*="chakra"]';
    case 'chatgpt.com':
      return '#prompt-textarea';
    case 'gemini.google.com':
      // Quill editor inside rich-textarea - target the contenteditable div
      return 'rich-textarea .ql-editor, .ql-editor[contenteditable="true"]';
    case 'ideogram.ai':
      return 'textarea.MuiInputBase-inputMultiline';
    default:
      console.log('Unknown host:', document.location.hostname);
      return 'textarea';
  }
}

/**
 * Resolve keyword image path
 * @param {string} categoryName - Category name
 * @param {Object} keyword - Keyword object
 * @returns {string} Image path
 */
export function resolveImagePath(categoryName, keyword) {
  // Check for imagePath first (from JSON data), then image as fallback
  if (keyword.imagePath) {
    return keyword.imagePath;
  }

  if (keyword.image) {
    return keyword.image;
  }

  // Default image paths based on category
  const categoryImageFolders = {
    'Artists': 'Artists',
    'Basic Element': 'predefined',
    'Digital Art': 'predefined',
    'Photography': 'predefined',
    'Character Design': 'predefined',
    'Fashion': 'predefined',
    'Architecture': 'predefined',
  };

  const folder = categoryImageFolders[categoryName] || 'midjourneyV5';
  const fileName = keyword.name.toLowerCase().replace(/\s+/g, '-') + '.webp';

  return `${folder}/${fileName}`;
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Get attached images from the input area (Gemini & ChatGPT)
 * @returns {Promise<Object|null>} Image object { mimeType, data } or null
 */
export async function getAttachedImages() {
  const images = [];
  const host = document.location.hostname;

  try {
    if (host === 'gemini.google.com') {
      const imgElements = document.querySelectorAll('uploader-file-preview img[src^="blob:"]');
      for (const img of imgElements) {
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          // base64 is "data:image/png;base64,..."
          const [meta, data] = base64.split(',');
          const mimeType = meta.split(':')[1].split(';')[0];
          images.push({ mimeType, data });
        } catch (e) {
          console.error('Failed to fetch blob image:', e);
        }
      }
    } else if (host === 'chatgpt.com') {
      // Check for background images with data uris in the input area
      // User provided: style="background-image: url(&quot;data:image/png;base64,...&quot;)"
      // Targeting both div and span as structure can vary
      const elements = document.querySelectorAll('[style*="background-image"][style*="data:image"]');
      for (const el of elements) {
        const style = el.getAttribute('style');
        // Match various quote styles
        const match = style.match(/url\((?:&quot;|"|')?(data:image\/[^;]+;base64,[^&"'\)]+)(?:&quot;|"|')?\)/);

        if (match && match[1]) {
          const base64 = match[1];
          const [meta, data] = base64.split(',');
          const mimeType = meta.split(':')[1].split(';')[0];
          images.push({ mimeType, data });
        }
      }
    }
  } catch (err) {
    console.error('Error getting attached images:', err);
  }

  return images.length > 0 ? images : null;
}
