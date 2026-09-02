import { BorderSettings, FilterSettings, ShadowSettings, StickerFinish } from '../types/sticker';

/**
 * Renders an image with die-cut border, shadows, filters, and finish textures.
 */
export async function createStickerComposite(
  imageElement: HTMLImageElement | HTMLCanvasElement,
  border: BorderSettings,
  shadow: ShadowSettings,
  finish: StickerFinish,
  finishIntensity: number = 80,
  filters?: FilterSettings
): Promise<HTMLCanvasElement> {
  const padding = (border.enabled ? border.width * 2 + (border.secondaryEnabled ? border.secondaryWidth * 2 : 0) : 0) + (shadow.enabled ? Math.max(Math.abs(shadow.offsetX), Math.abs(shadow.offsetY)) + shadow.blur * 2 : 0) + 40;

  const targetWidth = imageElement.width + padding * 2;
  const targetHeight = imageElement.height + padding * 2;

  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = targetWidth;
  mainCanvas.height = targetHeight;
  const ctx = mainCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return mainCanvas;

  const centerX = targetWidth / 2;
  const centerY = targetHeight / 2;
  const imgX = (targetWidth - imageElement.width) / 2;
  const imgY = (targetHeight - imageElement.height) / 2;

  // 1. Offscreen source with filters applied
  const filteredImgCanvas = document.createElement('canvas');
  filteredImgCanvas.width = imageElement.width;
  filteredImgCanvas.height = imageElement.height;
  const fCtx = filteredImgCanvas.getContext('2d', { willReadFrequently: true });
  if (fCtx) {
    if (filters) {
      fCtx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hueRotate}deg) sepia(${filters.sepia}%)`;
    }
    fCtx.drawImage(imageElement, 0, 0);
  }

  // 2. Generate Die-Cut Border Mask
  if (border.enabled && border.width > 0) {
    const totalBorderWidth = border.width + (border.secondaryEnabled ? border.secondaryWidth : 0);

    // Apply 3D Drop Shadow behind the outer border
    if (shadow.enabled) {
      ctx.save();
      ctx.shadowColor = hexToRgba(shadow.color, shadow.opacity / 100);
      ctx.shadowBlur = shadow.blur;
      ctx.shadowOffsetX = shadow.offsetX;
      ctx.shadowOffsetY = shadow.offsetY;

      // Draw shadow silhouette
      drawDilatedSilhouette(ctx, filteredImgCanvas, imgX, imgY, totalBorderWidth, '#000000');
      ctx.restore();
    }

    // Outer / Secondary Border (if enabled)
    if (border.secondaryEnabled && border.secondaryWidth > 0) {
      drawDilatedSilhouette(ctx, filteredImgCanvas, imgX, imgY, totalBorderWidth, border.secondaryColor, border.dashed);
    }

    // Main Primary Die-Cut Border (typically crisp white)
    if (border.glow) {
      ctx.save();
      ctx.shadowColor = border.glowColor || '#ffffff';
      ctx.shadowBlur = border.glowBlur || 20;
      drawDilatedSilhouette(ctx, filteredImgCanvas, imgX, imgY, border.width, border.color, border.dashed);
      ctx.restore();
    } else {
      drawDilatedSilhouette(ctx, filteredImgCanvas, imgX, imgY, border.width, border.color, border.dashed);
    }
  } else if (shadow.enabled) {
    // Drop shadow directly behind the subject
    ctx.save();
    ctx.shadowColor = hexToRgba(shadow.color, shadow.opacity / 100);
    ctx.shadowBlur = shadow.blur;
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
    ctx.drawImage(filteredImgCanvas, imgX, imgY);
    ctx.restore();
  }

  // 3. Draw Main Subject
  ctx.drawImage(filteredImgCanvas, imgX, imgY);

  // 4. Apply Sticker Finishes / Overlays
  if (finish !== 'none') {
    applyStickerFinish(ctx, filteredImgCanvas, imgX, imgY, finish, finishIntensity);
  }

  return mainCanvas;
}

/**
 * Fast Alpha Dilation for Die-Cut Sticker Borders
 */
function drawDilatedSilhouette(
  ctx: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  radius: number,
  color: string,
  dashed: boolean = false
) {
  // Create offscreen silhouette
  const offscreen = document.createElement('canvas');
  offscreen.width = sourceCanvas.width + radius * 4;
  offscreen.height = sourceCanvas.height + radius * 4;
  const oCtx = offscreen.getContext('2d');
  if (!oCtx) return;

  const oX = radius * 2;
  const oY = radius * 2;

  // Step 1: Draw silhouette filled with solid color
  oCtx.drawImage(sourceCanvas, oX, oY);
  oCtx.globalCompositeOperation = 'source-in';
  oCtx.fillStyle = color;
  oCtx.fillRect(0, 0, offscreen.width, offscreen.height);
  oCtx.globalCompositeOperation = 'source-over';

  // Step 2: Radial multi-pass stamping for ultra-smooth rounded die-cut expansion
  const stampCanvas = document.createElement('canvas');
  stampCanvas.width = ctx.canvas.width;
  stampCanvas.height = ctx.canvas.height;
  const sCtx = stampCanvas.getContext('2d');
  if (!sCtx) return;

  const steps = Math.max(16, Math.min(64, radius * 2));
  const rSteps = Math.max(1, Math.floor(radius / 3));

  for (let r = 1; r <= radius; r += Math.max(1, radius / rSteps)) {
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      sCtx.drawImage(offscreen, x - oX + dx, y - oY + dy);
    }
  }

  if (dashed) {
    ctx.save();
    ctx.setLineDash([12, 8]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#666666';
    ctx.drawImage(stampCanvas, 0, 0);
    ctx.restore();
  } else {
    ctx.drawImage(stampCanvas, 0, 0);
  }
}

/**
 * Applies realistic finishes: Holographic, Glossy Vinyl, Glitter, Matte, Retro Dots
 */
function applyStickerFinish(
  ctx: CanvasRenderingContext2D,
  subjectCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  finish: StickerFinish,
  intensity: number
) {
  const w = subjectCanvas.width;
  const h = subjectCanvas.height;
  const opacity = (intensity / 100) * 0.7;

  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = w;
  overlayCanvas.height = h;
  const oCtx = overlayCanvas.getContext('2d');
  if (!oCtx) return;

  // Mask with subject alpha
  oCtx.drawImage(subjectCanvas, 0, 0);
  oCtx.globalCompositeOperation = 'source-in';

  if (finish === 'gloss') {
    // 3D curved gloss shine
    const grad = oCtx.createLinearGradient(0, 0, w * 0.8, h * 0.8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
    grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    
    oCtx.fillStyle = grad;
    oCtx.fillRect(0, 0, w, h);
  } else if (finish === 'holographic') {
    // Rainbow prism spectrum
    const grad = oCtx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(255, 0, 128, 0.4)');
    grad.addColorStop(0.2, 'rgba(255, 230, 0, 0.4)');
    grad.addColorStop(0.4, 'rgba(0, 255, 128, 0.4)');
    grad.addColorStop(0.6, 'rgba(0, 200, 255, 0.4)');
    grad.addColorStop(0.8, 'rgba(180, 0, 255, 0.4)');
    grad.addColorStop(1, 'rgba(255, 0, 128, 0.4)');

    oCtx.fillStyle = grad;
    oCtx.fillRect(0, 0, w, h);
  } else if (finish === 'glitter') {
    // Sparkle glitter flecks
    oCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 200; i++) {
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      const gr = Math.random() * 2.5 + 0.5;
      oCtx.beginPath();
      oCtx.arc(gx, gy, gr, 0, Math.PI * 2);
      oCtx.fill();
    }
  } else if (finish === 'retro-dots') {
    // Pop-art comic halftone dots
    oCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    const spacing = 8;
    for (let py = 0; py < h; py += spacing) {
      for (let px = 0; px < w; px += spacing) {
        oCtx.beginPath();
        oCtx.arc(px + (py % (spacing * 2) === 0 ? spacing / 2 : 0), py, 2, 0, Math.PI * 2);
        oCtx.fill();
      }
    }
  }

  // Draw overlay onto main composite with screen/overlay blend
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = finish === 'retro-dots' ? 'multiply' : 'screen';
  ctx.drawImage(overlayCanvas, x, y);
  ctx.restore();
}

/**
 * Utility to convert hex to rgba
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
