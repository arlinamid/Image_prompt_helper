import React, { useState, useEffect } from 'react';
import { saveApiKey, getApiKey, testApiKey } from '../services/geminiApi';
import { cx } from '../utils/helpers';
import { Key, Eye, EyeOff, Check, XCircle, Loader2, X } from 'lucide-react';

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
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} /> API Key Settings
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
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
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {status && (
            <div className={cx('api-status', status)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {status === 'testing' && <><Loader2 size={16} className="spinner-icon" /> Testing...</>}
              {status === 'valid' && <><Check size={16} /> API key is valid!</>}
              {status === 'invalid' && <><XCircle size={16} /> Invalid API key</>}
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


