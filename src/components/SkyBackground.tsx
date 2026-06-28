"use client";

import { useEffect, useRef } from "react";
import { SkyTheme } from "@/lib/skyTheme";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  phase: number;
}

export default function SkyBackground({ theme }: { theme: SkyTheme | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!theme || theme.starOpacity === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrameId = 0;
    const stars: Star[] = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.7,
      speed: 2000 + Math.random() * 4000,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.fillStyle = "#ffffff";

      stars.forEach((star) => {
        const twinkle = Math.sin((time / star.speed) * Math.PI * 2 + star.phase) * 0.3;
        context.globalAlpha = Math.max(0, Math.min(1, star.opacity + twinkle));
        context.beginPath();
        context.arc(star.x * window.innerWidth, star.y * window.innerHeight, star.size, 0, Math.PI * 2);
        context.fill();
      });

      context.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  if (!theme) return null;

  return (
    <>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: theme.overlayGradient,
          transition: "background 3s ease",
        }}
      />
      {theme.starOpacity > 0 && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{ opacity: theme.starOpacity }}
        />
      )}
      {theme.label !== "Day" && (
        <div className="fixed bottom-4 right-4 z-[1] pointer-events-none text-[9px] tracking-[0.3em] text-white/20 uppercase">
          {theme.label}
        </div>
      )}
    </>
  );
}
