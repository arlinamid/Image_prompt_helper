import React, { useState, useEffect } from 'react';
import { saveApiKey, getApiKey, testApiKey } from '../services/geminiApi';
import { cx } from '../utils/helpers';

/**
 * Modal for API key configuration
 */
export function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState(null); // null, 'testing', 'valid', 'invalid'

  useEffect(() => {
    if (isOpen) {
      loadApiKey();
    }
  }, [isOpen]);

  async function loadApiKey() {
    const key = await getApiKey();
    setApiKey(key || '');
    setStatus(null);
  }

  async function handleTest() {
    if (!apiKey.trim()) return;
    
    setStatus('testing');
    const isValid = await testApiKey(apiKey);
    setStatus(isValid ? 'valid' : 'invalid');
  }

  async function handleSave() {
    await saveApiKey(apiKey);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔑 API Key Settings</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Enter your Google Gemini API key to enable AI prompt enhancement.
            Get a free key from{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
              Google AI Studio
            </a>
          </p>
          
          <div className="api-key-input-group">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="api-key-input"
            />
            <button 
              className="toggle-visibility"
              onClick={() => setShowKey(!showKey)}
              type="button"
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>

          {status && (
            <div className={cx('api-status', status)}>
              {status === 'testing' && '⏳ Testing...'}
              {status === 'valid' && '✅ API key is valid!'}
              {status === 'invalid' && '❌ Invalid API key'}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleTest}
            disabled={!apiKey.trim() || status === 'testing'}
          >
            Test Key
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!apiKey.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}


