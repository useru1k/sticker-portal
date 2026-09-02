'use client';

import React, { useRef, useState } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Wand2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { SAMPLE_IMAGES } from '../../lib/sample-data';
import { removeBackgroundAI } from '../../lib/cutout';
import { CanvasLayer } from '../../types/sticker';

interface UploadPanelProps {
  onImageLoaded: (imgSrc: string, cutoutSrc?: string) => void;
  activeImageLayer?: CanvasLayer;
  onToggleCutout: (enable: boolean) => void;
  onUpdateCutoutSrc: (cutoutSrc: string) => void;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  onImageLoaded,
  activeImageLayer,
  onToggleCutout,
  onUpdateCutoutSrc,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingCutout, setIsProcessingCutout] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageLoaded(result);
        // Automatically trigger AI cutout for seamless experience
        triggerAICutout(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerAICutout = async (imgSrc?: string) => {
    const targetSrc = imgSrc || activeImageLayer?.originalImageSrc || activeImageLayer?.imageSrc;
    if (!targetSrc) return;

    try {
      setIsProcessingCutout(true);
      setProgressText('Initializing AI Model...');

      const cutoutUrl = await removeBackgroundAI(targetSrc, (prog) => {
        setProgressText(prog.text || `Processing AI Cutout (${Math.round((prog.current / (prog.total || 1)) * 100)}%)...`);
      });

      onUpdateCutoutSrc(cutoutUrl);
      onToggleCutout(true);
      setIsProcessingCutout(false);
      setProgressText('');
    } catch (err) {
      console.error('AI cutout error:', err);
      setIsProcessingCutout(false);
      setProgressText('');
    }
  };

  const handleSampleClick = (url: string) => {
    onImageLoaded(url);
    triggerAICutout(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-purple-600" />
          Upload Your Photo
        </h3>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PNG, JPG, WEBP, or HEIC (Up to 25MB)
          </p>
        </div>
      </div>

      {/* AI Background Removal Action */}
      {activeImageLayer && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/80 dark:border-purple-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                AI Subject Cutout
              </span>
            </div>
            {activeImageLayer.cutoutImageSrc && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cutout Ready
              </span>
            )}
          </div>

          {isProcessingCutout ? (
            <div className="space-y-2 py-2">
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                <span>{progressText || 'Extracting subject from background...'}</span>
              </div>
              <div className="w-full bg-purple-200 dark:bg-purple-900/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => triggerAICutout()}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-98"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {activeImageLayer.cutoutImageSrc ? 'Re-run AI Cutout' : 'Remove Background with AI'}
              </button>

              {activeImageLayer.cutoutImageSrc && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onToggleCutout(true)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                      activeImageLayer.isCutoutActive !== false
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Sticker Cutout
                  </button>
                  <button
                    onClick={() => onToggleCutout(false)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                      activeImageLayer.isCutoutActive === false
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    Original Photo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sample Photos Gallery */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2.5 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-purple-600" />
          Or Try with Sample Photos
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample.url)}
              className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-all hover:scale-105 shadow-xs"
            >
              <img
                src={sample.thumbnail}
                alt={sample.title}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <span className="text-[10px] text-white font-medium truncate">
                  {sample.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
