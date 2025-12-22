import React, { useState, useEffect, useCallback } from 'react';
import { FloatingButton } from './FloatingButton';
import { Drawer } from './Drawer';
import { ImageEditorModal } from './ImageEditorModal';
import { useShrinkContainer } from '../hooks';
import { attachImageToPrompt } from '../utils/imageAttacher';
import { runtime } from '../utils/browser-api';

/**
 * Main application component
 */
export function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImageUrl, setEditorImageUrl] = useState('');

  useShrinkContainer(isDrawerOpen);

  // Listen for messages from background script (context menu)
  useEffect(() => {
    const handleMessage = (message, sender, sendResponse) => {
      if (message.type === 'OPEN_IMAGE_EDITOR') {
        const imageUrl = message.imageUrl;

        // Find the img element on the page
        const imgElement = document.querySelector(`img[src="${imageUrl}"]`) ||
          document.querySelector(`img[src^="${imageUrl.split('?')[0]}"]`);

        if (imgElement) {
          // Get screen coordinates
          const rect = imgElement.getBoundingClientRect();

          if (rect.width === 0 || rect.height === 0) {
            console.error('Image has 0 dimensions');
            setEditorImageUrl(imageUrl);
            setIsEditorOpen(true);
            sendResponse({ success: true });
            return true;
          }

          // Hybrid Strategy:
          // 1. Try to fetch the "clean" original image via a temporary background tab
          //    (This handles hotlinking, auth cookies, and avoids UI overlays)
          // 2. If that fails, fallback to screenshot capture (which might have UI overlays)

          const tryScreenshotCapture = () => {
            // Request screenshot from background script
            runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB' })
              .then(response => {
                if (response && response.success && response.dataUrl) {
                  // Crop the screenshot
                  const screenshot = new Image();
                  screenshot.onload = () => {
                    try {
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');

                      // Handle device pixel ratio (Retina displays)
                      const dpr = window.devicePixelRatio || 1;

                      // Set canvas size to image size (logical pixels)
                      canvas.width = rect.width;
                      canvas.height = rect.height;

                      // Draw cropped portion from screenshot
                      ctx.drawImage(
                        screenshot,
                        rect.left * dpr,
                        rect.top * dpr,
                        rect.width * dpr,
                        rect.height * dpr,
                        0,
                        0,
                        rect.width,
                        rect.height
                      );

                      setEditorImageUrl(canvas.toDataURL('image/png'));
                      setIsEditorOpen(true);
                    } catch (e) {
                      console.error('Cropping failed:', e);
                      setEditorImageUrl(imageUrl);
                      setIsEditorOpen(true);
                    }
                  };
                  screenshot.onerror = () => {
                    console.error('Failed to load screenshot');
                    setEditorImageUrl(imageUrl);
                    setIsEditorOpen(true);
                  };
                  screenshot.src = response.dataUrl;
                } else {
                  console.error('Screenshot capture failed fallback:', response?.error);
                  setEditorImageUrl(imageUrl);
                  setIsEditorOpen(true);
                }
              })
              .catch(error => {
                console.error('Communication error:', error);
                setEditorImageUrl(imageUrl);
                setIsEditorOpen(true);
              });
          };

          // Attempt Fetch via Tab (Cleanest method)
          if (imageUrl.startsWith('data:')) {
            setEditorImageUrl(imageUrl);
            setIsEditorOpen(true);
          } else {
            runtime.sendMessage({
              type: 'FETCH_IMAGE_VIA_TAB',
              imageUrl
            })
              .then(response => {
                if (response && response.success && response.dataUrl) {
                  // Success! Use clean image
                  setEditorImageUrl(response.dataUrl);
                  setIsEditorOpen(true);
                } else {
                  console.warn('Tab fetch failed, falling back to screenshot:', response?.error);
                  tryScreenshotCapture();
                }
              })
              .catch(err => {
                console.warn('Tab fetch error, falling back to screenshot:', err);
                tryScreenshotCapture();
              });
          }

          sendResponse({ success: true, method: 'tab-fetch' });
        } else {
          // Image element not found, use URL directly
          console.warn('Image element not found in DOM, using URL');
          setEditorImageUrl(imageUrl);
          setIsEditorOpen(true);
          sendResponse({ success: true, warning: 'Image not in DOM' });
        }
      }
      return true;
    };

    runtime.onMessage.addListener(handleMessage);
    return () => {
      runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // Handle attaching edited image to prompt
  const handleAttach = useCallback(async ({ originalBlob, modifiedBlob, instructions }) => {
    const success = await attachImageToPrompt({ originalBlob, modifiedBlob, instructions });
    if (success) {
      setIsEditorOpen(false);
      setEditorImageUrl('');
    } else {
      console.error('Failed to attach images to prompt');
    }
  }, []);

  // Handle closing the editor
  const handleCloseEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditorImageUrl('');
  }, []);

  return (
    <>
      <FloatingButton
        onClick={() => setIsDrawerOpen(true)}
        isHidden={isDrawerOpen}
      />
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <ImageEditorModal
        isOpen={isEditorOpen}
        imageUrl={editorImageUrl}
        onClose={handleCloseEditor}
        onAttach={handleAttach}
      />
    </>
  );
}


