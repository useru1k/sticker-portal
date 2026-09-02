'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, Download, FileText, Sliders, Scissors, Check, Sparkles } from 'lucide-react';
import { generateStickerSheetPDF, SheetOptions } from '../../lib/export';

interface StickerSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  getCanvas: () => Promise<HTMLCanvasElement>;
}

export const StickerSheetModal: React.FC<StickerSheetModalProps> = ({
  isOpen,
  onClose,
  getCanvas,
}) => {
  const [activeCanvas, setActiveCanvas] = useState<HTMLCanvasElement | null>(null);
  const [stickerDataUrl, setStickerDataUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [options, setOptions] = useState<SheetOptions>({
    pageSize: 'a4',
    orientation: 'portrait',
    stickerScale: 0.9,
    columns: 3,
    rows: 4,
    marginMm: 12,
    spacingMm: 6,
    showCutLines: true,
    showRegistrationMarks: true,
    sheetTitle: 'StickerCraft Printable Sheet',
  });

  useEffect(() => {
    if (isOpen) {
      getCanvas().then((c) => {
        setActiveCanvas(c);
        setStickerDataUrl(c.toDataURL('image/png'));
      });
    }
  }, [isOpen, getCanvas]);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!activeCanvas) return;
    setIsExporting(true);
    await generateStickerSheetPDF(activeCanvas, options);
    setIsExporting(false);
    onClose();
  };

  const totalStickers = options.columns * options.rows;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Printable Sticker Sheet Studio
              </h2>
              <p className="text-xs text-slate-500">
                Pack multiple stickers onto A4 or Letter sheets ready for scissors or cutting machines.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Settings & Interactive Sheet Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-y-auto flex-1">
          {/* Controls Panel */}
          <div className="space-y-4">
            {/* Paper Size & Orientation */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Paper Standard
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'a4', label: 'A4 (210 × 297 mm)' },
                  { id: 'letter', label: 'US Letter (8.5 × 11 in)' },
                  { id: 'a5', label: 'A5 (148 × 210 mm)' },
                  { id: 'photo4x6', label: '4 × 6" Photo' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setOptions({ ...options, pageSize: p.id as any })}
                    className={`p-2 text-xs font-medium rounded-xl border text-left transition-all ${
                      options.pageSize === p.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Layout (Columns & Rows) */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Columns</span>
                  <span className="font-semibold text-purple-600">{options.columns}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={options.columns}
                  onChange={(e) => setOptions({ ...options, columns: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Rows</span>
                  <span className="font-semibold text-purple-600">{options.rows}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={options.rows}
                  onChange={(e) => setOptions({ ...options, rows: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Scale & Spacing */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Sticker Size Scale</span>
                  <span className="font-semibold text-purple-600">{Math.round(options.stickerScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.05"
                  value={options.stickerScale}
                  onChange={(e) => setOptions({ ...options, stickerScale: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Margin Padding</span>
                  <span className="font-semibold text-purple-600">{options.marginMm}mm</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={options.marginMm}
                  onChange={(e) => setOptions({ ...options, marginMm: Number(e.target.value) })}
                  className="w-full accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Cut Lines & Registration Marks */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-purple-600" />
                  Print Scissor Cut Guides
                </span>
                <input
                  type="checkbox"
                  checked={options.showCutLines}
                  onChange={(e) => setOptions({ ...options, showCutLines: e.target.checked })}
                  className="rounded text-purple-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  Cricut / Silhouette Registration Marks
                </span>
                <input
                  type="checkbox"
                  checked={options.showRegistrationMarks}
                  onChange={(e) => setOptions({ ...options, showRegistrationMarks: e.target.checked })}
                  className="rounded text-purple-600 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Live Print Sheet Preview */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 mb-2">
              Live Sheet Preview ({totalStickers} Stickers per page)
            </span>
            <div className="relative aspect-[1/1.414] w-full max-w-[280px] bg-white rounded-lg shadow-xl p-3 border border-slate-300 overflow-hidden flex flex-col justify-between">
              {/* Corner Registration Marks Mock */}
              {options.showRegistrationMarks && (
                <>
                  <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-black" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-black" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-black" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-black" />
                </>
              )}

              {/* Grid Preview */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${options.columns}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${options.rows}, minmax(0, 1fr))`,
                  gap: `${options.spacingMm * 0.4}px`,
                  height: '100%',
                }}
                className="w-full"
              >
                {Array.from({ length: totalStickers }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center p-1 rounded-sm ${
                      options.showCutLines ? 'border border-dashed border-slate-300' : ''
                    }`}
                  >
                    {stickerDataUrl && (
                      <img
                        src={stickerDataUrl}
                        alt="Sticker"
                        style={{ transform: `scale(${options.stickerScale})` }}
                        className="max-h-full max-w-full object-contain filter drop-shadow-xs"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-sm shadow-md shadow-purple-500/25 active:scale-98 transition-all"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating PDF...' : 'Download Print-Ready PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};
