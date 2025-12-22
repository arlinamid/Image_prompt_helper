# Build Instructions

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
```

## Development

Build the extension:

```bash
npm run build
```

Watch mode (auto-rebuild on changes):

```bash
npm run watch
```

## Loading the Extension

1. Run `npm run build`
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

## Project Structure

```
src/
├── components/      # React components
├── content-script/  # Extension entry point
├── context/         # React context providers
├── data/            # JSON data files
├── hooks/           # Custom React hooks
├── services/        # API services (Gemini)
├── styles/          # CSS styles
└── utils/           # Helper utilities
```

## Supported Sites

- Bing Image Creator
- tengr.ai
- Leonardo.ai
- ChatGPT
- Gemini


