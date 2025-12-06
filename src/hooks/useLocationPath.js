import { useState, useEffect } from 'react';

/**
 * Hook to track URL path changes
 * @returns {string} Current pathname
 */
export function useLocationPath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    // Listen for back/forward navigation
    window.addEventListener('popstate', handlePopState);

    // Override pushState and replaceState to detect SPA navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      setPath(window.location.pathname);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      setPath(window.location.pathname);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return path;
}

