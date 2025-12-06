import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Custom plugin to handle Chrome extension specific needs
function chromeExtensionPlugin() {
  return {
    name: 'chrome-extension',
    writeBundle() {
      // Copy manifest to dist
      const manifest = JSON.parse(fs.readFileSync('manifest.dist.json', 'utf-8'));
      fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
      
      // Copy icons
      fs.copyFileSync('icon48.png', 'dist/icon48.png');
      fs.copyFileSync('icon128.png', 'dist/icon128.png');
      
      // Copy popup folder
      if (!fs.existsSync('dist/src/popup')) {
        fs.mkdirSync('dist/src/popup', { recursive: true });
      }
      fs.copyFileSync('src/popup/popup.html', 'dist/src/popup/popup.html');
      
      // Copy images folder
      if (fs.existsSync('assets/images')) {
        fs.cpSync('assets/images', 'dist/assets/images', { recursive: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), chromeExtensionPlugin()],
  build: {
    outDir: 'dist',
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
    // Chrome extensions need this for content scripts
    cssCodeSplit: false,
    sourcemap: false,
    minify: 'esbuild',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});

