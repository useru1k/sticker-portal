'use client';

import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { CanvasLayer, StickerState } from '../../types/sticker';
import { createStickerComposite, hexToRgba } from '../../lib/sticker-effects';

export interface CanvasHandle {
  getCompositeCanvas: () => Promise<HTMLCanvasElement>;
}

interface InteractiveCanvasProps {
  state: StickerState;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, partial: Partial<CanvasLayer>) => void;
}

export const InteractiveCanvas = forwardRef<CanvasHandle, InteractiveCanvasProps>(({
  state,
  onSelectLayer,
  onUpdateLayer,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cached loaded images
  const imageElementsRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Interactive transform state
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<'move' | 'rotate' | 'scale' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [layerInitialState, setLayerInitialState] = useState<CanvasLayer | null>(null);

  // Load and cache image assets
  useEffect(() => {
    state.layers.forEach((layer) => {
      if (layer.type === 'image') {
        const src = layer.isCutoutActive !== false && layer.cutoutImageSrc
          ? layer.cutoutImageSrc
          : layer.imageSrc || layer.originalImageSrc;

        if (src && !imageElementsRef.current.has(src)) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            imageElementsRef.current.set(src, img);
            renderCanvas();
          };
          img.src = src;
        }
      }
    });
  }, [state.layers]);

  /**
   * Main Composite Generator (Used for live canvas and export)
   */
  const generateComposite = useCallback(async (scaleMultiplier: number = 1): Promise<HTMLCanvasElement> => {
    const width = state.canvasWidth * scaleMultiplier;
    const height = state.canvasHeight * scaleMultiplier;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return exportCanvas;

    ctx.scale(scaleMultiplier, scaleMultiplier);

    // Render layers in order
    for (const layer of state.layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scaleX, layer.scaleY);
      ctx.globalAlpha = layer.opacity / 100;

      if (layer.type === 'image') {
        const activeSrc = layer.isCutoutActive !== false && layer.cutoutImageSrc
          ? layer.cutoutImageSrc
          : layer.imageSrc || layer.originalImageSrc;

        if (activeSrc) {
          let img = imageElementsRef.current.get(activeSrc);
          if (!img) {
            // Wait for image load if not cached yet
            img = await new Promise<HTMLImageElement>((resolve) => {
              const newImg = new Image();
              newImg.crossOrigin = 'anonymous';
              newImg.onload = () => resolve(newImg);
              newImg.src = activeSrc;
            });
            imageElementsRef.current.set(activeSrc, img);
          }

          if (img) {
            // Apply die-cut white border + shadow + finish
            const stickerImg = await createStickerComposite(
              img,
              state.border,
              state.shadow,
              state.finish,
              state.finishIntensity,
              state.filters
            );

            ctx.drawImage(
              stickerImg,
              -layer.width / 2,
              -layer.height / 2,
              layer.width,
              layer.height
            );
          }
        }
      } else if (layer.type === 'text' && layer.text) {
        renderTextLayer(ctx, layer);
      } else if (layer.type === 'decoration' && layer.emoji) {
        renderEmojiLayer(ctx, layer);
      }

      ctx.restore();
    }

    return exportCanvas;
  }, [state]);

  // Expose composite getter to parent for exports
  useImperativeHandle(ref, () => ({
    getCompositeCanvas: () => generateComposite(2), // 2x high resolution
  }));

  /**
   * Render Canvas Loop
   */
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background mode if not transparent
    if (state.canvasBackground === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.canvasBackground === 'dark') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Render all layers
    for (const layer of state.layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scaleX, layer.scaleY);
      ctx.globalAlpha = layer.opacity / 100;

      if (layer.type === 'image') {
        const activeSrc = layer.isCutoutActive !== false && layer.cutoutImageSrc
          ? layer.cutoutImageSrc
          : layer.imageSrc || layer.originalImageSrc;

        if (activeSrc) {
          const img = imageElementsRef.current.get(activeSrc);
          if (img) {
            const stickerImg = await createStickerComposite(
              img,
              state.border,
              state.shadow,
              state.finish,
              state.finishIntensity,
              state.filters
            );

            ctx.drawImage(
              stickerImg,
              -layer.width / 2,
              -layer.height / 2,
              layer.width,
              layer.height
            );
          }
        }
      } else if (layer.type === 'text' && layer.text) {
        renderTextLayer(ctx, layer);
      } else if (layer.type === 'decoration' && layer.emoji) {
        renderEmojiLayer(ctx, layer);
      }

      ctx.restore();

      // Draw active selection bounding box & handles
      if (layer.id === state.selectedLayerId) {
        drawSelectionBox(ctx, layer);
      }
    }
  }, [state]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  /**
   * Helper: Render Text Layer with Arch Curve & Outlines
   */
  const renderTextLayer = (ctx: CanvasRenderingContext2D, layer: CanvasLayer) => {
    const text = layer.text || '';
    const fontSize = layer.fontSize || 48;
    const fontFamily = layer.fontFamily || 'Impact, sans-serif';
    const fill = layer.textColor || '#ffffff';
    const stroke = layer.textBorderColor || '#000000';
    const strokeWidth = layer.textBorderWidth || 0;
    const curve = layer.curve || 0;

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (curve !== 0) {
      // Arched / Curved Text
      const radius = 300 / (curve / 40);
      const angleStep = fontSize / (Math.abs(radius) * 1.8);
      const startAngle = -(text.length - 1) * angleStep * 0.5;

      ctx.save();
      for (let i = 0; i < text.length; i++) {
        const angle = startAngle + i * angleStep;
        ctx.save();
        ctx.translate(Math.sin(angle) * radius, -Math.cos(angle) * radius + (curve > 0 ? radius : -radius));
        ctx.rotate(angle);

        if (strokeWidth > 0) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = strokeWidth * 2;
          ctx.lineJoin = 'round';
          ctx.strokeText(text[i], 0, 0);
        }
        ctx.fillStyle = fill;
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }
      ctx.restore();
    } else {
      // Straight text with stroke
      if (strokeWidth > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth * 2;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, 0, 0);
      }
      ctx.fillStyle = fill;
      ctx.fillText(text, 0, 0);
    }
  };

  /**
   * Helper: Render Emoji / Badge Layer
   */
  const renderEmojiLayer = (ctx: CanvasRenderingContext2D, layer: CanvasLayer) => {
    const size = layer.width;
    ctx.font = `${size * 0.8}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(layer.emoji || '', 0, 0);
  };

  /**
   * Helper: Draw Selection Box & Handles
   */
  const drawSelectionBox = (ctx: CanvasRenderingContext2D, layer: CanvasLayer) => {
    ctx.save();
    ctx.translate(layer.x, layer.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);

    const halfW = (layer.width * layer.scaleX) / 2;
    const halfH = (layer.height * layer.scaleY) / 2;

    // Bounding line
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-halfW - 8, -halfH - 8, (halfW + 8) * 2, (halfH + 8) * 2);
    ctx.setLineDash([]);

    // Corner Scale Handles
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;

    const handles = [
      [-halfW - 8, -halfH - 8],
      [halfW + 8, -halfH - 8],
      [halfW + 8, halfH + 8],
      [-halfW - 8, halfH + 8],
    ];

    handles.forEach(([hx, hy]) => {
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Top Rotation Handle
    ctx.beginPath();
    ctx.moveTo(0, -halfH - 8);
    ctx.lineTo(0, -halfH - 24);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -halfH - 24, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#a855f7';
    ctx.fill();

    ctx.restore();
  };

  /**
   * Mouse Event Handlers for Dragging & Transforming
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check hit on rotation handle of selected layer
    const selectedLayer = state.layers.find((l) => l.id === state.selectedLayerId);
    if (selectedLayer) {
      const halfH = (selectedLayer.height * selectedLayer.scaleY) / 2;
      const rotHandleX = selectedLayer.x;
      const rotHandleY = selectedLayer.y - halfH - 24;
      const distRot = Math.hypot(clickX - rotHandleX, clickY - rotHandleY);
      if (distRot < 20) {
        setIsDragging(true);
        setDragAction('rotate');
        setDragStart({ x: clickX, y: clickY });
        setLayerInitialState({ ...selectedLayer });
        return;
      }
    }

    // Check click on layers from top to bottom
    const hitLayer = [...state.layers].reverse().find((layer) => {
      if (!layer.visible || layer.locked) return false;
      const halfW = (layer.width * layer.scaleX) / 2 + 10;
      const halfH = (layer.height * layer.scaleY) / 2 + 10;
      return (
        clickX >= layer.x - halfW &&
        clickX <= layer.x + halfW &&
        clickY >= layer.y - halfH &&
        clickY <= layer.y + halfH
      );
    });

    if (hitLayer) {
      onSelectLayer(hitLayer.id);
      setIsDragging(true);
      setDragAction('move');
      setDragStart({ x: clickX, y: clickY });
      setLayerInitialState({ ...hitLayer });
    } else {
      onSelectLayer(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !state.selectedLayerId || !layerInitialState) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const currY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (dragAction === 'move') {
      const dx = currX - dragStart.x;
      const dy = currY - dragStart.y;
      onUpdateLayer(state.selectedLayerId, {
        x: Math.round(layerInitialState.x + dx),
        y: Math.round(layerInitialState.y + dy),
      });
    } else if (dragAction === 'rotate') {
      const angle = Math.atan2(currY - layerInitialState.y, currX - layerInitialState.x) * (180 / Math.PI) + 90;
      onUpdateLayer(state.selectedLayerId, {
        rotation: Math.round(angle),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragAction(null);
    setLayerInitialState(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${
        state.canvasBackground === 'checker' ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-slate-950 dark:[radial-gradient(#334155_1px,transparent_1px)]' : ''
      }`}
    >
      <div
        style={{
          transform: `scale(${state.zoom})`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800"
      >
        <canvas
          ref={canvasRef}
          width={state.canvasWidth}
          height={state.canvasHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-crosshair block"
        />
      </div>
    </div>
  );
});

InteractiveCanvas.displayName = 'InteractiveCanvas';
