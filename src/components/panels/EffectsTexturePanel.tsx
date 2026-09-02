'use client';

import React from 'react';
import { Layers, Sparkles, Sun, Contrast, SlidersHorizontal, Eye } from 'lucide-react';
import { FilterSettings, ShadowSettings, StickerFinish } from '../../types/sticker';

interface EffectsTexturePanelProps {
  shadow: ShadowSettings;
  finish: StickerFinish;
  finishIntensity: number;
  filters: FilterSettings;
  onChangeShadow: (shadow: ShadowSettings) => void;
  onChangeFinish: (finish: StickerFinish) => void;
  onChangeFinishIntensity: (intensity: number) => void;
  onChangeFilters: (filters: FilterSettings) => void;
}

const FINISHES: { id: StickerFinish; name: string; desc: string; icon: string }[] = [
  { id: 'none', name: 'Standard Matte', desc: 'Clean flat matte finish', icon: '⚪' },
  { id: 'gloss', name: 'Glossy Vinyl', desc: 'Realistic 3D light reflection', icon: '✨' },
  { id: 'holographic', name: 'Hologram Prism', desc: 'Iridescent rainbow spectrum', icon: '🌈' },
  { id: 'glitter', name: 'Glitter Sparkle', desc: 'Shimmering sparkling flecks', icon: '🌟' },
  { id: 'retro-dots', name: 'Comic Halftone', desc: 'Pop-art retro comic print', icon: '📰' },
];

export const EffectsTexturePanel: React.FC<EffectsTexturePanelProps> = ({
  shadow,
  finish,
  finishIntensity,
  filters,
  onChangeShadow,
  onChangeFinish,
  onChangeFinishIntensity,
  onChangeFilters,
}) => {
  const updateShadow = (partial: Partial<ShadowSettings>) => {
    onChangeShadow({ ...shadow, ...partial });
  };

  const updateFilters = (partial: Partial<FilterSettings>) => {
    onChangeFilters({ ...filters, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* 3D Drop Shadow */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              3D Sticker Shadow
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={shadow.enabled}
              onChange={(e) => updateShadow({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {shadow.enabled && (
          <div className="space-y-3 pt-1">
            {/* Offset Y / Elevation */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                <span>Shadow Elevation (Y)</span>
                <span className="font-semibold text-purple-600">{shadow.offsetY}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={shadow.offsetY}
                onChange={(e) => updateShadow({ offsetY: Number(e.target.value) })}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blur Radius */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                <span>Shadow Softness</span>
                <span className="font-semibold text-purple-600">{shadow.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={shadow.blur}
                onChange={(e) => updateShadow({ blur: Number(e.target.value) })}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                <span>Shadow Opacity</span>
                <span className="font-semibold text-purple-600">{shadow.opacity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={shadow.opacity}
                onChange={(e) => updateShadow({ opacity: Number(e.target.value) })}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Shadow Color */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Shadow Tint
              </span>
              <input
                type="color"
                value={shadow.color}
                onChange={(e) => updateShadow({ color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Finishes & Paper Overlays */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Sticker Finish / Texture
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {FINISHES.map((f) => (
            <button
              key={f.id}
              onClick={() => onChangeFinish(f.id)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                finish === f.id
                  ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 ring-1 ring-purple-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{f.icon}</span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{f.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{f.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {finish !== 'none' && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              <span>Finish Shine Intensity</span>
              <span className="font-semibold text-purple-600">{finishIntensity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={finishIntensity}
              onChange={(e) => onChangeFinishIntensity(Number(e.target.value))}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Color & Filter Adjustments */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3.5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4 text-purple-600" />
          Color Adjustments
        </h3>

        {/* Brightness */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            <span>Brightness</span>
            <span className="font-semibold">{filters.brightness}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="140"
            value={filters.brightness}
            onChange={(e) => updateFilters({ brightness: Number(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            <span>Contrast</span>
            <span className="font-semibold">{filters.contrast}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="140"
            value={filters.contrast}
            onChange={(e) => updateFilters({ contrast: Number(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            <span>Saturation / Pop</span>
            <span className="font-semibold">{filters.saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={filters.saturation}
            onChange={(e) => updateFilters({ saturation: Number(e.target.value) })}
            className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
