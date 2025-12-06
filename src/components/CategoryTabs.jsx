import React from 'react';
import { cx } from '../utils/helpers';

const categoryIcons = {
  'Basic Element': '🎨',
  'Digital Art': '🖥️',
  'Photography': '📷',
  'Character Design': '🧑‍🎨',
  'Fashion': '👗',
  'Architecture': '🏛️',
  'Artists': '🖼️',
};

const categoryColors = {
  'Basic Element': '#00f0ff',
  'Digital Art': '#bd5fff',
  'Photography': '#ff006e',
  'Character Design': '#ff8c00',
  'Fashion': '#ffd700',
  'Architecture': '#00bfff',
  'Artists': '#32cd32',
};

/**
 * Category tabs for main navigation
 */
export function CategoryTabs({ categories, selectedCategory, onSelect }) {
  return (
    <nav className="category-tabs">
      <div className="tabs-grid">
        {categories.map((category) => (
          <div
            key={category.name}
            className={cx('category-tab', { active: selectedCategory === category.name })}
            onClick={() => onSelect(category.name)}
            style={{ '--tab-color': categoryColors[category.name] || 'var(--color-accent)' }}
          >
            <div className="tab-icon">{categoryIcons[category.name] || '📁'}</div>
            <div className="tab-label">{category.name}</div>
            <div className="tab-count">{category.subcategories.length}</div>
          </div>
        ))}
      </div>
    </nav>
  );
}

