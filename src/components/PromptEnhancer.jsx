import React, { useState, useEffect } from 'react';
import { enhancePrompt, generateVariations, hasApiKey, AI_PERSONAS } from '../services/geminiApi';
import { ApiKeyModal } from './ApiKeyModal';
import { cx, getAttachedImages } from '../utils/helpers';
import {
  Sparkles,
  Settings,
  Camera,
  Palette,
  Key,
  Dices,
  AlertTriangle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

const ICON_MAP = {
  'Camera': Camera,
  'Palette': Palette,
  'Sparkles': Sparkles
};

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
  const [attachedImageInfo, setAttachedImageInfo] = useState(null);

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
    setAttachedImageInfo(null);

    try {
      // Check for attached images in the input area
      const images = await getAttachedImages();

      if (images && images.length > 0) {
        const count = images.length;
        setAttachedImageInfo(`${count} image${count > 1 ? 's' : ''} detected and included`);
      }

      const result = await enhancePrompt(currentPrompt, selectedPersona, images);
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
          <div className="setup-icon"><Sparkles size={32} /></div>
          <h3>AI Prompt Enhancement</h3>
          <p>Configure Gemini API to enhance your prompts with AI</p>
          <button className="btn btn-primary" onClick={() => setShowSettings(true)}>
            <Key size={16} style={{ marginRight: '8px' }} /> Set Up API Key
          </button>
        </div>
        <ApiKeyModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </>
    );
  }

  const personaKeys = Object.keys(AI_PERSONAS);
  const currentPersona = AI_PERSONAS[selectedPersona];
  const CurrentIcon = ICON_MAP[currentPersona.icon];

  return (
    <>
      <div className="prompt-enhancer">
        <div className="enhancer-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} /> AI Enhance
          </h3>
          <button
            className="settings-btn"
            onClick={() => setShowSettings(true)}
            title="API Settings"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* AI Persona Selector */}
        <div className="persona-selector">
          <div className="persona-label">AI Mode:</div>
          <div className="persona-buttons">
            {personaKeys.map((key) => {
              const persona = AI_PERSONAS[key];
              const Icon = ICON_MAP[persona.icon];
              return (
                <button
                  key={key}
                  className={cx('persona-btn', { active: selectedPersona === key })}
                  onClick={() => setSelectedPersona(key)}
                  title={persona.description}
                >
                  <span className="persona-icon"><Icon size={16} /></span>
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
                    <Loader2 size={18} className="spinner-icon" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <CurrentIcon size={18} />
                    Enhance as {currentPersona.name}
                  </>
                )}
              </button>

              {attachedImageInfo && (
                <div className="info-message" style={{ marginTop: '8px', fontSize: '0.8rem', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={14} /> {attachedImageInfo}
                </div>
              )}

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
                    <Loader2 size={18} className="spinner-icon" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Dices size={18} />
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
              <AlertTriangle size={16} /> {error}
            </div>
          )}
        </div>
      </div>

      <ApiKeyModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

