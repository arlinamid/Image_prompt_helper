import React, { useRef, useEffect, useState, useCallback } from 'react';
import { runtime } from '../utils/browser-api';

/**
 * Image Editor Modal Component
 * Allows users to draw on images and add instructions before attaching to prompt
 */
export function ImageEditorModal({ isOpen, imageUrl, onClose, onAttach }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [instructions, setInstructions] = useState('');
    const [brushColor, setBrushColor] = useState('#ff0000');
    const [brushSize, setBrushSize] = useState(5);
    const [tool, setTool] = useState('brush'); // 'brush' or 'rect'
    const [startPos, setStartPos] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [originalImage, setOriginalImage] = useState(null);
    const [loadError, setLoadError] = useState('');

    // Load image onto canvas
    useEffect(() => {
        if (!isOpen || !imageUrl || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        setImageLoaded(false);
        setLoadError('');

        // Helper to load image from source
        const loadFromSource = (src) => {
            const img = new Image();
            img.onload = () => {
                // Scale image to fit container while maintaining aspect ratio
                const maxWidth = 800;
                const maxHeight = 600;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (maxHeight / height) * width;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                setOriginalImage(img);
                setImageLoaded(true);
            };
            img.onerror = () => {
                setLoadError('Failed to render image');
                setImageLoaded(false);
            };
            img.src = src;
        };

        // If it's already a data URL (from screenshot capture), use it directly
        if (imageUrl.startsWith('data:')) {
            loadFromSource(imageUrl);
            return;
        }

        // Otherwise try to fetch via background script to bypass CORS
        runtime.sendMessage({ type: 'GET_IMAGE_DATA', imageUrl })
            .then((response) => {
                if (response && response.success && response.dataUrl) {
                    loadFromSource(response.dataUrl);
                } else {
                    // Fallback to direct URL
                    console.warn('Background fetch failed, trying direct load');
                    const img = new Image();
                    img.crossOrigin = 'anonymous'; // Try anonymous for public images
                    img.onload = () => {
                        loadFromSource(img.src);
                    };
                    img.onerror = () => {
                        // If crossOrigin fails, try without it (tainted canvas, but displays)
                        setLoadError('Failed to load image (CORS blocked).');
                        setImageLoaded(false);
                    };
                    img.src = imageUrl;
                }
            })
            .catch((error) => {
                console.error('Error fetching image via background:', error);
                setLoadError('Failed to fetch image: ' + error.message);
            });
    }, [isOpen, imageUrl]);

    // Get canvas coordinates from mouse/touch event
    const getCoords = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }, []);

    // Drawing handlers
    const startDrawing = useCallback((e) => {
        e.preventDefault();
        const coords = getCoords(e);
        setIsDrawing(true);
        setStartPos(coords);

        if (tool === 'brush') {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        }
    }, [tool, getCoords]);

    const draw = useCallback((e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const coords = getCoords(e);

        if (tool === 'brush') {
            ctx.strokeStyle = brushColor;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        }
    }, [isDrawing, tool, brushColor, brushSize, getCoords]);

    const stopDrawing = useCallback((e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const coords = getCoords(e);

        if (tool === 'rect' && startPos) {
            ctx.strokeStyle = brushColor;
            ctx.lineWidth = brushSize;
            ctx.strokeRect(
                startPos.x,
                startPos.y,
                coords.x - startPos.x,
                coords.y - startPos.y
            );
        }

        setIsDrawing(false);
        setStartPos(null);
        ctx.beginPath();
    }, [isDrawing, tool, startPos, brushColor, brushSize, getCoords]);

    // Clear canvas and redraw original image
    const handleClear = useCallback(() => {
        if (!canvasRef.current || !originalImage) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    }, [originalImage]);

    // Handle attach button
    const handleAttach = useCallback(() => {
        if (!canvasRef.current || !originalImage) return;

        // 1. Get Modified Image Blob (Instruction Image)
        canvasRef.current.toBlob((modifiedBlob) => {
            if (!modifiedBlob) return;

            // 2. Get Original Image Blob (Original Image)
            // Draw original image to a temp canvas to convert to Blob
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasRef.current.width;
            tempCanvas.height = canvasRef.current.height;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(originalImage, 0, 0, tempCanvas.width, tempCanvas.height);

            tempCanvas.toBlob((originalBlob) => {
                if (originalBlob) {
                    onAttach({
                        originalBlob,
                        modifiedBlob,
                        instructions: instructions.trim()
                    });
                }
            }, 'image/jpeg', 0.95);

        }, 'image/jpeg', 0.95);
    }, [instructions, onAttach, originalImage]);

    if (!isOpen) return null;

    return (
        <div
            className="image-editor-overlay"
            onClick={(e) => {
                // Prepare robust close: only if clicking the overlay directly
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="image-editor-modal"
                onClick={(e) => e.stopPropagation()}
                ref={containerRef}
            >
                <div className="image-editor-header">
                    <h2>Edit Image</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="image-editor-toolbar">
                    <div className="tool-group">
                        <button
                            className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
                            onClick={() => setTool('brush')}
                            title="Brush"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                                <path d="M2 2l7.586 7.586" />
                                <circle cx="11" cy="11" r="2" />
                            </svg>
                        </button>
                        <button
                            className={`tool-btn ${tool === 'rect' ? 'active' : ''}`}
                            onClick={() => setTool('rect')}
                            title="Rectangle Selection"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            </svg>
                        </button>
                    </div>

                    <div className="tool-group">
                        <label>Color:</label>
                        <input
                            type="color"
                            value={brushColor}
                            onChange={(e) => setBrushColor(e.target.value)}
                        />
                    </div>

                    <div className="tool-group">
                        <label>Size:</label>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        />
                        <span>{brushSize}px</span>
                    </div>

                    <button className="tool-btn clear-btn" onClick={handleClear}>
                        Clear
                    </button>
                </div>

                <div className="image-editor-canvas-container">
                    {!imageLoaded && !loadError && (
                        <div className="loading-placeholder">Loading image...</div>
                    )}
                    {loadError && (
                        <div className="loading-placeholder" style={{ color: '#ff6b6b' }}>{loadError}</div>
                    )}
                    <canvas
                        ref={canvasRef}
                        className="image-editor-canvas"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>

                <div className="image-editor-instructions">
                    <label htmlFor="instructions-input">Instructions:</label>
                    <textarea
                        id="instructions-input"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Describe what changes you want (e.g., 'Make this area blue', 'Add a tree here')..."
                        rows={3}
                    />
                </div>

                <div className="image-editor-actions">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="attach-btn"
                        onClick={handleAttach}
                        disabled={!imageLoaded}
                    >
                        Attach to Prompt
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImageEditorModal;
