'use client';

import React, { useState } from 'react';
import { Smile, Sparkles, Award, MessageCircle, Heart } from 'lucide-react';
import { DECORATIONS } from '../../lib/sample-data';
import { DecorationItem } from '../../types/sticker';

interface DecorationsPanelProps {
  onAddDecoration: (item: DecorationItem) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Sparkles },
  { id: 'sparkles', name: 'Sparkles', icon: Sparkles },
  { id: 'badges', name: 'Badges', icon: Award },
  { id: 'faces', name: 'Costumes', icon: Smile },
  { id: 'cute', name: 'Cute', icon: Heart },
  { id: 'bubbles', name: 'Bubbles', icon: MessageCircle },
];

export const DecorationsPanel: React.FC<DecorationsPanelProps> = ({ onAddDecoration }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? DECORATIONS
    : DECORATIONS.filter((d) => d.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Grid of Emojis & Badges */}
      <div className="grid grid-cols-4 gap-2.5">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => onAddDecoration(item)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:scale-105 active:scale-95 transition-all shadow-xs group"
          >
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
              {item.emoji}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-full font-medium">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
