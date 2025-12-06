import React, { useState, useEffect } from 'react';
import { enhancePrompt, generateVariations, hasApiKey, AI_PERSONAS } from '../services/geminiApi';
import { ApiKeyModal } from './ApiKeyModal';
import { cx } from '../utils/helpers';

/**
 * Prompt enhancer component with Gemini AI integration
 */
export function PromptEnhancer({ currentPrompt, onApplyPrompt }) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [variations, setVariations] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('enhance');
  const [selectedPersona, setSelectedPersona] = useState('prompter');

  useEffect(() => {
    checkApiKey();
  }, [showSettings]);

  async function checkApiKey() {
    const configured = await hasApiKey();
    setIsConfigured(configured);
  }

  async function handleEnhance() {
    if (!currentPrompt?.trim()) {
      setError('Enter a prompt first');
      return;
    }

    setIsEnhancing(true);
    setError(null);
    setEnhancedPrompt('');

    try {
      const result = await enhancePrompt(currentPrompt, selectedPersona);
      setEnhancedPrompt(result);
    } catch (err) {
      handleError(err);
    }

    setIsEnhancing(false);
  }

  async function handleGenerateVariations() {
    if (!currentPrompt?.trim()) {
      setError('Enter a prompt first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVariations([]);

    try {
      const results = await generateVariations(currentPrompt, 3, selectedPersona);
      setVariations(results);
    } catch (err) {
      handleError(err);
    }

    setIsGenerating(false);
  }

  function handleError(err) {
    const messages = {
      'API_KEY_MISSING': 'Please configure your API key first',
      'INVALID_API_KEY': 'Invalid API key. Please check your settings',
      'RATE_LIMITED': 'Too many requests. Please wait a moment',
      'EMPTY_PROMPT': 'Please enter a prompt first',
      'NETWORK_ERROR': 'Network error. Check your connection',
      'NO_RESPONSE': 'No response from AI. Try again',
      'CONTENT_BLOCKED': 'Content was blocked by safety filters. Try a different prompt',
      'API_ERROR': 'API error. Check console for details',
    };
    setError(messages[err.message] || `Error: ${err.message}`);
  }

  function handleApply(prompt) {
    onApplyPrompt(prompt);
    setEnhancedPrompt('');
    setVariations([]);
  }

  if (!isConfigured) {
    return (
      <>
        <div className="enhancer-setup">
          <div className="setup-icon">✨</div>
          <h3>AI Prompt Enhancement</h3>
          <p>Configure Gemini API to enhance your prompts with AI</p>
          <button className="btn btn-primary" onClick={() => setShowSettings(true)}>
            <span>🔑</span> Set Up API Key
          </button>
        </div>
        <ApiKeyModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </>
    );
  }

  const personaKeys = Object.keys(AI_PERSONAS);
  const currentPersona = AI_PERSONAS[selectedPersona];

  return (
    <>
      <div className="prompt-enhancer">
        <div className="enhancer-header">
          <h3>✨ AI Enhance</h3>
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(true)}
            title="API Settings"
          >
            ⚙️
          </button>
        </div>

        {/* AI Persona Selector */}
        <div className="persona-selector">
          <div className="persona-label">AI Mode:</div>
          <div className="persona-buttons">
            {personaKeys.map((key) => {
              const persona = AI_PERSONAS[key];
              return (
                <button
                  key={key}
                  className={cx('persona-btn', { active: selectedPersona === key })}
                  onClick={() => setSelectedPersona(key)}
                  title={persona.description}
                >
                  <span className="persona-icon">{persona.icon}</span>
                  <span className="persona-name">{persona.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="enhancer-tabs">
          <button 
            className={cx('tab-btn', { active: activeTab === 'enhance' })}
            onClick={() => setActiveTab('enhance')}
          >
            Enhance
          </button>
          <button 
            className={cx('tab-btn', { active: activeTab === 'variations' })}
            onClick={() => setActiveTab('variations')}
          >
            Variations
          </button>
        </div>

        <div className="enhancer-content">
          {activeTab === 'enhance' && (
            <div className="enhance-section">
              <p className="current-prompt-label">Current prompt:</p>
              <div className="current-prompt-preview">
                {currentPrompt || <span className="empty">No prompt entered yet</span>}
              </div>
              
              <button 
                className="btn btn-enhance"
                onClick={handleEnhance}
                disabled={isEnhancing || !currentPrompt?.trim()}
              >
                {isEnhancing ? (
                  <>
                    <span className="spinner"></span>
                    Enhancing...
                  </>
                ) : (
                  <>
                    <span>{currentPersona.icon}</span>
                    Enhance as {currentPersona.name}
                  </>
                )}
              </button>

              {enhancedPrompt && (
                <div className="result-card">
                  <div className="result-label">Enhanced prompt:</div>
                  <div className="result-text">{enhancedPrompt}</div>
                  <div className="result-actions">
                    <button 
                      className="btn btn-small btn-primary"
                      onClick={() => handleApply(enhancedPrompt)}
                    >
                      Apply
                    </button>
                    <button 
                      className="btn btn-small btn-secondary"
                      onClick={() => navigator.clipboard.writeText(enhancedPrompt)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'variations' && (
            <div className="variations-section">
              <p className="section-description">
                Generate creative variations of your prompt
              </p>
              
              <button 
                className="btn btn-enhance"
                onClick={handleGenerateVariations}
                disabled={isGenerating || !currentPrompt?.trim()}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>🎲</span>
                    Generate 3 Variations
                  </>
                )}
              </button>

              {variations.length > 0 && (
                <div className="variations-list">
                  {variations.map((variation, index) => (
                    <div key={index} className="result-card">
                      <div className="result-label">Variation {index + 1}</div>
                      <div className="result-text">{variation}</div>
                      <div className="result-actions">
                        <button 
                          className="btn btn-small btn-primary"
                          onClick={() => handleApply(variation)}
                        >
                          Apply
                        </button>
                        <button 
                          className="btn btn-small btn-secondary"
                          onClick={() => navigator.clipboard.writeText(variation)}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}
        </div>
      </div>

      <ApiKeyModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

