"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Photo } from "@/types/photo";
import Image from "next/image";

export default function Hero({ featuredPhoto, dailyStory }: { featuredPhoto: Photo | null, dailyStory?: string }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 800], [1, 0]);
  const scale = useTransform(scrollY, [0, 1000], [1, 1.1]);

  const imageUrl = featuredPhoto?.thumbnailUrl ? featuredPhoto.thumbnailUrl.replace(/=s\d+$/, '=s2560') : (featuredPhoto ? `https://drive.google.com/thumbnail?id=${featuredPhoto.id}&sz=w2560` : null);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Parallax Image Container with Ken Burns effect */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ y, opacity, scale }}
        initial={{ scale: 1.1, filter: "blur(10px)" }}
        animate={{ scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        {imageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={imageUrl}
              alt="Hero featured photo"
              fill
              priority
              className="object-cover"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        {/* Artistic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-70 z-10 mix-blend-multiply" />
        {/* Film Grain Texture (simulated with CSS noise) */}
        <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
      </motion.div>

      {/* Dynamic Typography */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-serif font-black text-white tracking-tighter leading-none mb-6 drop-shadow-2xl mix-blend-overlay uppercase">
            CINEMATIC
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
          className="flex items-center gap-4 max-w-2xl mx-auto"
        >
          <div className="hidden md:block h-[1px] w-12 bg-accent/50 flex-shrink-0" />
          <p className="text-sm md:text-base lg:text-lg text-gray-200 font-light tracking-wide italic drop-shadow-md">
            "{dailyStory || "A Visual Journey"}"
          </p>
          <div className="hidden md:block h-[1px] w-12 bg-accent/50 flex-shrink-0" />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll to Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  );
}
