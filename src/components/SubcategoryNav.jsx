import React from 'react';
import { cx } from '../utils/helpers';

/**
 * Subcategory navigation pills
 */
export function SubcategoryNav({ subcategories, activeSubcategory, onSelect }) {
  return (
    <nav className="subcategory-nav">
      <div className="subcategory-pills">
        {subcategories.map((sub) => (
          <button
            key={sub.name}
            className={cx('subcategory-pill', { active: activeSubcategory === sub.name })}
            onClick={() => onSelect(sub.name)}
          >
            {sub.name}
            <span className="pill-count">{sub.keywords.length}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

