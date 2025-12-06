import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Header } from './Header';
import { SearchBar } from './SearchBar';
import { CategoryTabs } from './CategoryTabs';
import { SubcategoryNav } from './SubcategoryNav';
import { Subcategory } from './Subcategory';
import { PromptEnhancer } from './PromptEnhancer';
import { AboutTab } from './AboutTab';
import { PromptProvider, usePromptContext } from '../context/PromptContext';
import { cx } from '../utils/helpers';
import categories from '../data/categories.json';

// Main navigation tabs
const MAIN_TABS = [
  { id: 'keywords', label: 'Keywords', icon: '🎨' },
  { id: 'enhance', label: 'AI Enhance', icon: '✨' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

/**
 * Keywords tab content with prompt context access
 */
function KeywordsContent({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  filteredSubcategories,
  resultsCount,
  currentCategory,
  activeSubcategory,
  setActiveSubcategory,
}) {
  const handleSubcategoryClick = useCallback((subcategoryName) => {
    setActiveSubcategory(subcategoryName);
    const element = document.getElementById(`subcategory-${subcategoryName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [setActiveSubcategory]);

  return (
    <>
      <SearchBar 
        value={searchQuery} 
        onChange={setSearchQuery}
        placeholder={`Search in ${selectedCategory}...`}
      />
      
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {!searchQuery && currentCategory && (
        <SubcategoryNav
          subcategories={currentCategory.subcategories}
          activeSubcategory={activeSubcategory}
          onSelect={handleSubcategoryClick}
        />
      )}

      {searchQuery && (
        <div className="search-results-info">
          <span className="results-count">{resultsCount}</span> results for "<span className="results-query">{searchQuery}</span>"
        </div>
      )}

      <div className="drawer-content">
        <div className="subcategoryContainer">
          {filteredSubcategories.length > 0 ? (
            filteredSubcategories.map((subcategory) => (
              <Subcategory
                key={subcategory.name}
                id={`subcategory-${subcategory.name}`}
                categoryName={currentCategory.name}
                isSearchResult={!!searchQuery}
                {...subcategory}
              />
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No keywords found</h3>
              <p>Try a different search term or browse other categories</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * AI Enhance tab content
 */
function EnhanceContent() {
  const { promptText, setPromptText } = usePromptContext();

  const handleApplyEnhancedPrompt = useCallback((newPrompt) => {
    setPromptText(newPrompt);
  }, [setPromptText]);

  return (
    <div className="drawer-content enhance-content">
      <PromptEnhancer 
        currentPrompt={promptText} 
        onApplyPrompt={handleApplyEnhancedPrompt}
      />
    </div>
  );
}

/**
 * Main drawer panel component with tabs
 */
export function Drawer({ open, onClose }) {
  const [activeMainTab, setActiveMainTab] = useState('keywords');
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const drawerRef = useRef(null);

  const currentCategory = categories.find((cat) => cat.name === selectedCategory);

  // Filter subcategories and keywords based on search
  const filteredSubcategories = useMemo(() => {
    if (!currentCategory) return [];
    if (!searchQuery.trim()) return currentCategory.subcategories;

    const query = searchQuery.toLowerCase();
    return currentCategory.subcategories
      .map((sub) => ({
        ...sub,
        keywords: sub.keywords.filter(
          (kw) =>
            kw.name.toLowerCase().includes(query) ||
            kw.strings?.some((s) => s.toLowerCase().includes(query))
        ),
      }))
      .filter((sub) => sub.keywords.length > 0);
  }, [currentCategory, searchQuery]);

  // Total results count
  const resultsCount = useMemo(() => {
    return filteredSubcategories.reduce((acc, sub) => acc + sub.keywords.length, 0);
  }, [filteredSubcategories]);

  const handleCategoryChange = useCallback((categoryName) => {
    setSelectedCategory(categoryName);
    setSearchQuery('');
    setActiveSubcategory(null);
  }, []);

  if (!open) return null;

  return (
    <div className="prompt-helper-drawer" ref={drawerRef}>
      {/* Header */}
      <div className="drawer-sticky-header">
        <Header onClose={onClose} />
        
        {/* Main Navigation Tabs */}
        <nav className="main-tabs">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              className={cx('main-tab', { active: activeMainTab === tab.id })}
              onClick={() => setActiveMainTab(tab.id)}
            >
              <span className="main-tab-icon">{tab.icon}</span>
              <span className="main-tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <PromptProvider>
        {activeMainTab === 'keywords' && (
          <KeywordsContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            filteredSubcategories={filteredSubcategories}
            resultsCount={resultsCount}
            currentCategory={currentCategory}
            activeSubcategory={activeSubcategory}
            setActiveSubcategory={setActiveSubcategory}
          />
        )}

        {activeMainTab === 'enhance' && <EnhanceContent />}

        {activeMainTab === 'about' && (
          <div className="drawer-content">
            <AboutTab />
          </div>
        )}
      </PromptProvider>
    </div>
  );
}

