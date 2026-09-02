import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

export interface SheetOptions {
  pageSize: 'a4' | 'letter' | 'a5' | 'photo4x6';
  orientation: 'portrait' | 'landscape';
  stickerScale: number; // 0.5 to 2
  columns: number;
  rows: number;
  marginMm: number;
  spacingMm: number;
  showCutLines: boolean;
  showRegistrationMarks: boolean;
  sheetTitle: string;
}

/**
 * Triggers full confetti celebration on download
 */
export function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
  });
}

/**
 * Download a canvas as transparent PNG or WebP
 */
export async function downloadStickerImage(
  canvas: HTMLCanvasElement,
  filename: string = 'my-custom-sticker',
  format: 'png' | 'webp' | 'jpeg' = 'png',
  scale: number = 1
): Promise<void> {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width * scale;
  exportCanvas.height = canvas.height * scale;
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

  const mimeType = format === 'webp' ? 'image/webp' : format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const dataUrl = exportCanvas.toDataURL(mimeType, 0.95);

  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  fireConfetti();
}

/**
 * WhatsApp / Telegram sticker format (512x512 with 16px transparent safety padding)
 */
export async function downloadMessagingSticker(
  canvas: HTMLCanvasElement,
  filename: string = 'whatsapp-sticker',
  app: 'whatsapp' | 'telegram' = 'whatsapp'
): Promise<void> {
  const targetSize = 512;
  const padding = 24;
  const innerSize = targetSize - padding * 2;

  const sqCanvas = document.createElement('canvas');
  sqCanvas.width = targetSize;
  sqCanvas.height = targetSize;
  const ctx = sqCanvas.getContext('2d');
  if (!ctx) return;

  const aspect = canvas.width / canvas.height;
  let drawW = innerSize;
  let drawH = innerSize;

  if (aspect > 1) {
    drawH = innerSize / aspect;
  } else {
    drawW = innerSize * aspect;
  }

  const dx = (targetSize - drawW) / 2;
  const dy = (targetSize - drawH) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, dx, dy, drawW, drawH);

  const mime = app === 'whatsapp' ? 'image/webp' : 'image/png';
  const ext = app === 'whatsapp' ? 'webp' : 'png';
  const dataUrl = sqCanvas.toDataURL(mime, 0.95);

  const link = document.createElement('a');
  link.download = `${filename}-${app}.${ext}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  fireConfetti();
}

/**
 * Copy transparent PNG sticker directly to user's OS clipboard
 */
export async function copyStickerToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );
    if (!blob) return false;

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Generate a printable multi-sticker sheet PDF (A4/Letter) with cutlines
 */
export async function generateStickerSheetPDF(
  canvas: HTMLCanvasElement,
  options: SheetOptions
): Promise<void> {
  // Dimension standards in mm
  const dimensions: Record<string, { width: number; height: number }> = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
    a5: { width: 148, height: 210 },
    photo4x6: { width: 101.6, height: 152.4 },
  };

  const dim = dimensions[options.pageSize] || dimensions.a4;
  const pageWidth = options.orientation === 'portrait' ? dim.width : dim.height;
  const pageHeight = options.orientation === 'portrait' ? dim.height : dim.width;

  const doc = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: [pageWidth, pageHeight],
  });

  const margin = options.marginMm;
  const spacing = options.spacingMm;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  const cols = options.columns;
  const rows = options.rows;

  const cellWidth = (availableWidth - spacing * (cols - 1)) / cols;
  const cellHeight = (availableHeight - spacing * (rows - 1)) / rows;

  // Render sticker image
  const stickerDataUrl = canvas.toDataURL('image/png', 1.0);
  const stickerAspect = canvas.width / canvas.height;

  let imgW = cellWidth * options.stickerScale;
  let imgH = imgW / stickerAspect;

  if (imgH > cellHeight * options.stickerScale) {
    imgH = cellHeight * options.stickerScale;
    imgW = imgH * stickerAspect;
  }

  // Draw Header / Title
  if (options.sheetTitle) {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(options.sheetTitle, margin, margin - 4);
  }

  // Draw Registration Marks (for cutting machines / Cricut / Silhouette)
  if (options.showRegistrationMarks) {
    const markSize = 5;
    doc.setLineWidth(0.8);
    doc.setDrawColor(0, 0, 0);

    // Top-left
    doc.line(margin / 2, margin / 2, margin / 2 + markSize, margin / 2);
    doc.line(margin / 2, margin / 2, margin / 2, margin / 2 + markSize);

    // Top-right
    doc.line(pageWidth - margin / 2, margin / 2, pageWidth - margin / 2 - markSize, margin / 2);
    doc.line(pageWidth - margin / 2, margin / 2, pageWidth - margin / 2, margin / 2 + markSize);

    // Bottom-left
    doc.line(margin / 2, pageHeight - margin / 2, margin / 2 + markSize, pageHeight - margin / 2);
    doc.line(margin / 2, pageHeight - margin / 2, margin / 2, pageHeight - margin / 2 - markSize);

    // Bottom-right
    doc.line(pageWidth - margin / 2, pageHeight - margin / 2, pageWidth - margin / 2 - markSize, pageHeight - margin / 2);
    doc.line(pageWidth - margin / 2, pageHeight - margin / 2, pageWidth - margin / 2, pageHeight - margin / 2 - markSize);
  }

  // Place stickers in grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellX = margin + c * (cellWidth + spacing);
      const cellY = margin + r * (cellHeight + spacing);

      const x = cellX + (cellWidth - imgW) / 2;
      const y = cellY + (cellHeight - imgH) / 2;

      // Draw dashed cut border guides if enabled
      if (options.showCutLines) {
        doc.setLineDashPattern([2, 2], 0);
        doc.setLineWidth(0.2);
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(cellX, cellY, cellWidth, cellHeight, 3, 3, 'S');
        doc.setLineDashPattern([], 0); // reset
      }

      doc.addImage(stickerDataUrl, 'PNG', x, y, imgW, imgH);
    }
  }

  doc.save(`${options.sheetTitle.toLowerCase().replace(/\s+/g, '-')}-sheet.pdf`);
  fireConfetti();
}

/**
 * Export sticker pack as ZIP archive
 */
export async function downloadStickerPackZip(
  canvas: HTMLCanvasElement,
  title: string = 'sticker-pack'
): Promise<void> {
  const zip = new JSZip();

  // 1. Full HD PNG
  const fullPng = canvas.toDataURL('image/png').split(',')[1];
  zip.file(`${title}-hd.png`, fullPng, { base64: true });

  // 2. WhatsApp WebP
  const waCanvas = document.createElement('canvas');
  waCanvas.width = 512;
  waCanvas.height = 512;
  const waCtx = waCanvas.getContext('2d');
  if (waCtx) {
    waCtx.drawImage(canvas, 32, 32, 448, 448);
    const waData = waCanvas.toDataURL('image/webp').split(',')[1];
    zip.file(`${title}-whatsapp.webp`, waData, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `${title}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  fireConfetti();
}
