import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Get target browser from environment variable or default to 'chrome'
const targetBrowser = process.env.BROWSER || 'chrome';
const validBrowsers = ['chrome', 'firefox', 'opera'];

if (!validBrowsers.includes(targetBrowser)) {
  console.error(`Invalid browser: ${targetBrowser}. Valid options: ${validBrowsers.join(', ')}`);
  process.exit(1);
}

console.log(`Building for: ${targetBrowser}`);

// Custom plugin to handle browser-specific extension needs
function browserExtensionPlugin(browser) {
  return {
    name: 'browser-extension',
    writeBundle() {
      const outDir = `dist-${browser}`;
      
      // Copy browser-specific manifest
      const manifestFile = `manifest.${browser}.json`;
      if (fs.existsSync(manifestFile)) {
        const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
        fs.writeFileSync(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));
      }
      
      // Copy icons
      fs.copyFileSync('icon48.png', `${outDir}/icon48.png`);
      fs.copyFileSync('icon128.png', `${outDir}/icon128.png`);
      
      // Copy popup folder
      if (!fs.existsSync(`${outDir}/src/popup`)) {
        fs.mkdirSync(`${outDir}/src/popup`, { recursive: true });
      }
      fs.copyFileSync('src/popup/popup.html', `${outDir}/src/popup/popup.html`);
      
      // Copy images folder
      if (fs.existsSync('assets/images')) {
        fs.cpSync('assets/images', `${outDir}/assets/images`, { recursive: true });
      }
      
      console.log(`✓ Built extension for ${browser} in ${outDir}/`);
    },
  };
}

export default defineConfig({
  plugins: [react(), browserExtensionPlugin(targetBrowser)],
  build: {
    outDir: `dist-${targetBrowser}`,
    emptyDirBeforeWrite: true,
    rollupOptions: {
      input: {
        contentScript: resolve(__dirname, 'src/content-script/index.jsx'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    cssCodeSplit: false,
    sourcemap: false,
    minify: 'esbuild',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
