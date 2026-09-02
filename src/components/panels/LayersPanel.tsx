'use client';

import React from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, Trash2, Copy, ArrowUp, ArrowDown, Type, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CanvasLayer } from '../../types/sticker';

interface LayersPanelProps {
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onUpdateLayer: (id: string, partial: Partial<CanvasLayer>) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onReorderLayer: (id: string, direction: 'up' | 'down') => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onReorderLayer,
}) => {
  // Render in reverse order so top-most layer appears on top of the list
  const reversed = [...layers].reverse();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-purple-600" />
          Layers Stack ({layers.length})
        </h3>
      </div>

      {layers.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
          <p className="text-xs text-slate-400">No layers on canvas yet.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {reversed.map((layer, revIdx) => {
            const isSelected = layer.id === selectedLayerId;
            const originalIndex = layers.length - 1 - revIdx;
            const canMoveUp = originalIndex < layers.length - 1;
            const canMoveDown = originalIndex > 0;

            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 ring-1 ring-purple-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                    {layer.type === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                    {layer.type === 'text' && <Type className="w-3.5 h-3.5" />}
                    {layer.type === 'decoration' && <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {layer.name || (layer.type === 'text' ? layer.text : 'Layer')}
                  </span>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => onReorderLayer(layer.id, 'up')}
                    disabled={!canMoveUp}
                    title="Bring Forward"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onReorderLayer(layer.id, 'down')}
                    disabled={!canMoveDown}
                    title="Send Backward"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Visibility */}
                  <button
                    onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-300" />}
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => onDuplicateLayer(layer.id)}
                    title="Duplicate Layer"
                    className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteLayer(layer.id)}
                    title="Delete Layer"
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
