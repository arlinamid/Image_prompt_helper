import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocationPath } from '../hooks/useLocationPath';
import { getInputSelector, setNativeInputValue, getInputValue, isContentEditable, isProseMirror, isQuillEditor } from '../utils/helpers';

const PromptContext = createContext();

/**
 * Provider component for prompt text management
 */
export function PromptProvider({ children }) {
  const inputRef = useRef(null);
  const observerRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const [promptText, setPromptText] = useState('');
  const [inputFound, setInputFound] = useState(false);
  const locationPath = useLocationPath();
  const inputSelector = getInputSelector();

  // Function to attach listeners to input element
  const attachListeners = useCallback((inputElement) => {
    if (!inputElement) return () => { };

    function handleChange(event) {
      const value = getInputValue(event.target);
      setPromptText(value);
    }

    // For contenteditable elements (Quill, ProseMirror), listen to 'input' event
    const isEditable = isContentEditable(inputElement) || isProseMirror(inputElement) || isQuillEditor(inputElement);

    if (isEditable) {
      inputElement.addEventListener('input', handleChange);
      inputElement.addEventListener('keyup', handleChange);
    } else {
      inputElement.addEventListener('change', handleChange);
      inputElement.addEventListener('keyup', handleChange);
      inputElement.addEventListener('input', handleChange);
    }

    // Get initial value
    setPromptText(getInputValue(inputElement));

    // Return cleanup function
    return () => {
      inputElement.removeEventListener('input', handleChange);
      inputElement.removeEventListener('keyup', handleChange);
      inputElement.removeEventListener('change', handleChange);
    };
  }, []);

  // Function to find and bind to input element
  const findAndBindInput = useCallback(() => {
    const inputElement = document.querySelector(inputSelector);

    if (inputElement) {
      // Check if it's a different element than before
      if (inputRef.current !== inputElement) {
        console.log('Input element found/changed:', inputSelector);
        inputRef.current = inputElement;
        setInputFound(true);
        return attachListeners(inputElement);
      }
    } else {
      // Input not found yet
      if (inputRef.current) {
        console.log('Input element lost, will retry...');
        inputRef.current = null;
        setInputFound(false);
      }
    }
    return () => { };
  }, [inputSelector, attachListeners]);

  useEffect(() => {
    let cleanup = findAndBindInput();

    // Set up MutationObserver to watch for DOM changes
    observerRef.current = new MutationObserver((mutations) => {
      // Check if our input still exists
      const currentInput = inputRef.current;
      const inputStillExists = currentInput && document.contains(currentInput);

      if (!inputStillExists) {
        // Input was removed, try to find it again
        cleanup();
        cleanup = findAndBindInput();
      } else if (!inputRef.current) {
        // No input yet, try to find it
        cleanup = findAndBindInput();
      }
    });

    // Observe the body for changes
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also retry periodically for SPAs with delayed rendering
    const retryFind = () => {
      if (!inputRef.current || !document.contains(inputRef.current)) {
        cleanup();
        cleanup = findAndBindInput();
      }
    };

    // Retry a few times with increasing delays
    const retryDelays = [100, 500, 1000, 2000];
    const retryTimers = retryDelays.map((delay) =>
      setTimeout(retryFind, delay)
    );

    return () => {
      cleanup();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      retryTimers.forEach(clearTimeout);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [locationPath, inputSelector, findAndBindInput]);

  /**
   * Get valid input element, re-find if needed
   */
  function getValidInput() {
    // Check if current ref is still in DOM
    if (inputRef.current && document.contains(inputRef.current)) {
      return inputRef.current;
    }

    // Try to find input again
    const inputElement = document.querySelector(inputSelector);
    if (inputElement) {
      inputRef.current = inputElement;
      return inputElement;
    }

    console.warn('Could not find input element:', inputSelector);
    return null;
  }

  /**
   * Append text to the prompt
   * @param {string} text - Text to append
   */
  function appendPromptText(text) {
    const input = getValidInput();
    if (!input) return;

    const currentValue = getInputValue(input);
    setNativeInputValue(input, currentValue + text);
    setPromptText(currentValue + text);
  }

  /**
   * Remove text from the prompt
   * @param {string} text - Text to remove
   */
  function removePromptText(text) {
    const input = getValidInput();
    if (!input) return;

    const currentValue = getInputValue(input);
    const lastIndex = currentValue.lastIndexOf(text);

    if (lastIndex !== -1) {
      const newValue = currentValue.slice(0, lastIndex) + currentValue.slice(lastIndex + text.length);
      setNativeInputValue(input, newValue);
      setPromptText(newValue);
    }
  }

  /**
   * Replace entire prompt text
   * @param {string} text - New text to set
   */
  function setPromptTextValue(text) {
    const input = getValidInput();
    if (!input) return;

    setNativeInputValue(input, text);
    setPromptText(text);
  }

  return (
    <PromptContext.Provider
      value={{
        promptText,
        appendPromptText,
        removePromptText,
        setPromptText: setPromptTextValue,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}

/**
 * Hook to access prompt context
 * @returns {Object} Prompt context value
 */
export function usePromptContext() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }
  return context;
}

