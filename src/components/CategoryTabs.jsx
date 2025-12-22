import React from 'react';
import { cx } from '../utils/helpers';
import {
  Palette,
  Monitor,
  Camera,
  User,
  Shirt,
  Building2,
  Image,
  Folder
} from 'lucide-react';

const categoryIcons = {
  'Basic Element': Palette,
  'Digital Art': Monitor,
  'Photography': Camera,
  'Character Design': User,
  'Fashion': Shirt,
  'Architecture': Building2,
  'Artists': Image,
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
        {categories.map((category) => {
          const Icon = categoryIcons[category.name] || Folder;
          return (
            <div
              key={category.name}
              className={cx('category-tab', { active: selectedCategory === category.name })}
              onClick={() => onSelect(category.name)}
              style={{ '--tab-color': categoryColors[category.name] || 'var(--color-accent)' }}
            >
              <div className="tab-icon"><Icon size={20} /></div>
              <div className="tab-label">{category.name}</div>
              <div className="tab-count">{category.subcategories.length}</div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}


