"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, LayoutGrid, Palette } from "lucide-react";

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  viewMode: 'grid' | 'palette';
  onViewModeChange: (mode: 'grid' | 'palette') => void;
  hasFavourites: boolean;
}

export default function FilterBar({ categories, activeCategory, onCategoryChange, viewMode, onViewModeChange, hasFavourites }: FilterBarProps) {
  const [navbarHeight, setNavbarHeight] = useState(64); // Fallback height

  useEffect(() => {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setNavbarHeight(entry.contentRect.height);
        }
      });
      observer.observe(navbar);
      return () => observer.disconnect();
    } else {
      // Fallback for older browsers
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNavbarHeight(navbar.offsetHeight || 64);
    }
  }, []);

  return (
    <div 
      className="w-full bg-background/80 backdrop-blur-md sticky z-40 border-b border-white/5 py-4 px-6 transition-all duration-300"
      style={{ top: `${navbarHeight}px` }}
    >
      <div className="container mx-auto flex flex-wrap gap-4 justify-between items-center">
        {/* Left: Categories (Hidden in Palette Mode) */}
        <div className={`flex flex-nowrap overflow-x-auto hide-scrollbar gap-2 pb-1 transition-opacity duration-300 w-[calc(100%-100px)] md:w-auto ${viewMode === 'palette' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <AnimatePresence>
            {hasFavourites && (
              <motion.button
                key="favourites-filter"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onCategoryChange("Favourites")}
                className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all duration-300 border ${
                  activeCategory === "Favourites"
                    ? "bg-accent text-black border-accent font-semibold"
                    : "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
                }`}
              >
                <Heart size={14} className="fill-current" />
                Favourites
              </motion.button>
            )}
          </AnimatePresence>
          
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 shrink-0 py-2 rounded-full text-xs uppercase tracking-widest transition-all duration-300 ${
                activeCategory === category 
                  ? "bg-white text-black font-semibold" 
                  : "bg-transparent text-gray-400 hover:text-white border border-white/10 hover:border-white/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Right: View Toggle */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/10">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-full transition-all ${
              viewMode === 'grid' 
                ? 'bg-accent text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('palette')}
            className={`p-2 rounded-full transition-all ${
              viewMode === 'palette' 
                ? 'bg-accent text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Palette size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
