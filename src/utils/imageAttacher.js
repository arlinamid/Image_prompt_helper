/**
 * Image Attacher Utility
 * Handles attaching edited images to the prompt input field
 */

import { getInputSelector, setNativeInputValue, getInputValue } from './helpers';

/**
 * Convert a Blob to a File object
 * @param {Blob} blob - Image blob
 * @param {string} filename - File name
 * @returns {File} File object
 */
export function blobToFile(blob, filename = 'edited-image.png') {
    return new File([blob], filename, { type: blob.type || 'image/png' });
}

/**
 * Attach images to the prompt input via DataTransfer
 * @param {Object} params - Attachment parameters
 * @param {Blob} params.originalBlob - Original clean image
 * @param {Blob} params.modifiedBlob - Modified instruction image
 * @param {string} params.instructions - User instructions
 */
export async function attachImageToPrompt({ originalBlob, modifiedBlob, instructions = '' }) {
    const inputSelector = getInputSelector();
    const inputElement = document.querySelector(inputSelector);

    if (!inputElement) {
        console.error('Could not find input element with selector:', inputSelector);
        return false;
    }

    // Create named files
    const originalFile = blobToFile(originalBlob, 'original_image.jpg');
    const modifiedFile = blobToFile(modifiedBlob, 'instruction_image.jpg');
    const files = [originalFile, modifiedFile];

    // Construct the specific prompt text
    // Clear distinction: original_image is the target, instruction_image is the reference
    const promptText = `Please modify the attached 'original_image.jpg'. I have marked the specific area/directives in 'instruction_image.jpg' to show you where to apply the changes.\n\nInstruction: ${instructions}`;

    // Add prompt text to the input
    const currentValue = getInputValue(inputElement);
    const newValue = currentValue ? `${currentValue}\n${promptText}` : promptText;
    setNativeInputValue(inputElement, newValue);

    // Backup: Copy modified image to clipboard (most useful for fallback)
    try {
        const item = new ClipboardItem({ [modifiedBlob.type]: modifiedBlob });
        await navigator.clipboard.write([item]);
        console.log('Instruction image copied to clipboard');
    } catch (err) {
        console.warn('Failed to copy to clipboard:', err);
    }

    // Try multiple methods to attach the images
    const success = await tryAttachImages(inputElement, files);

    if (success) {
        // Focus the input
        inputElement.focus();
    } else {
        // If auto-attach fails but we copied to clipboard, we can fallback
        console.log('Auto-attach failed, but instruction image is in clipboard');
        inputElement.focus();
        return true;
    }

    return success;
}

/**
 * Try various methods to attach image files
 * @param {HTMLElement} inputElement - The input element
 * @param {File[]} files - The files to attach
 * @returns {boolean} Success status
 */
async function tryAttachImages(inputElement, files) {
    const hostname = document.location.hostname;

    // Site-specific handling
    if (hostname === 'gemini.google.com') {
        return attachToGemini(files);
    } else if (hostname === 'chatgpt.com') {
        return attachToChatGPT(files);
    } else {
        // Generic approach: try paste event
        return genericAttach(inputElement, files);
    }
}

/**
 * Attach images to Gemini
 * @param {File[]} files - Image files
 */
async function attachToGemini(files) {
    // 1. Try to find the hidden file input (most reliable)
    const fileInput = document.querySelector('input[type="file"]') ||
        document.querySelector('input[accept*="image"]');

    if (fileInput) {
        return setFileInput(fileInput, files);
    }

    // 2. Try paste event on the contenteditable editor (Only works for single file usually?)
    // We can try to paste the first one, or loop? 
    // Pasting multiple files programmatically is hard.
    const editor = document.querySelector('.ql-editor, [contenteditable="true"]');
    if (editor) {
        editor.focus();
        // Just try pasting the first one/modified one as fallback? 
        // For now, let's pass all files to simulatePaste and see if DataTransfer handles it.
        return simulatePaste(editor, files);
    }

    return simulatePaste(document.body, files);
}

/**
 * Attach images to ChatGPT
 * @param {File[]} files - Image files
 */
async function attachToChatGPT(files) {
    // 1. Try to find the hidden file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        return setFileInput(fileInput, files);
    }

    // 2. ChatGPT often handles global paste events well
    const promptArea = document.querySelector('#prompt-textarea');
    if (promptArea) {
        promptArea.focus();
        await new Promise(r => setTimeout(r, 50));
        return simulatePaste(promptArea, files);
    }

    return simulatePaste(document.body, files);
}

/**
 * Generic file attachment
 * @param {HTMLElement} element - Target element
 * @param {File|File[]} files - File(s) to attach
 */
async function genericAttach(element, files) {
    // Try drop first
    if (await simulateDrop(element, files)) {
        return true;
    }

    // Try paste
    if (await simulatePaste(element, files)) {
        return true;
    }

    // Try finding a file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        return setFileInput(fileInput, files);
    }

    console.warn('Could not find a way to attach the image');
    return false;
}

/**
 * Helper to normalize file input to array
 */
function ensureArray(input) {
    return Array.isArray(input) ? input : [input];
}

/**
 * Simulate a drop event with files
 * @param {HTMLElement} element - Drop target
 * @param {File|File[]} files - File(s) to drop
 */
function simulateDrop(element, files) {
    try {
        const dataTransfer = new DataTransfer();
        ensureArray(files).forEach(file => dataTransfer.items.add(file));

        // Fire dragenter
        element.dispatchEvent(new DragEvent('dragenter', {
            bubbles: true,
            cancelable: true,
            dataTransfer
        }));

        // Fire dragover
        element.dispatchEvent(new DragEvent('dragover', {
            bubbles: true,
            cancelable: true,
            dataTransfer
        }));

        // Fire drop
        element.dispatchEvent(new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            dataTransfer
        }));

        return true;
    } catch (error) {
        console.error('Failed to simulate drop:', error);
        return false;
    }
}

/**
 * Simulate a paste event with files
 * @param {HTMLElement} element - Paste target
 * @param {File|File[]} files - File(s) to paste
 */
function simulatePaste(element, files) {
    try {
        const dataTransfer = new DataTransfer();
        ensureArray(files).forEach(file => dataTransfer.items.add(file));

        const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: dataTransfer
        });

        element.dispatchEvent(pasteEvent);
        return true;
    } catch (error) {
        console.error('Failed to simulate paste:', error);
        return false;
    }
}

/**
 * Set files on a file input element
 * @param {HTMLInputElement} input - File input element
 * @param {File|File[]} files - File(s) to set
 */
function setFileInput(input, files) {
    try {
        const dataTransfer = new DataTransfer();
        ensureArray(files).forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;

        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    } catch (error) {
        console.error('Failed to set file input:', error);
        return false;
    }
}

export default {
    attachImageToPrompt,
    blobToFile
};
