import React from 'react';
import { Keyword } from './Keyword';
import { cx } from '../utils/helpers';

/**
 * Subcategory section with keywords
 */
export function Subcategory({ id, name, keywords, categoryName, isSearchResult }) {
  return (
    <section id={id} className={cx('subcategory', { 'search-result': isSearchResult })}>
      <h2 className="subcategory-title">{name}</h2>
      <div className="keywords-grid">
        {keywords.map((keyword) => (
          <Keyword 
            key={keyword.name} 
            keyword={keyword} 
            categoryName={categoryName}
          />
        ))}
      </div>
    </section>
  );
}


