import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cx, getAssetURL, resolveImagePath } from '../utils/helpers';
import { usePromptContext } from '../context/PromptContext';

/**
 * Keyword card component with optimized lazy image loading
 */
export function Keyword({ keyword, categoryName }) {
  const [isActive, setIsActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef(null);
  const { appendPromptText, removePromptText } = usePromptContext();

  const promptString = keyword.strings?.[0] || keyword.name;
  const resolvedImagePath = resolveImagePath(categoryName, keyword);

  // Intersection Observer for true lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleClick = useCallback(() => {
    if (isActive) {
      removePromptText(`, ${promptString}`);
      setIsActive(false);
    } else {
      appendPromptText(`, ${promptString}`);
      setIsActive(true);
    }
  }, [isActive, promptString, appendPromptText, removePromptText]);

  return (
    <div 
      ref={cardRef}
      className={cx('keyword-card', { active: isActive })}
      onClick={handleClick}
    >
      <div className="keyword-image-wrapper">
        {isVisible && !imageError ? (
          <img
            src={getAssetURL(`images/keywords/${resolvedImagePath}`)}
            alt={keyword.name}
            className={cx('keyword-image', { loaded: imageLoaded })}
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="keyword-image-placeholder">
            <span>{keyword.name[0]}</span>
          </div>
        )}
        {isActive && (
          <div className="keyword-check">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>
      <div className="keyword-name">{keyword.name}</div>
    </div>
  );
}
