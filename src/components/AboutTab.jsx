import React from 'react';
import { getAssetURL } from '../utils/helpers';

/**
 * About tab with help and information
 */
export function AboutTab() {
  return (
    <div className="about-tab">
      {/* Hero Section */}
      <div className="about-hero">
        <img 
          src={getAssetURL('images/iconinverted.webp')} 
          alt="Logo" 
          className="about-logo"
        />
        <h1>Image Prompt Helper</h1>
        <p className="version">Version 1.2.1</p>
        <p className="tagline">Your AI Art Prompt Companion</p>
      </div>

      {/* Description */}
      <section className="about-section">
        <h2>📖 About</h2>
        <p>
          A curated library of prompt keywords and AI-powered enhancement tools 
          to help you create stunning AI-generated artwork. Whether you're using 
          Midjourney, DALL-E, Stable Diffusion, or any other AI image generator, 
          this tool helps you craft the perfect prompts.
        </p>
      </section>

      {/* Features */}
      <section className="about-section">
        <h2>✨ Features</h2>
        <ul className="feature-list">
          <li>
            <span className="feature-icon">🎨</span>
            <div>
              <strong>3000+ Keywords</strong>
              <p>Curated styles, artists, eras, and techniques</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">🤖</span>
            <div>
              <strong>AI Enhancement</strong>
              <p>Powered by Google Gemini to improve your prompts</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">🔍</span>
            <div>
              <strong>Smart Search</strong>
              <p>Find the perfect keyword instantly</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">🎲</span>
            <div>
              <strong>Prompt Variations</strong>
              <p>Generate creative alternatives for your ideas</p>
            </div>
          </li>
        </ul>
      </section>

      {/* How to Use */}
      <section className="about-section">
        <h2>📚 How to Use</h2>
        <div className="help-steps">
          <div className="help-step">
            <span className="step-number">1</span>
            <div>
              <strong>Browse Keywords</strong>
              <p>Use the Keywords tab to explore categories like styles, artists, eras, and more.</p>
            </div>
          </div>
          <div className="help-step">
            <span className="step-number">2</span>
            <div>
              <strong>Click to Add</strong>
              <p>Click any keyword card to add it to your prompt. Click again to remove.</p>
            </div>
          </div>
          <div className="help-step">
            <span className="step-number">3</span>
            <div>
              <strong>AI Enhance</strong>
              <p>Use the AI Enhance tab to improve your prompt with Gemini AI (requires API key).</p>
            </div>
          </div>
          <div className="help-step">
            <span className="step-number">4</span>
            <div>
              <strong>Generate</strong>
              <p>Copy your enhanced prompt and paste it into your favorite AI image generator!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Sites */}
      <section className="about-section">
        <h2>🌐 Supported Sites</h2>
        <div className="site-badges">
          <span className="site-badge">Bing Image Creator</span>
          <span className="site-badge">tengr.ai</span>
          <span className="site-badge">Leonardo.ai</span>
          <span className="site-badge">ChatGPT</span>
          <span className="site-badge">Gemini</span>
          <span className="site-badge">Ideogram</span>
        </div>
      </section>

      {/* AI Setup */}
      <section className="about-section">
        <h2>🔑 AI Enhancement Setup</h2>
        <p>To use the AI Enhance feature:</p>
        <ol className="setup-steps">
          <li>
            Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
              Google AI Studio
            </a>
          </li>
          <li>Create a free API key</li>
          <li>Go to the AI Enhance tab and click "Set Up API Key"</li>
          <li>Paste your key and save</li>
        </ol>
      </section>

      {/* Credits */}
      <section className="about-section">
        <h2>👨‍💻 Credits</h2>
        <div className="credits-card">
          <div className="credit-item">
            <span className="credit-label">Developer</span>
            <a href="https://github.com/arlinamid" target="_blank" rel="noopener noreferrer">
              @arlinamid
            </a>
          </div>
          <div className="credit-item">
            <span className="credit-label">Original Idea</span>
            <a href="https://twitter.com/arielopie" target="_blank" rel="noopener noreferrer">
              Ariel Verber
            </a>
          </div>
          <div className="credit-item">
            <span className="credit-label">Thumbnails</span>
            <span>imiprompt.com · DALL-E · Stable Diffusion</span>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="about-section support-section">
        <h2>💖 Support</h2>
        <p>If you find this tool helpful, consider supporting the development:</p>
        <a
          href="https://www.buymeacoffee.com/arlinamid"
          target="_blank"
          rel="noopener noreferrer"
          className="support-btn"
        >
          <span>☕</span> Buy me a coffee
        </a>
      </section>

      {/* Links */}
      <section className="about-section">
        <h2>🔗 Links</h2>
        <div className="link-buttons">
          <a 
            href="https://github.com/arlinamid/Image_prompt_helper" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-btn"
          >
            <span>📦</span> GitHub Repository
          </a>
          <a 
            href="https://github.com/arlinamid/Image_prompt_helper/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-btn"
          >
            <span>🐛</span> Report an Issue
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <p>Made with ❤️ for the AI Art community</p>
        <p className="copyright">© 2024 Image Prompt Helper</p>
      </footer>
    </div>
  );
}

