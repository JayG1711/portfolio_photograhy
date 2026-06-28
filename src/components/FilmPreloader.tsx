"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FilmPreloaderProps {
  onComplete?: () => void;
  variant?: 'first' | 'return';
}

export default function FilmPreloader({ onComplete, variant }: FilmPreloaderProps) {
  const [stage, setStage] = useState(0); // 0=hide, 1..4=stages
  const [show, setShow] = useState(false);
  const isReturnVisitorRef = useRef(false);

  useEffect(() => {
    const visitCount = parseInt(localStorage.getItem('jay-visit-count') || '0');
    isReturnVisitorRef.current = variant ? variant === 'return' : visitCount > 0;
    localStorage.setItem('jay-visit-count', String(visitCount + 1));

    const isDeveloped = sessionStorage.getItem("film-developed");
    if (isDeveloped) {
      if (onComplete) onComplete();
      return; // already played this session
    }

    const isReturnVisitor = isReturnVisitorRef.current;
    const s2Delay = isReturnVisitor ? 500 : 800;
    const s3Delay = isReturnVisitor ? 1200 : 1800;
    const minimumDisplay = isReturnVisitor ? 1800 : 2800;
    const exitDuration = isReturnVisitor ? 500 : 700;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);

    // Enforce minimum load time
    const startTime = Date.now();
    
    // Stage 1 (0-0.8s): Grain fade in
    setStage(1);

    // Stage 2 (0.8-1.8s): Gradient + DEVELOPING text
    const s2 = setTimeout(() => setStage(2), s2Delay);
    
    // Stage 3 (1.8-2.8s): Exposure sweep + READY text
    const s3 = setTimeout(() => setStage(3), s3Delay);

    let s4: ReturnType<typeof setTimeout>;
    let exitTimer: ReturnType<typeof setTimeout>;
    const triggerStage4 = () => {
      setStage(4);
      exitTimer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("film-developed", "1");
        if (onComplete) onComplete();
      }, exitDuration); // Wait for Stage 4 exit animation
    };

    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < minimumDisplay) {
        s4 = setTimeout(triggerStage4, minimumDisplay - elapsed);
      } else {
        triggerStage4();
      }
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(s4);
      clearTimeout(exitTimer);
      window.removeEventListener("load", handleLoad);
    };
  }, [onComplete, variant]);

  if (!show) return null;

  // The requested variant flag is stored in a ref so timing and render styling stay locked together.
  // eslint-disable-next-line react-hooks/refs
  const isReturnVisitor = isReturnVisitorRef.current;
  const exitDurationSeconds = isReturnVisitor ? 0.5 : 0.7;
  const stageTwoText = isReturnVisitor ? "WELCOME BACK" : "DEVELOPING";
  const stageThreeText = isReturnVisitor ? "GOOD TO SEE YOU" : "READY";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="film-preloader"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: exitDurationSeconds, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] bg-[#050505] flex items-center justify-center pointer-events-none"
        >
          {/* Stage 1: Grain Texture */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 1 ? 0.15 : 0 }}
            transition={{ duration: isReturnVisitor ? 0.5 : 0.8 }}
            className="absolute inset-0 mix-blend-overlay animate-grain"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
            }}
          />

          {/* Stage 2: Radial Gradient Bloom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 2 ? 1 : 0 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 ${isReturnVisitor && stage >= 2 && stage < 3 ? "animate-warm-pulse" : ""}`}
            style={{
              background: isReturnVisitor
                ? `radial-gradient(circle at center, rgba(60, 35, 10, ${stage >= 3 ? 0.6 : 0.5}) 0%, transparent 70%)`
                : `radial-gradient(circle at center, rgba(30,30,30,${stage >= 3 ? 0.6 : 0.3}) 0%, transparent 70%)`,
              transition: "background 1s ease",
            }}
          />

          {/* Stage 3: Exposure Scanning Line */}
          <AnimatePresence>
            {stage === 3 && (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "linear" }}
                className={`absolute left-0 w-full h-px ${isReturnVisitor ? "bg-[#d4af37]" : "bg-white/30"}`}
              />
            )}
          </AnimatePresence>

          {/* Text Indicators */}
          <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 text-center text-[10px] tracking-[0.4em] uppercase font-sans ${isReturnVisitor ? "text-white/60" : "text-white/40"}`}>
            <AnimatePresence mode="wait">
              {stage >= 2 && stage < 3 && (
                <motion.span
                  key={stageTwoText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {stageTwoText}
                </motion.span>
              )}
              {stage >= 3 && (
                <motion.span
                  key={stageThreeText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className={isReturnVisitor ? "text-accent" : "text-white/80"}
                >
                  {stageThreeText}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
