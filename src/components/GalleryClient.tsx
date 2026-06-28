"use client";

import { useState, useMemo, useEffect } from "react";
import GalleryGrid from "@/components/GalleryGrid";
import FilterBar from "@/components/FilterBar";
import Lightbox from "@/components/Lightbox";
import PaletteExplorer from "@/components/PaletteExplorer";
import { getFavourites } from "@/lib/favourites";
import { Photo } from "@/types/photo";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useUI } from "@/lib/uiContext";

export default function GalleryClient({ photosData }: { photosData: Photo[] }) {
  const [activeCategory, setActiveCategory] = useState("Best");
  const [viewMode, setViewMode] = useState<'grid' | 'palette'>('grid');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const refreshFavourites = () => setFavourites(getFavourites());

    refreshFavourites();
    window.addEventListener("storage", refreshFavourites);
    return () => window.removeEventListener("storage", refreshFavourites);
  }, []);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    photosData.forEach((p) => {
      const cat = p.curation?.category;
      if (cat && cat.trim().toLowerCase() !== "author") {
        cats.add(cat.trim());
      }
    });
    
    // Sort alphabetically but ensure "Best" is always first
    const sorted = Array.from(cats).sort();
    const bestIndex = sorted.findIndex(c => c.toLowerCase() === 'best');
    if (bestIndex > -1) {
      const best = sorted.splice(bestIndex, 1)[0];
      sorted.unshift(best);
    }
    
    return sorted;
  }, [photosData]);

  // Exclude Author photos from the main gallery entirely
  const allGalleryPhotos = useMemo(() => {
    return photosData.filter(p => p.curation?.category?.trim().toLowerCase() !== "author");
  }, [photosData]);

  // Filter photos for Grid Mode
  const filteredPhotos = useMemo(() => {
    if (activeCategory === "Favourites") {
      return allGalleryPhotos.filter(p => favourites.includes(p.id));
    }
    return allGalleryPhotos.filter(p => p.curation?.category?.trim() === activeCategory);
  }, [allGalleryPhotos, activeCategory, favourites]);

  const { setLightboxOpen } = useUI();

  // Lightbox handlers (needs to know which array we are using based on viewMode)
  // Palette mode passes the *original* array index, so we always use allGalleryPhotos for lightbox
  const openLightbox = (photo: Photo) => {
    const index = allGalleryPhotos.findIndex(p => p.id === photo.id);
    setLightboxIndex(index >= 0 ? index : null);
    if (index >= 0) setLightboxOpen(true);
  };
  const closeLightbox = () => {
    setLightboxIndex(null);
    setLightboxOpen(false);
  };
  const refreshFavourites = () => setFavourites(getFavourites());
  
  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % allGalleryPhotos.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + allGalleryPhotos.length) % allGalleryPhotos.length);
    }
  };

  return (
    <>
      {photosData.length > 0 ? (
        <div id="gallery-section" className="min-h-screen bg-background pb-20 relative">
          <FilterBar 
            categories={categories} 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            hasFavourites={favourites.length > 0}
          />
          {/* Added pt-8 to prevent FilterBar from hiding the top row of images */}
          <div className="pt-8">
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <GalleryGrid
                    photos={filteredPhotos}
                    onPhotoClick={openLightbox}
                    onFavouriteToggle={refreshFavourites}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="palette"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <PaletteExplorer photos={allGalleryPhotos} onPhotoClick={openLightbox} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center text-gray-500 font-light">
          <p>No photos found. Check your Google Drive.</p>
        </div>
      )}

      {lightboxIndex !== null && allGalleryPhotos[lightboxIndex] && portalRoot && createPortal(
        <Lightbox 
          photo={allGalleryPhotos[lightboxIndex]} 
          onClose={closeLightbox}
          onNext={handleNext}
          onPrev={handlePrev}
        />,
        portalRoot
      )}
    </>
  );
}
