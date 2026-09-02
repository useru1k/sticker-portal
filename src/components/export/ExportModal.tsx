'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Check, MessageSquare, Sparkles, Archive, FileImage } from 'lucide-react';
import { copyStickerToClipboard, downloadMessagingSticker, downloadStickerImage, downloadStickerPackZip } from '../../lib/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  getCanvas: () => Promise<HTMLCanvasElement>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  getCanvas,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeCanvas, setActiveCanvas] = useState<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [exportScale, setExportScale] = useState<number>(1);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getCanvas().then((canvas) => {
        setActiveCanvas(canvas);
        setPreviewUrl(canvas.toDataURL('image/png'));
      });
    } else {
      setPreviewUrl(null);
      setActiveCanvas(null);
    }
  }, [isOpen, getCanvas]);

  if (!isOpen) return null;

  const handleCopyClipboard = async () => {
    if (!activeCanvas) return;
    const ok = await copyStickerToClipboard(activeCanvas);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = async (format: 'png' | 'webp' | 'jpeg') => {
    if (!activeCanvas) return;
    setIsExporting(true);
    await downloadStickerImage(activeCanvas, 'my-sticker', format, exportScale);
    setIsExporting(false);
    onClose();
  };

  const handleMessagingExport = async (app: 'whatsapp' | 'telegram') => {
    if (!activeCanvas) return;
    setIsExporting(true);
    await downloadMessagingSticker(activeCanvas, 'sticker', app);
    setIsExporting(false);
    onClose();
  };

  const handleZipExport = async () => {
    if (!activeCanvas) return;
    setIsExporting(true);
    await downloadStickerPackZip(activeCanvas, 'custom-sticker-bundle');
    setIsExporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Export Your Sticker
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sticker Preview Box */}
        <div className="aspect-video w-full rounded-2xl bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100 dark:bg-slate-950 dark:[radial-gradient(#334155_1px,transparent_1px)] border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4 overflow-hidden">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Sticker Preview"
              className="max-h-full max-w-full object-contain filter drop-shadow-md animate-in zoom-in-95 duration-200"
            />
          ) : (
            <div className="animate-spin text-purple-600">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Resolution Quality Selector */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Export Resolution
          </span>
          <div className="flex gap-1">
            {[
              { label: 'Standard (1x)', scale: 1 },
              { label: 'HD 2x (300 DPI)', scale: 2 },
              { label: 'Ultra 4x (Print)', scale: 4 },
            ].map((opt) => (
              <button
                key={opt.scale}
                onClick={() => setExportScale(opt.scale)}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                  exportScale === opt.scale
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Transparent PNG (Primary) */}
          <button
            onClick={() => handleDownload('png')}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-sm shadow-md shadow-purple-500/20 active:scale-98 transition-all"
          >
            <FileImage className="w-4 h-4" />
            Download PNG (Alpha)
          </button>

          {/* Copy to Clipboard */}
          <button
            onClick={handleCopyClipboard}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-sm text-slate-800 dark:text-slate-100 active:scale-98 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-purple-600" />
                Copy to Clipboard
              </>
            )}
          </button>

          {/* WhatsApp Sticker */}
          <button
            onClick={() => handleMessagingExport('whatsapp')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-medium text-xs active:scale-98 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            WhatsApp WebP (512x512)
          </button>

          {/* Sticker Bundle ZIP */}
          <button
            onClick={handleZipExport}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-medium text-xs active:scale-98 transition-all"
          >
            <Archive className="w-3.5 h-3.5 text-amber-600" />
            All Formats (.ZIP)
          </button>
        </div>
      </div>
    </div>
  );
};
