import { Photo } from "@/types/photo";

export function hexToHsl(hex: string): { h: number, s: number, l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse RGB
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s, l };
}

export function getColorFamily(hex: string): 'warm' | 'neutral' | 'cool' {
  const { h } = hexToHsl(hex);
  
  if ((h >= 0 && h <= 60) || (h >= 300 && h <= 360)) {
    return 'warm';
  } else if (h >= 61 && h <= 180) {
    return 'neutral';
  } else {
    return 'cool';
  }
}

export function sortPhotosByHue(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => {
    const hexA = a.curation?.dominantColors?.[0];
    const hexB = b.curation?.dominantColors?.[0];
    
    if (!hexA && !hexB) return 0;
    if (!hexA) return 1;
    if (!hexB) return -1;
    
    const hslA = hexToHsl(hexA);
    const hslB = hexToHsl(hexB);
    
    return hslA.h - hslB.h;
  });
}
