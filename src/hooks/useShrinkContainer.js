import { useEffect } from 'react';

/**
 * Hook to shrink container when drawer is open
 * @param {boolean} isOpen - Whether drawer is open
 */
export function useShrinkContainer(isOpen) {
  useEffect(() => {
    const container = document.querySelector('#prompt-helper-root')?.parentElement;
    
    if (!container) return;

    if (isOpen) {
      container.style.marginRight = '340px';
      container.style.transition = 'margin-right 0.3s ease';
    } else {
      container.style.marginRight = '0';
    }

    return () => {
      container.style.marginRight = '0';
    };
  }, [isOpen]);
}


