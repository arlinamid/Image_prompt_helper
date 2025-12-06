import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../components/App';
import { getRootSelector } from '../utils/helpers';
import '../styles/index.css';

const rootSelector = getRootSelector();
const rootElement = document.querySelector(rootSelector);

if (rootElement) {
  const container = document.createElement('div');
  container.id = 'prompt-helper-root';
  rootElement.appendChild(container);
  createRoot(container).render(<App />);
}

