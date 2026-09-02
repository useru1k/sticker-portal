'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Sliders, 
  Sparkles, 
  Type, 
  Smile, 
  Layers, 
  RotateCcw, 
  RotateCw,
  Plus
} from 'lucide-react';

import { CanvasLayer, DecorationItem, StickerState } from '../types/sticker';
import { SAMPLE_IMAGES, STYLE_PRESETS, StylePreset } from '../lib/sample-data';
import { Navbar } from '../components/Navbar';
import { InteractiveCanvas, CanvasHandle } from '../components/canvas/InteractiveCanvas';
import { UploadPanel } from '../components/panels/UploadPanel';
import { BorderEffectsPanel } from '../components/panels/BorderEffectsPanel';
import { EffectsTexturePanel } from '../components/panels/EffectsTexturePanel';
import { TextPanel } from '../components/panels/TextPanel';
import { DecorationsPanel } from '../components/panels/DecorationsPanel';
import { LayersPanel } from '../components/panels/LayersPanel';
import { ExportModal } from '../components/export/ExportModal';
import { StickerSheetModal } from '../components/export/StickerSheetModal';

const INITIAL_STATE: StickerState = {
  layers: [
    {
      id: 'layer-main-image',
      name: 'Happy Shiba',
      type: 'image',
      x: 350,
      y: 320,
      width: 440,
      height: 440,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 100,
      visible: true,
      locked: false,
      imageSrc: SAMPLE_IMAGES[0].url,
      originalImageSrc: SAMPLE_IMAGES[0].url,
      isCutoutActive: true,
    },
    {
      id: 'layer-text-1',
      name: 'Sticker Text',
      type: 'text',
      x: 350,
      y: 540,
      width: 300,
      height: 80,
      rotation: -4,
      scaleX: 1,
      scaleY: 1,
      opacity: 100,
      visible: true,
      locked: false,
      text: 'GOOD VIBES',
      fontFamily: 'Impact, sans-serif',
      fontSize: 52,
      textColor: '#ffffff',
      textBorderColor: '#0f172a',
      textBorderWidth: 5,
      curve: 12,
    },
    {
      id: 'layer-sparkle-1',
      name: 'Sparkles',
      type: 'decoration',
      x: 520,
      y: 180,
      width: 70,
      height: 70,
      rotation: 15,
      scaleX: 1,
      scaleY: 1,
      opacity: 100,
      visible: true,
      locked: false,
      emoji: '✨',
    }
  ],
  selectedLayerId: 'layer-main-image',
  border: {
    enabled: true,
    width: 18,
    color: '#ffffff',
    smoothing: 10,
    secondaryEnabled: false,
    secondaryWidth: 6,
    secondaryColor: '#1e293b',
    dashed: false,
    glow: false,
    glowColor: '#ffffff',
    glowBlur: 15,
  },
  shadow: {
    enabled: true,
    offsetX: 6,
    offsetY: 10,
    blur: 20,
    color: '#000000',
    opacity: 35,
  },
  finish: 'gloss',
  finishIntensity: 80,
  filters: {
    brightness: 100,
    contrast: 105,
    saturation: 110,
    vibrance: 0,
    hueRotate: 0,
    sepia: 0,
  },
  canvasBackground: 'checker',
  canvasWidth: 700,
  canvasHeight: 700,
  zoom: 0.9,
};

type ActiveTab = 'upload' | 'border' | 'effects' | 'text' | 'decorations' | 'layers';

