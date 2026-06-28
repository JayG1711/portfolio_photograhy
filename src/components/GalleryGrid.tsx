"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { animate, motion, Variants } from "framer-motion";
import { Camera, Heart } from "lucide-react";
import { isFavourite, toggleFavourite } from "@/lib/favourites";
import { Photo } from "@/types/photo";
import Image from "next/image";

interface GalleryGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo, index: number) => void;
  onFavouriteToggle?: () => void;
}

interface PhotoCardProps {
  photo: Photo;
  index: number;
  variants: Variants;
  onPhotoClick: (photo: Photo, index: number) => void;
  onFavouriteToggle?: () => void;
}

function PhotoCard({ photo, index, variants, onPhotoClick, onFavouriteToggle }: PhotoCardProps) {
  const [isFav, setIsFav] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const heartButtonRef = useRef<HTMLButtonElement | null>(null);
  const thumbUrl = photo.thumbnailUrl || `https://drive.google.com/thumbnail?id=${photo.id}&sz=w800`;

  useEffect(() => {
    // localStorage is only available after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFav(isFavourite(photo.id));
  }, [photo.id]);

  const handleFavouriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const wasFavourite = isFav;
    const updated = toggleFavourite(photo.id);
    const nowFavourite = updated.includes(photo.id);

    setIsFav(nowFavourite);
    onFavouriteToggle?.();

    if (heartButtonRef.current) {
      animate(heartButtonRef.current, { scale: [1, 1.4, 1] }, { duration: 0.3 });
    }

    if (!wasFavourite && nowFavourite) {
      setShowParticles(true);
      window.setTimeout(() => setShowParticles(false), 500);
    }
  };

  return (
    <motion.div
      key={photo.id}
      variants={variants}
      className="relative group overflow-hidden bg-card/10 rounded-xl break-inside-avoid cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-1"
      onClick={() => onPhotoClick(photo, index)}
    >
      <div className="relative overflow-hidden rounded-xl">
        <button
          ref={heartButtonRef}
          type="button"
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
          onClick={handleFavouriteClick}
          className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-black/35 backdrop-blur-md p-2 border border-white/10"
        >
          <Heart
            size={20}
            className={`transition-colors duration-300 ${
              isFav
                ? "fill-[#d4af37] text-[#d4af37]"
                : "fill-none text-white/60 hover:text-white"
            }`}
          />
          {showParticles && (
            <span className="pointer-events-none absolute inset-0">
              {Array.from({ length: 6 }).map((_, particleIndex) => {
                const angle = (Math.PI * 2 * particleIndex) / 6;
                return (
                  <motion.span
                    key={particleIndex}
                    className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#d4af37]"
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                    animate={{
                      x: Math.cos(angle) * 28,
                      y: Math.sin(angle) * 28,
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0],
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                );
              })}
            </span>
          )}
        </button>

        <Image
          src={thumbUrl}
          alt={photo.curation?.title || "Gallery image"}
          width={photo.width || 800}
          height={photo.height || 800}
          className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        
        {/* Glassmorphism Hover overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-6 border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
          <div className="relative z-10 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <span className="text-accent text-[10px] uppercase tracking-[0.3em] font-semibold mb-2 block">{photo.curation?.category}</span>
            <h3 className="text-white font-serif text-2xl font-bold leading-tight drop-shadow-md">{photo.curation?.title}</h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function GalleryGrid({ photos, onPhotoClick, onFavouriteToggle }: GalleryGridProps) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  if (photos.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <Camera className="w-12 h-12 text-accent opacity-50 mb-4" />
        <h2 className="text-2xl font-serif text-white mb-2">Nothing here yet</h2>
        <p className="text-gray-400 font-light text-sm">Try a different category</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 p-4 md:p-8 space-y-6"
    >
      {photos.map((photo, index) => {
        return (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={index}
            variants={item}
            onPhotoClick={onPhotoClick}
            onFavouriteToggle={onFavouriteToggle}
          />
        );
      })}
    </motion.div>
  );
}
