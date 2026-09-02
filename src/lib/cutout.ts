/**
 * AI Background Removal Utility
 * Uses @imgly/background-removal in-browser WebAssembly
 * with fallback threshold segmentation.
 */

export interface CutoutProgress {
  key: string;
  current: number;
  total: number;
  text?: string;
}

export async function removeBackgroundAI(
  imageSource: string | Blob | ImageData,
  onProgress?: (progress: CutoutProgress) => void
): Promise<string> {
  try {
    const { removeBackground } = await import('@imgly/background-removal');
    
    const blob = await removeBackground(imageSource, {
      progress: (key: string, current: number, total: number) => {
        if (onProgress) {
          onProgress({
            key,
            current,
            total,
            text: `Processing AI Cutout (${Math.round((current / (total || 1)) * 100)}%)...`
          });
        }
      },
      model: 'isnet_fp16',
      output: {
        format: 'image/png',
        quality: 1,
      }
    });

    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('AI Cutout failed or WebAssembly unsupported, attempting smart canvas threshold cutout fallback:', error);
    return fallbackSmartCutout(imageSource);
  }
}

/**
 * High-speed smart edge & color threshold cutout fallback
 */
export async function fallbackSmartCutout(imageSource: string | Blob | ImageData): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return reject('No 2d context');

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample corner pixels to detect background color
      const corners = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1],
      ];
      
      let bgR = 0, bgG = 0, bgB = 0;
      for (const [x, y] of corners) {
        const idx = (y * canvas.width + x) * 4;
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      }
      bgR /= corners.length;
      bgG /= corners.length;
      bgB /= corners.length;

      // Color distance threshold
      const threshold = 40;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        
        if (dist < threshold) {
          data[i + 3] = 0; // Make transparent
        } else if (dist < threshold + 25) {
          data[i + 3] = Math.round(((dist - threshold) / 25) * 255); // Smooth feather edge
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (e) => reject(e);

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof Blob) {
      img.src = URL.createObjectURL(imageSource);
    }
  });
}
