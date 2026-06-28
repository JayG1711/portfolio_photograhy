"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Camera, Sun, Grid, Eye, ScanLine, Zap, Sparkles, ChevronRight } from "lucide-react";

const tips = [
  {
    id: "rule-of-thirds",
    category: "Photography Rules",
    curiosity: "The Rule of Thirds is a lie...",
    title: "Break the Grid",
    description: "While the 3x3 grid creates tension, true cinematic energy often comes from dead-center framing or extreme edge placement. Know the rules to break them beautifully.",
    icon: <Grid className="w-8 h-8" />,
    gradient: "from-orange-500 via-rose-500 to-magenta-600",
    shadow: "shadow-[0_0_40px_rgba(244,63,94,0.4)]"
  },
  {
    id: "chase-light",
    category: "Practices",
    curiosity: "Stop looking at your subject.",
    title: "Chase the Light",
    description: "Amateurs look at the person; professionals look at how the light hits their cheekbones. Shoot during the Golden Hour for soft, directional lighting that carves out emotion.",
    icon: <Sun className="w-8 h-8" />,
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    shadow: "shadow-[0_0_40px_rgba(245,158,11,0.4)]"
  },
  {
    id: "exposure-lock",
    category: "Mobile",
    curiosity: "Why your smartphone photos look flat...",
    title: "Exposure Lock & Drop",
    description: "Tap and hold on your subject to lock focus and exposure. Then, drag the sun slider down slightly. Underexposing creates moodier, richer cinematic shadows instantly.",
    icon: <Zap className="w-8 h-8" />,
    gradient: "from-cyan-400 via-blue-500 to-purple-600",
    shadow: "shadow-[0_0_40px_rgba(59,130,246,0.4)]"
  },
  {
    id: "always-carry",
    category: "Practices",
    curiosity: "The expensive gear myth...",
    title: "Always Carry a Camera",
    description: "The best camera isn't the $3000 Sony at home, it's the one in your pocket right now. Don't miss a fleeting moment because your 'real' gear is packed away.",
    icon: <Camera className="w-8 h-8" />,
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    shadow: "shadow-[0_0_40px_rgba(20,184,166,0.4)]"
  },
  {
    id: "observe",
    category: "Practices",
    curiosity: "Put the camera down.",
    title: "Observe Without Shooting",
    description: "Spend time just looking. Watch how light falls on faces and buildings. Train your eyes to see the frame before you ever lift the lens to your face.",
    icon: <Eye className="w-8 h-8" />,
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    shadow: "shadow-[0_0_40px_rgba(168,85,247,0.4)]"
  },
  {
    id: "clean-lens",
    category: "Mobile",
    curiosity: "The secret to sharper photos is free.",
    title: "Clean Your Lens",
    description: "Pocket lint destroys contrast and adds ugly flares. Wipe your smartphone lens on your shirt before every single session. It's the most impactful edit you can make.",
    icon: <ScanLine className="w-8 h-8" />,
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    shadow: "shadow-[0_0_40px_rgba(236,72,153,0.4)]"
  }
];

function TipCard({ tip, index }: { tip: any, index: number }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsRevealed(true)}
      onMouseLeave={() => setIsRevealed(false)}
      onClick={() => setIsRevealed(!isRevealed)}
      className="relative w-full h-[350px] rounded-3xl cursor-pointer group [perspective:1000px]"
    >
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${tip.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl ${tip.shadow} -z-10`} />
      
      <div className={`w-full h-full rounded-3xl relative border border-white/10 bg-neutral-950 transition-all duration-700 [transform-style:preserve-3d] ${isRevealed ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* Front side (Curiosity) */}
        <div className="absolute inset-0 rounded-3xl [backface-visibility:hidden] flex flex-col justify-center items-center p-8 text-center bg-gradient-to-br from-neutral-900 to-black group-hover:from-neutral-800 transition-colors duration-500">
          <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-gray-400">
            {tip.category}
          </div>
          <Sparkles className="w-10 h-10 text-white/10 mb-6 group-hover:text-white/40 transition-colors duration-500" />
          <h3 className="text-2xl md:text-3xl font-serif text-white font-bold leading-tight">
            {tip.curiosity}
          </h3>
          <p className="absolute bottom-8 text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            Hover to reveal <ChevronRight size={14} />
          </p>
        </div>

        {/* Back side (Reveal) */}
        <div className="absolute inset-0 rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between p-8 bg-gradient-to-br from-neutral-900 to-black relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${tip.gradient} opacity-10`} />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-auto">
              <div className={`p-4 rounded-2xl bg-white/10 text-white backdrop-blur-md shadow-lg border border-white/10`}>
                {tip.icon}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-serif text-2xl font-bold text-white mb-3 leading-tight drop-shadow-md">
                {tip.title}
              </h3>
              <p className="text-gray-300 font-light leading-relaxed text-sm md:text-base">
                {tip.description}
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}

export default function TipsClient() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-32 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-24 relative"
        >
          <div className="inline-block relative">
            <h1 className="text-5xl md:text-7xl lg:text-[8rem] font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter drop-shadow-2xl py-4">
              The Craft
            </h1>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -right-4 md:-right-8 -top-4 md:-top-8 bg-gradient-to-br from-orange-500 to-rose-500 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full rotate-12 shadow-[0_0_30px_rgba(244,63,94,0.5)]"
            >
              Secrets Revealed
            </motion.div>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed mt-4">
            Photography is not about the gear; it is about how you see the world. Hover over the cards to unlock the secrets behind cinematic imagery.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {tips.map((tip, index) => (
            <TipCard key={tip.id} tip={tip} index={index} />
          ))}
        </div>

      </div>
    </div>
  );
}
