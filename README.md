# 🎨 Image Prompt Helper

<p align="center">
  <img src="icon128.png" alt="Image Prompt Helper Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A curated library of 3,143 prompt keywords + AI enhancement for AI image generation</strong>
</p>

<p align="center">
  <a href="https://github.com/arlinamid/Image_prompt_helper/releases/latest">
    <img src="https://img.shields.io/github/v/release/arlinamid/Image_prompt_helper?style=flat-square&color=00f0ff" alt="Latest Release">
  </a>
  <a href="https://github.com/arlinamid/Image_prompt_helper/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/arlinamid/Image_prompt_helper?style=flat-square&color=ff006e" alt="License">
  </a>
  <img src="https://img.shields.io/badge/Chrome-MV3-green?style=flat-square&logo=googlechrome" alt="Chrome MV3">
  <img src="https://img.shields.io/badge/Firefox-MV2-orange?style=flat-square&logo=firefox" alt="Firefox MV2">
  <img src="https://img.shields.io/badge/Opera-MV3-red?style=flat-square&logo=opera" alt="Opera MV3">
</p>

<p align="center">
  <a href="#-quick-download">Download</a> •
  <a href="#-features">Features</a> •
  <a href="#-supported-sites">Supported Sites</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-development">Development</a>
</p>

---

## 📥 Quick Download

| Browser | Download | Manifest |
|---------|----------|----------|
| **Chrome / Edge / Brave** | [📦 Download](https://github.com/arlinamid/Image_prompt_helper/releases/latest/download/Image_prompt_helper_v1.2.0_chrome.zip) | V3 |
| **Firefox** | [📦 Download](https://github.com/arlinamid/Image_prompt_helper/releases/latest/download/Image_prompt_helper_v1.2.0_firefox.zip) | V2 |
| **Opera** | [📦 Download](https://github.com/arlinamid/Image_prompt_helper/releases/latest/download/Image_prompt_helper_v1.2.0_opera.zip) | V3 |

> 💡 **Tip:** Extract the zip, then load as unpacked extension in your browser.

---

## ✨ Features

- **📚 3,143 Curated Keywords** - Organized across 7 categories with thumbnail previews
- **🤖 AI Prompt Enhancement** - Powered by Google Gemini to improve your prompts
- **🎲 Prompt Variations** - Generate creative alternatives for your ideas
- **🔍 Smart Search** - Find the perfect keyword instantly
- **⚡ Optimized Performance** - Lazy loading with Intersection Observer
- **🎯 Click to Add** - One-click keyword insertion into prompt fields
- **🌐 Multi-Browser Support** - Works on Chrome, Firefox, and Opera

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
| **Leonardo.ai** | app.leonardo.ai | ✅ (Legacy + Normal) |
| **ChatGPT** | chatgpt.com | ✅ |
| **Google Gemini** | gemini.google.com | ✅ |
| **Ideogram** | ideogram.ai | ✅ |

## 📦 Installation

### Option 1: Download Release (Easiest)

1. Download the zip for your browser from [Releases](https://github.com/arlinamid/Image_prompt_helper/releases/latest)
2. Extract the zip file
3. Load in your browser:

   | Browser | Steps |
   |---------|-------|
   | **Chrome** | `chrome://extensions` → Enable Developer mode → Load unpacked → Select folder |
   | **Firefox** | `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → Select `manifest.json` |
   | **Opera** | `opera://extensions` → Enable Developer mode → Load unpacked → Select folder |

### Option 2: Build from Source

```bash
# Clone repository
git clone https://github.com/arlinamid/Image_prompt_helper.git
cd Image_prompt_helper

# Install dependencies
npm install

# Build for your browser
npm run build:chrome    # Chrome/Edge/Brave
npm run build:firefox   # Firefox
npm run build:opera     # Opera
npm run build:all       # All browsers
```

Output folders: `dist-chrome/`, `dist-firefox/`, `dist-opera/`

## 🚀 Usage

### 🎨 Keywords Tab
1. Click the floating **"Prompts"** button on any supported site
2. Browse **7 categories** using the grid tabs
3. Use **search** to find specific keywords
4. **Click any keyword** to add it to your prompt
5. Click again to remove

### ✨ AI Enhance Tab
1. Type your base prompt in the site's input field
2. Switch to the **AI Enhance** tab
3. Click **"Enhance with AI"** for an improved prompt
4. Or click **"Generate 3 Variations"** for alternatives
5. Click **"Apply"** to use the result

### ℹ️ About Tab
- Help documentation
- Supported sites list
- API setup instructions
- Support links

## 🔑 AI Enhancement Setup

The AI enhancement feature uses **Google Gemini API** (free tier available):

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
npm install              # Install dependencies

npm run build:chrome     # Build for Chrome/Chromium
npm run build:firefox    # Build for Firefox
npm run build:opera      # Build for Opera
npm run build:all        # Build all browsers

npm run watch:chrome     # Watch mode for Chrome
npm run watch:firefox    # Watch mode for Firefox
npm run watch:opera      # Watch mode for Opera
```

### Project Structure

```
Image_prompt_helper/
├── src/
│   ├── components/        # React UI components
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
│   ├── content-script/    # Extension entry point
│   ├── context/           # React context (PromptContext)
│   ├── data/              # Keywords database (categories.json)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services (Gemini)
│   ├── styles/            # CSS styles
│   └── utils/
│       ├── helpers.js     # Utility functions
│       └── browser-api.js # Cross-browser compatibility
├── assets/images/         # Keyword thumbnails (3,145 images)
├── manifest.chrome.json   # Chrome Manifest V3
├── manifest.firefox.json  # Firefox Manifest V2
├── manifest.opera.json    # Opera Manifest V3
├── vite.config.js         # Vite build configuration
└── package.json           # npm dependencies
```

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI components |
| **Vite** | Build tool |
| **Google Gemini API** | AI enhancement |
| **Manifest V3** | Chrome/Opera |
| **Manifest V2** | Firefox |

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

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for the AI Art community
</p>
