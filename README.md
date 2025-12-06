# 🎨 Image Prompt Helper

<p align="center">
  <img src="icon128.png" alt="Image Prompt Helper Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A curated library of 3,143 prompt keywords + AI enhancement for AI image generation</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#supported-sites">Supported Sites</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#ai-enhancement">AI Enhancement</a> •
  <a href="#development">Development</a>
</p>

---

## ✨ Features

- **📚 3,143 Curated Keywords** - Organized across 7 categories with thumbnail previews
- **🤖 AI Prompt Enhancement** - Powered by Google Gemini to improve your prompts
- **🎲 Prompt Variations** - Generate creative alternatives for your ideas
- **🔍 Smart Search** - Find the perfect keyword instantly
- **⚡ Optimized Performance** - Lazy loading with Intersection Observer
- **🎯 Click to Add** - One-click keyword insertion into prompt fields
- **🌐 Multi-Site Support** - Works on popular AI image generators

## 📊 Keyword Categories

| Category | Keywords | Description |
|----------|----------|-------------|
| **Basic Element** | 711 | Styles, eras, lighting, moods, colors |
| **Digital Art** | 57 | Digital art styles and techniques |
| **Photography** | 162 | Camera settings, photo styles |
| **Character Design** | 103 | Character traits and poses |
| **Fashion** | 210 | Clothing, accessories, fashion styles |
| **Architecture** | 168 | Building styles, interior design |
| **Artists** | 1,732 | Famous artists for style references |

## 🌐 Supported Sites

| Site | URL | Status |
|------|-----|--------|
| **Bing Image Creator** | bing.com | ✅ |
| **tengr.ai** | tengr.ai | ✅ |
| **Leonardo.ai** | app.leonardo.ai | ✅ (Both modes) |
| **ChatGPT** | chatgpt.com | ✅ |
| **Google Gemini** | gemini.google.com | ✅ |
| **Ideogram** | ideogram.ai | ✅ |

## 📦 Installation

### From Source (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/arlinamid/Image_prompt_helper.git
   cd Image_prompt_helper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build for your browser**
   ```bash
   # Build for Chrome (default)
   npm run build:chrome
   
   # Build for Firefox
   npm run build:firefox
   
   # Build for Opera
   npm run build:opera
   
   # Build for all browsers
   npm run build:all
   ```

4. **Load the extension**

   **Chrome:**
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `dist-chrome` folder

   **Firefox:**
   - Open `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select `dist-firefox/manifest.json`

   **Opera:**
   - Open `opera://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `dist-opera` folder

## 🚀 Usage

### Keywords Tab
1. Click the floating **"Prompts"** button on any supported site
2. Browse categories using the grid tabs
3. Use the search bar to find specific keywords
4. **Click any keyword card** to add it to your prompt
5. Click again to remove

### AI Enhance Tab
1. Type your base prompt in the site's input field
2. Switch to the **AI Enhance** tab
3. Click **"Enhance with AI"** for an improved prompt
4. Or click **"Generate 3 Variations"** for alternatives
5. Click **"Apply"** to use the enhanced prompt

### About Tab
- View help and documentation
- See supported sites
- Access setup instructions
- Find support links

## 🔑 AI Enhancement Setup

The AI enhancement feature uses Google Gemini API (free tier available):

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a free API key
3. Open the extension → **AI Enhance** tab
4. Click **"Set Up API Key"**
5. Paste your key and save

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm

### Scripts

```bash
# Install dependencies
npm install

# Build for specific browser
npm run build:chrome    # Chrome/Chromium
npm run build:firefox   # Firefox
npm run build:opera     # Opera

# Build for all browsers
npm run build:all

# Watch mode (auto-rebuild on changes)
npm run watch:chrome
npm run watch:firefox
npm run watch:opera
```

### Project Structure

```
Image_prompt_helper/
├── src/
│   ├── components/      # React components
│   │   ├── App.jsx
│   │   ├── Drawer.jsx
│   │   ├── Header.jsx
│   │   ├── SearchBar.jsx
│   │   ├── CategoryTabs.jsx
│   │   ├── SubcategoryNav.jsx
│   │   ├── Subcategory.jsx
│   │   ├── Keyword.jsx
│   │   ├── PromptEnhancer.jsx
│   │   ├── ApiKeyModal.jsx
│   │   ├── AboutTab.jsx
│   │   └── FloatingButton.jsx
│   ├── content-script/  # Extension entry point
│   ├── context/         # React context (PromptContext)
│   ├── data/            # Keywords database (categories.json)
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services (Gemini)
│   ├── styles/          # CSS styles
│   └── utils/           # Helper utilities
├── assets/images/       # Keyword thumbnails
├── dist/                # Built extension (load this in Chrome)
├── manifest.json        # Chrome extension manifest (root loading)
├── manifest.dist.json   # Chrome extension manifest (dist loading)
├── vite.config.js       # Vite build configuration
└── package.json         # npm dependencies
```

### Tech Stack

- **React 18** - UI components
- **Vite** - Build tool
- **Google Gemini API** - AI enhancement
- **Chrome Extension Manifest V3**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 Credits

- **Developer**: [@arlinamid](https://github.com/arlinamid)
- **Original Idea**: [Ariel Verber](https://twitter.com/arielopie)
- **Thumbnails**: imiprompt.com, DALL-E, Stable Diffusion

## 💖 Support

If you find this tool helpful, consider supporting the development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/arlinamid)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for the AI Art community
</p>
