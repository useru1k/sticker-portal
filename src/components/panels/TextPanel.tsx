'use client';

import React from 'react';
import { Type, Plus, Palette, Sliders, AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import { CanvasLayer } from '../../types/sticker';

interface TextPanelProps {
  selectedLayer?: CanvasLayer;
  onAddText: (text?: string) => void;
  onUpdateLayer: (id: string, partial: Partial<CanvasLayer>) => void;
}

const FONTS = [
  { name: 'Impact Pop', value: 'Impact, sans-serif' },
  { name: 'Comic Sans Bold', value: '"Comic Sans MS", "Chalkboard SE", sans-serif' },
  { name: 'Modern Sans', value: 'system-ui, -apple-system, sans-serif' },
  { name: 'Retro Serif', value: 'Georgia, serif' },
  { name: 'Casual Hand', value: '"Marker Felt", "Comic Neue", cursive' },
  { name: 'Monospace Code', value: 'ui-monospace, monospace' },
];

const PRESET_TEXT_COLORS = ['#ffffff', '#000000', '#facc15', '#f43f5e', '#06b6d4', '#a855f7', '#10b981', '#fb923c'];

export const TextPanel: React.FC<TextPanelProps> = ({
  selectedLayer,
  onAddText,
  onUpdateLayer,
}) => {
  const isTextSelected = selectedLayer && selectedLayer.type === 'text';

  const update = (partial: Partial<CanvasLayer>) => {
    if (selectedLayer) {
      onUpdateLayer(selectedLayer.id, partial);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Text Quick Button */}
      <button
        onClick={() => onAddText('STICKER')}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-transform active:scale-98"
      >
        <Plus className="w-4 h-4" />
        Add Sticker Text
      </button>

      {isTextSelected ? (
        <div className="space-y-4 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-purple-600" />
              Edit Text
            </span>
          </div>

          {/* Text Content Input */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Text Content
            </label>
            <input
              type="text"
              value={selectedLayer.text || ''}
              onChange={(e) => update({ text: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              placeholder="Type your sticker text..."
            />
          </div>

          {/* Font Family Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Font Style
            </label>
            <select
              value={selectedLayer.fontFamily || FONTS[0].value}
              onChange={(e) => update({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              <span>Size</span>
              <span className="font-semibold">{selectedLayer.fontSize || 48}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="120"
              value={selectedLayer.fontSize || 48}
              onChange={(e) => update({ fontSize: Number(e.target.value) })}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Text Color Swatches */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Fill Color
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => update({ textColor: color })}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded-md border shadow-xs transition-transform hover:scale-110 ${
                    selectedLayer.textColor === color
                      ? 'border-purple-600 scale-110 ring-2 ring-purple-400'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                />
              ))}
              <input
                type="color"
                value={selectedLayer.textColor || '#ffffff'}
                onChange={(e) => update({ textColor: e.target.value })}
                className="w-6 h-6 rounded-md cursor-pointer border border-slate-300"
              />
            </div>
          </div>

          {/* Text Border / Stroke */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>Text Outline / Stroke</span>
              <span className="font-semibold">{selectedLayer.textBorderWidth || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={selectedLayer.textBorderWidth || 0}
              onChange={(e) => update({ textBorderWidth: Number(e.target.value) })}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Outline Color
              </span>
              <input
                type="color"
                value={selectedLayer.textBorderColor || '#000000'}
                onChange={(e) => update({ textBorderColor: e.target.value })}
                className="w-7 h-7 rounded-md cursor-pointer border border-slate-300"
              />
            </div>
          </div>

          {/* Arch / Curve Effect */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>Text Curve / Arch</span>
              <span className="font-semibold">{selectedLayer.curve || 0}°</span>
            </div>
            <input
              type="range"
              min="-80"
              max="80"
              value={selectedLayer.curve || 0}
              onChange={(e) => update({ curve: Number(e.target.value) })}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
          <Type className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="text-xs text-slate-500">
            Click &quot;Add Sticker Text&quot; or select a text layer on the canvas to customize its font, stroke, and arch effect.
          </p>
        </div>
      )}
    </div>
  );
};
