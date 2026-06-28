"use client";

import { useMemo } from "react";
import { Photo } from "@/types/photo";
import { getColorFamily, hexToHsl, sortPhotosByHue } from "@/lib/colorUtils";
import Image from "next/image";

interface PaletteExplorerProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo, index: number) => void;
}

export default function PaletteExplorer({ photos, onPhotoClick }: PaletteExplorerProps) {
  // Extract all unique colors and sort by hue to build the spectrum strip
  const spectrumGradient = useMemo(() => {
    const uniqueColors = new Set<string>();
    photos.forEach(p => {
      p.curation?.dominantColors?.forEach(c => uniqueColors.add(c));
    });
    
    const sortedColors = Array.from(uniqueColors).sort((a, b) => hexToHsl(a).h - hexToHsl(b).h);
    
    if (sortedColors.length === 0) return "transparent";
    return `linear-gradient(to right, ${sortedColors.join(', ')})`;
  }, [photos]);

  // Group photos by family and sort by hue
  const groupedPhotos = useMemo(() => {
    const warm: Photo[] = [];
    const neutral: Photo[] = [];
    const cool: Photo[] = [];
    const unclassified: Photo[] = [];

    photos.forEach(p => {
      const hex = p.curation?.dominantColors?.[0];
      if (!hex) {
        unclassified.push(p);
        return;
      }
      const family = getColorFamily(hex);
      if (family === 'warm') warm.push(p);
      else if (family === 'neutral') neutral.push(p);
      else if (family === 'cool') cool.push(p);
    });

    return {
      warm: sortPhotosByHue(warm),
      neutral: sortPhotosByHue(neutral),
      cool: sortPhotosByHue(cool),
      unclassified
    };
  }, [photos]);

  const families = [
    { id: 'warm', label: 'WARM TONES', dot: '#ef4444', data: groupedPhotos.warm },
    { id: 'neutral', label: 'NEUTRAL TONES', dot: '#10b981', data: groupedPhotos.neutral },
    { id: 'cool', label: 'COOL TONES', dot: '#3b82f6', data: groupedPhotos.cool },
    { id: 'unclassified', label: 'UNCLASSIFIED', dot: '#555555', data: groupedPhotos.unclassified },
  ];

  return (
    <div className="w-full flex flex-col space-y-12 pb-20">
      {/* Spectrum Strip */}
      <div 
        className="w-full h-12 shadow-[0_0_30px_rgba(255,255,255,0.05)]" 
        style={{ background: spectrumGradient }}
      />

      <div className="container mx-auto px-6 space-y-16">
        {families.map(family => (
          family.data.length > 0 && (
            <div key={family.id} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: family.dot }} />
                <h3 className="text-[10px] tracking-[0.3em] text-accent uppercase font-semibold">
                  {family.label}
                </h3>
              </div>

              {/* Horizontal Scroll Row */}
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                {family.data.map((photo) => {
                  const domColor = photo.curation?.dominantColors?.[0] || "#333";
                  // To find the true index for the Lightbox we need to find this photo in the original `photos` array
                  const originalIndex = photos.findIndex(p => p.id === photo.id);
                  
                  return (
                    <div 
                      key={photo.id}
                      onClick={() => onPhotoClick(photo, originalIndex)}
                      className="group relative w-[200px] h-[140px] shrink-0 snap-start cursor-pointer rounded-lg overflow-hidden border border-white/5"
                    >
                      <Image
                        src={photo.thumbnailUrl || `https://drive.google.com/thumbnail?id=${photo.id}&sz=w400`}
                        alt={photo.curation?.title || "Color matching image"}
                        width={200}
                        height={140}
                        sizes="200px"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Glassmorphism Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                        <div 
                          className="w-3 h-3 rounded-full mb-2 shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                          style={{ backgroundColor: domColor }} 
                        />
                        <p className="text-white text-xs font-serif italic truncate w-full">
                          {(photo.name || "").replace(/\.[^/.]+$/, "") || "Untitled"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
