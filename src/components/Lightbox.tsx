"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Share2, Aperture, Focus, Camera as CameraIcon, Calendar, Send, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Photo } from "@/types/photo";
import Image from "next/image";

export default function Lightbox({ photo, onClose, onNext, onPrev }: { photo: Photo, onClose: () => void, onNext: () => void, onPrev: () => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState(false);
  const [mobileAskOpen, setMobileAskOpen] = useState(false);

  useEffect(() => {
    setQuestion("");
    setAnswer("");
    setIsAsking(false);
    setAskError(false);
    setMobileAskOpen(false);
  }, [photo.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!photo) return null;

  const imageUrl = photo.thumbnailUrl ? photo.thumbnailUrl.replace(/=s\d+$/, '=s2560') : `https://drive.google.com/thumbnail?id=${photo.id}&sz=w2560`;
  const e = photo.exif || {};
  const ambientColor = photo.curation?.dominantColors?.[0] || "transparent";

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const swipeThreshold = 50;

    if (distance > swipeThreshold) {
      onNext();
    } else if (distance < -swipeThreshold) {
      onPrev();
    }
    setTouchStart(null);
  };

  async function askQuestion(q: string) {
    if (!q.trim() || isAsking) return;
    setQuestion(q);
    setIsAsking(true);
    setAnswer("");
    setAskError(false);
    try {
      const res = await fetch("/api/ask-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: photo.id, question: q })
      });
      const data = await res.json();
      if (!res.ok || !data.answer) {
        throw new Error(data.error || "Could not analyze photo");
      }
      setAnswer(data.answer);
    } catch {
      setAskError(true);
    } finally {
      setIsAsking(false);
    }
  }

  const suggestedQuestions = [
    "What mood does this convey?",
    "Describe the lighting",
    "What story is this telling?"
  ];

  const askThisPhotoUI = (
    <div className="space-y-3 pt-6 border-t border-white/10 w-full">
      <h3 className="text-white/80 uppercase tracking-widest text-xs font-semibold pb-2">Ask This Photo</h3>
      
      {!answer && !isAsking && (
        <div className="flex flex-wrap gap-2 mb-2">
          {suggestedQuestions.map(q => (
            <button
              key={q}
              onClick={() => askQuestion(q)}
              className="px-2 py-1 rounded-full text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") askQuestion(question); }}
          placeholder="Ask anything about this photo..."
          maxLength={200}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
        />
        <button
          onClick={() => askQuestion(question)}
          disabled={isAsking || !question.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </div>
      
      {question && (
        <p className="text-[10px] text-gray-500 text-right">{question.length}/200</p>
      )}

      {isAsking && (
        <div className="space-y-2 mt-4">
          <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
        </div>
      )}

      {answer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5 text-gray-300 text-sm font-light italic leading-relaxed"
        >
          {answer}
        </motion.div>
      )}

      {askError && (
        <p className="mt-2 text-red-400/70 text-xs">Could not analyze photo. Try again.</p>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex bg-black/95 backdrop-blur-xl"
        style={{ touchAction: "pan-y" }}
      >
        <motion.div
          key={`glow-${photo.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2, background: `radial-gradient(circle at center, ${ambientColor} 0%, transparent 70%)` }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 pointer-events-none"
        />

        <button onClick={onClose} className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors">
          <X className="w-8 h-8" />
        </button>

        <div
          className="flex-1 relative flex items-center justify-center p-4 md:p-12 pb-24 md:pb-12"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button onClick={onPrev} className="absolute left-6 z-50 p-4 text-white/50 hover:text-white transition-colors hidden md:block">
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-full max-h-full relative z-10 flex items-center justify-center"
          >
            <Image
              src={imageUrl}
              alt={photo.curation?.title || "Gallery image"}
              width={photo.width || 1920}
              height={photo.height || 1080}
              className="max-w-full max-h-full object-contain shadow-2xl"
              sizes="100vw"
            />
          </motion.div>

          <button onClick={onNext} className="absolute right-6 z-50 p-4 text-white/50 hover:text-white transition-colors hidden md:block">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full lg:hidden z-50 p-4">
          <AnimatePresence>
            {mobileAskOpen && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="bg-card/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl mb-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-serif text-lg">Analysis</h3>
                  <button onClick={() => setMobileAskOpen(false)} className="text-gray-400 hover:text-white"><X size={16} /></button>
                </div>
                {askThisPhotoUI}
              </motion.div>
            )}
          </AnimatePresence>
          {!mobileAskOpen && (
            <div className="flex justify-center">
              <button
                onClick={() => setMobileAskOpen(true)}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full shadow-lg text-sm transition-transform active:scale-95"
              >
                <MessageSquare size={16} /> Ask This Photo
              </button>
            </div>
          )}
        </div>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-80 bg-card/50 border-l border-white/5 p-8 flex flex-col gap-8 overflow-y-auto hidden lg:flex relative z-10"
        >
          <div>
            <h2 className="text-3xl font-serif font-bold text-white mb-2">{photo.curation?.title}</h2>
            <p className="text-gray-400 font-light text-sm italic">{photo.curation?.caption}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/80 border border-white/10 uppercase tracking-wider">
              {photo.curation?.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-accent/20 text-accent border border-accent/20 uppercase tracking-wider">
              {photo.curation?.mood}
            </span>
          </div>

          <div className="space-y-4 text-sm text-gray-400">
            <h3 className="text-white/80 uppercase tracking-widest text-xs font-semibold border-b border-white/10 pb-2">EXIF Data</h3>
            
            {e.make || e.model ? (
              <div className="flex items-center gap-3"><CameraIcon className="w-4 h-4 text-accent" /> {e.make} {e.model}</div>
            ) : null}
            
            {e.lens ? (
              <div className="flex items-center gap-3"><Focus className="w-4 h-4 text-accent" /> {e.lens}</div>
            ) : null}

            {e.aperture || e.shutterSpeed || e.iso ? (
              <div className="flex items-center gap-3">
                <Aperture className="w-4 h-4 text-accent" />
                {e.aperture || "--"} | {e.shutterSpeed || "--"}s | ISO {e.iso || "--"}
              </div>
            ) : null}
            
            {e.date ? (
              <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-accent" /> {new Date(e.date).toLocaleDateString()}</div>
            ) : null}
          </div>

          {photo.curation?.dominantColors && (
            <div className="space-y-3">
              <h3 className="text-white/80 uppercase tracking-widest text-xs font-semibold border-b border-white/10 pb-2">Palette</h3>
              <div className="flex gap-2">
                {photo.curation.dominantColors.map((color: string) => (
                  <div key={color} className="w-8 h-8 rounded-full shadow-inner border border-white/10" style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
            </div>
          )}

          {askThisPhotoUI}

          <div className="mt-auto pt-8 border-t border-white/10">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: photo.curation?.title || "Jay Gurav Photography",
                    text: photo.curation?.caption || "",
                    url: window.location.href
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share Collection
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
