'use client';

import React from 'react';
import { Sparkles, Sliders, Palette, Zap, Scissors } from 'lucide-react';
import { BorderSettings, ShadowSettings, StickerFinish, StickerState } from '../../types/sticker';
import { STYLE_PRESETS, StylePreset } from '../../lib/sample-data';

interface BorderEffectsPanelProps {
  border: BorderSettings;
  onChangeBorder: (border: BorderSettings) => void;
  onApplyPreset: (preset: StylePreset) => void;
}

const PRESET_COLORS = [
  '#ffffff', // Pure White
  '#f8fafc', // Snow
  '#facc15', // Pop Yellow
  '#f43f5e', // Hot Pink
  '#06b6d4', // Cyan
  '#a855f7', // Purple
  '#10b981', // Emerald
  '#0f172a', // Jet Black
];

export const BorderEffectsPanel: React.FC<BorderEffectsPanelProps> = ({
  border,
  onChangeBorder,
  onApplyPreset,
}) => {
  const updateBorder = (partial: Partial<BorderSettings>) => {
    onChangeBorder({ ...border, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* Instant Presets */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Sticker Style Presets
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 bg-white dark:bg-slate-800/60 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-left transition-all group"
            >
              <div className={`w-6 h-6 rounded-lg shrink-0 ${preset.colorPreview}`} />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {preset.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Die-Cut Border Settings */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Die-Cut White Border
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={border.enabled}
              onChange={(e) => updateBorder({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {border.enabled && (
          <div className="space-y-4 pt-1">
            {/* Border Width Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                <span>Border Thickness</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{border.width}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={border.width}
                onChange={(e) => updateBorder({ width: Number(e.target.value) })}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Border Color Swatches */}
            <div>
              <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
                Border Color
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateBorder({ color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-lg border-2 shadow-xs transition-transform hover:scale-110 ${
                      border.color.toLowerCase() === c.toLowerCase()
                        ? 'border-purple-600 scale-105 ring-2 ring-purple-400/30'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                ))}
                {/* Custom Color Input */}
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={border.color}
                    onChange={(e) => updateBorder({ color: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer opacity-0 absolute inset-0"
                  />
                  <div className="w-7 h-7 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-500 hover:border-purple-500">
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                </label>
              </div>
            </div>

            {/* Dashed Line / Scissor Marks */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-slate-500" />
                Dashed Scissor Cutline
              </span>
              <input
                type="checkbox"
                checked={border.dashed}
                onChange={(e) => updateBorder({ dashed: e.target.checked })}
                className="rounded text-purple-600 focus:ring-purple-500 dark:bg-slate-700 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Secondary Double Border */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Outer Secondary Outline
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={border.secondaryEnabled}
              onChange={(e) => updateBorder({ secondaryEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {border.secondaryEnabled && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                <span>Secondary Width</span>
                <span className="font-semibold text-purple-600">{border.secondaryWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={border.secondaryWidth}
                onChange={(e) => updateBorder({ secondaryWidth: Number(e.target.value) })}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Secondary Color
              </span>
              <input
                type="color"
                value={border.secondaryColor}
                onChange={(e) => updateBorder({ secondaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Neon Glow */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Neon Glow Atmosphere
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={border.glow}
              onChange={(e) => updateBorder({ glow: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {border.glow && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Glow Color
              </span>
              <input
                type="color"
                value={border.glowColor}
                onChange={(e) => updateBorder({ glowColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                <span>Glow Intensity</span>
                <span className="font-semibold text-purple-600">{border.glowBlur}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={border.glowBlur}
                onChange={(e) => updateBorder({ glowBlur: Number(e.target.value) })}
                className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