export default function StickerStudio() {
  const [state, setState] = useState<StickerState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');

  // History stack for Undo / Redo
  const [history, setHistory] = useState<StickerState[]>([INITIAL_STATE]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const canvasRef = useRef<CanvasHandle>(null);

  // Push new state to history
  const pushState = useCallback((newState: StickerState) => {
    setState(newState);
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, newState];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setState(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setState(history[newIdx]);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your sticker project?')) {
      pushState(INITIAL_STATE);
    }
  };

  // Layer Helpers
  const mainImageLayer = state.layers.find((l) => l.type === 'image');
  const selectedLayer = state.layers.find((l) => l.id === state.selectedLayerId);

  const handleSelectLayer = (id: string | null) => {
    setState((prev) => ({ ...prev, selectedLayerId: id }));
  };

  const handleUpdateLayer = (id: string, partial: Partial<CanvasLayer>) => {
    const updatedLayers = state.layers.map((l) => (l.id === id ? { ...l, ...partial } : l));
    setState((prev) => ({ ...prev, layers: updatedLayers }));
  };

  const handleDeleteLayer = (id: string) => {
    const nextLayers = state.layers.filter((l) => l.id !== id);
    pushState({
      ...state,
      layers: nextLayers,
      selectedLayerId: nextLayers.length > 0 ? nextLayers[nextLayers.length - 1].id : null,
    });
  };

  const handleDuplicateLayer = (id: string) => {
    const target = state.layers.find((l) => l.id === id);
    if (!target) return;
    const duplicated: CanvasLayer = {
      ...target,
      id: `layer-${Date.now()}`,
      name: `${target.name} (Copy)`,
      x: target.x + 20,
      y: target.y + 20,
    };
    pushState({
      ...state,
      layers: [...state.layers, duplicated],
      selectedLayerId: duplicated.id,
    });
  };

  const handleReorderLayer = (id: string, direction: 'up' | 'down') => {
    const idx = state.layers.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= state.layers.length) return;

    const reordered = [...state.layers];
    const [removed] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, removed);

    pushState({
      ...state,
      layers: reordered,
    });
  };

  // Image Upload handler
  const handleImageLoaded = (imgSrc: string, cutoutSrc?: string) => {
    const existingImgLayer = state.layers.find((l) => l.type === 'image');
    if (existingImgLayer) {
      const updated = state.layers.map((l) =>
        l.id === existingImgLayer.id
          ? {
              ...l,
              imageSrc: imgSrc,
              originalImageSrc: imgSrc,
              cutoutImageSrc: cutoutSrc,
              isCutoutActive: !!cutoutSrc,
            }
          : l
      );
      pushState({ ...state, layers: updated });
    } else {
      const newLayer: CanvasLayer = {
        id: `layer-img-${Date.now()}`,
        name: 'Uploaded Photo',
        type: 'image',
        x: state.canvasWidth / 2,
        y: state.canvasHeight / 2,
        width: 440,
        height: 440,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 100,
        visible: true,
        locked: false,
        imageSrc: imgSrc,
        originalImageSrc: imgSrc,
        cutoutImageSrc: cutoutSrc,
        isCutoutActive: true,
      };
      pushState({ ...state, layers: [newLayer, ...state.layers], selectedLayerId: newLayer.id });
    }
  };

  // Add Text layer
  const handleAddText = (defaultText: string = 'STICKER') => {
    const newTextLayer: CanvasLayer = {
      id: `layer-text-${Date.now()}`,
      name: 'Sticker Text',
      type: 'text',
      x: state.canvasWidth / 2,
      y: state.canvasHeight / 2 + 150,
      width: 320,
      height: 80,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 100,
      visible: true,
      locked: false,
      text: defaultText,
      fontFamily: 'Impact, sans-serif',
      fontSize: 52,
      textColor: '#ffffff',
      textBorderColor: '#000000',
      textBorderWidth: 4,
      curve: 0,
    };
    pushState({
      ...state,
      layers: [...state.layers, newTextLayer],
      selectedLayerId: newTextLayer.id,
    });
    setActiveTab('text');
  };

  // Add Decoration layer
  const handleAddDecoration = (item: DecorationItem) => {
    const newDecLayer: CanvasLayer = {
      id: `layer-dec-${Date.now()}`,
      name: item.name,
      type: 'decoration',
      x: state.canvasWidth / 2 + (Math.random() * 80 - 40),
      y: state.canvasHeight / 2 - 100 + (Math.random() * 80 - 40),
      width: 70,
      height: 70,
      rotation: Math.round(Math.random() * 30 - 15),
      scaleX: 1,
      scaleY: 1,
      opacity: 100,
      visible: true,
      locked: false,
      emoji: item.emoji,
    };
    pushState({
      ...state,
      layers: [...state.layers, newDecLayer],
      selectedLayerId: newDecLayer.id,
    });
  };

  const handleApplyPreset = (preset: StylePreset) => {
    pushState({
      ...state,
      border: { ...preset.border },
      shadow: { ...preset.shadow },
      finish: preset.finish,
      finishIntensity: preset.finishIntensity,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Header Navbar */}
      <Navbar
        state={state}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        onZoomChange={(zoom) => setState((s) => ({ ...s, zoom }))}
        onBgChange={(bg) => setState((s) => ({ ...s, canvasBackground: bg }))}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSheet={() => setIsSheetOpen(true)}
      />

      {/* Main Studio Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Leftmost Tool Navigation Bar */}
        <aside className="w-18 md:w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-1.5 shrink-0 z-10 shadow-xs">
          {[
            { id: 'upload' as const, label: 'Upload', icon: Upload },
            { id: 'border' as const, label: 'Die-Cut', icon: Sliders },
            { id: 'effects' as const, label: 'Effects', icon: Sparkles },
            { id: 'text' as const, label: 'Text', icon: Type },
            { id: 'decorations' as const, label: 'Badges', icon: Smile },
            { id: 'layers' as const, label: 'Layers', icon: Layers, count: state.layers.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25 scale-105'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`absolute top-1 right-1 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${
                      isActive ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Secondary Left Properties Panel */}
        <section className="w-80 md:w-92 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 p-5 overflow-y-auto shrink-0 shadow-inner">
          {activeTab === 'upload' && (
            <UploadPanel
              activeImageLayer={mainImageLayer}
              onImageLoaded={handleImageLoaded}
              onToggleCutout={(enable) => {
                if (mainImageLayer) {
                  handleUpdateLayer(mainImageLayer.id, { isCutoutActive: enable });
                }
              }}
              onUpdateCutoutSrc={(cutoutSrc) => {
                if (mainImageLayer) {
                  handleUpdateLayer(mainImageLayer.id, { cutoutImageSrc: cutoutSrc, isCutoutActive: true });
                }
              }}
            />
          )}

          {activeTab === 'border' && (
            <BorderEffectsPanel
              border={state.border}
              onChangeBorder={(border) => setState((s) => ({ ...s, border }))}
              onApplyPreset={handleApplyPreset}
            />
          )}

          {activeTab === 'effects' && (
            <EffectsTexturePanel
              shadow={state.shadow}
              finish={state.finish}
              finishIntensity={state.finishIntensity}
              filters={state.filters}
              onChangeShadow={(shadow) => setState((s) => ({ ...s, shadow }))}
              onChangeFinish={(finish) => setState((s) => ({ ...s, finish }))}
              onChangeFinishIntensity={(intensity) => setState((s) => ({ ...s, finishIntensity: intensity }))}
              onChangeFilters={(filters) => setState((s) => ({ ...s, filters }))}
            />
          )}

          {activeTab === 'text' && (
            <TextPanel
              selectedLayer={selectedLayer}
              onAddText={handleAddText}
              onUpdateLayer={handleUpdateLayer}
            />
          )}

          {activeTab === 'decorations' && (
            <DecorationsPanel onAddDecoration={handleAddDecoration} />
          )}

          {activeTab === 'layers' && (
            <LayersPanel
              layers={state.layers}
              selectedLayerId={state.selectedLayerId}
              onSelectLayer={handleSelectLayer}
              onUpdateLayer={handleUpdateLayer}
              onDeleteLayer={handleDeleteLayer}
              onDuplicateLayer={handleDuplicateLayer}
              onReorderLayer={handleReorderLayer}
            />
          )}
        </section>

        {/* Center Canvas Viewport */}
        <main className="flex-1 h-full relative overflow-hidden bg-slate-200/50 dark:bg-slate-950 flex flex-col">
          <InteractiveCanvas
            ref={canvasRef}
            state={state}
            onSelectLayer={handleSelectLayer}
            onUpdateLayer={handleUpdateLayer}
          />
        </main>
      </div>

      {/* Export Single Sticker Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        getCanvas={async () => {
          if (canvasRef.current) {
            return canvasRef.current.getCompositeCanvas();
          }
          return document.createElement('canvas');
        }}
      />

      {/* Printable Sticker Sheet Studio Modal */}
      <StickerSheetModal
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        getCanvas={async () => {
          if (canvasRef.current) {
            return canvasRef.current.getCompositeCanvas();
          }
          return document.createElement('canvas');
        }}
      />
    </div>
  );
}
