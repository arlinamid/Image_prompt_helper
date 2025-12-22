import React, { useState } from 'react';
import { cx, getAssetURL } from '../utils/helpers';

/**
 * Floating action button to open the drawer
 */
export function FloatingButton({ onClick, isHidden }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={cx('floating-button', { hidden: isHidden, hovered: isHovered })}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Open Prompt Helper"
    >
      <img 
        src={getAssetURL('images/iconinverted.webp')} 
        alt="Prompt Helper" 
        className="floating-button-icon"
      />
      <span className="floating-button-label">Prompts</span>
    </button>
  );
}


