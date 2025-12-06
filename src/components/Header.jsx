import React from 'react';
import { getAssetURL } from '../utils/helpers';

/**
 * Header component with branding and close button
 */
export function Header({ onClose }) {
  return (
    <header className="drawer-header">
      <div className="header-brand">
        <img 
          src={getAssetURL('images/iconinverted.webp')} 
          alt="Logo" 
          className="header-logo"
        />
        <div className="header-title">
          <h1>Prompt Helper</h1>
          <span className="header-subtitle">AI Art Keywords</span>
        </div>
      </div>
      <button className="header-close-btn" onClick={onClose} aria-label="Close drawer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </header>
  );
}

