import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocationPath } from '../hooks/useLocationPath';
import { getInputSelector, setNativeInputValue, getInputValue, isContentEditable, isProseMirror } from '../utils/helpers';

const PromptContext = createContext();

/**
 * Provider component for prompt text management
 */
export function PromptProvider({ children }) {
  const inputRef = useRef(null);
  const [promptText, setPromptText] = useState('');
  const locationPath = useLocationPath();
  const inputSelector = getInputSelector();

  useEffect(() => {
    const inputElement = document.querySelector(inputSelector);
    
    if (!inputElement) {
      console.warn('Could not find prompt text input element.');
      setPromptText('');
      return;
    }

    inputRef.current = inputElement;

    function handleChange(event) {
      const value = getInputValue(event.target);
      setPromptText(value);
    }

    // For contenteditable elements, listen to 'input' event
    const isEditable = isContentEditable(inputElement) || isProseMirror(inputElement);
    
    if (isEditable) {
      inputElement.addEventListener('input', handleChange);
      inputElement.addEventListener('keyup', handleChange);
      setPromptText(getInputValue(inputElement));
    } else {
      inputElement.addEventListener('change', handleChange);
      inputElement.addEventListener('keyup', handleChange);
      inputElement.dispatchEvent(new Event('change'));
    }

    return () => {
      if (isEditable) {
        inputElement.removeEventListener('input', handleChange);
        inputElement.removeEventListener('keyup', handleChange);
      } else {
        inputElement.removeEventListener('change', handleChange);
        inputElement.removeEventListener('keyup', handleChange);
      }
    };
  }, [locationPath, inputSelector]);

  /**
   * Append text to the prompt
   * @param {string} text - Text to append
   */
  function appendPromptText(text) {
    if (!inputRef.current) return;
    
    const currentValue = getInputValue(inputRef.current);
    setNativeInputValue(inputRef.current, currentValue + text);
    setPromptText(currentValue + text);
  }

  /**
   * Remove text from the prompt
   * @param {string} text - Text to remove
   */
  function removePromptText(text) {
    if (!inputRef.current) return;

    const currentValue = getInputValue(inputRef.current);
    const lastIndex = currentValue.lastIndexOf(text);
    
    if (lastIndex !== -1) {
      const newValue = currentValue.slice(0, lastIndex) + currentValue.slice(lastIndex + text.length);
      setNativeInputValue(inputRef.current, newValue);
      setPromptText(newValue);
    }
  }

  /**
   * Replace entire prompt text
   * @param {string} text - New text to set
   */
  function setPromptTextValue(text) {
    if (!inputRef.current) return;
    
    setNativeInputValue(inputRef.current, text);
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

