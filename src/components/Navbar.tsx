'use client';

import React from 'react';
import { 
  Sparkles, 
  Download, 
  Printer, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Grid,
  Sun,
  Moon,
  Check
} from 'lucide-react';
import { StickerState } from '../types/sticker';

interface NavbarProps {
  state: StickerState;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onZoomChange: (zoom: number) => void;
  onBgChange: (bg: StickerState['canvasBackground']) => void;
  onOpenExport: () => void;
  onOpenSheet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onZoomChange,
  onBgChange,
  onOpenExport,
  onOpenSheet,
}) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-pink-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              StickerCraft
            </h1>
            <span className="text-xs px-2 py-0.5 font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              AI Studio
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Upload • AI Cutout • Die-Cut Borders • Print Sheet
          </p>
        </div>
      </div>

      {/* Middle Canvas & History Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-700 dark:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-700 dark:text-slate-200 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onZoomChange(Math.max(0.25, state.zoom - 0.15))}
            title="Zoom Out"
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            title="Reset Zoom"
            className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            {Math.round(state.zoom * 100)}%
          </button>
          <button
            onClick={() => onZoomChange(Math.min(2.5, state.zoom + 0.15))}
            title="Zoom In"
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Background Selector */}
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onBgChange('checker')}
            title="Checkerboard (Transparent)"
            className={`p-1.5 rounded-md transition-colors ${state.canvasBackground === 'checker' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onBgChange('white')}
            title="White Studio"
            className={`p-1.5 rounded-md transition-colors ${state.canvasBackground === 'white' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => onBgChange('dark')}
            title="Dark Studio"
            className={`p-1.5 rounded-md transition-colors ${state.canvasBackground === 'dark' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Reset Canvas */}
        <button
          onClick={onReset}
          title="Clear / Reset Project"
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right Export Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSheet}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs transition-all active:scale-95"
        >
          <Printer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline">Sticker Sheet</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md shadow-purple-500/25 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Sticker</span>
        </button>
      </div>
    </header>
  );
};
