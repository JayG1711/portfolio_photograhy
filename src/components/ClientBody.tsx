"use client";

import { useState, useEffect } from "react";
import FilmPreloader from "./FilmPreloader";
import CustomCursor from "./CustomCursor";
import Navbar from "./Navbar";
import SkyBackground from "./SkyBackground";
import FloatingChatbot from "./FloatingChatbot";
import { getCurrentSkyTheme } from "@/lib/skyTheme";
import type { SkyTheme } from "@/lib/skyTheme";
import { UIProvider } from "@/lib/uiContext";

export default function ClientBody({ children, className }: { children: React.ReactNode, className: string }) {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [skyTheme, setSkyTheme] = useState<SkyTheme | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("film-developed")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreloaderDone(true);
    }
  }, []);

  useEffect(() => {
    const applySkyTheme = () => {
      const theme = getCurrentSkyTheme();
      document.documentElement.style.setProperty('--background', theme.background);
      document.documentElement.style.setProperty('--accent', theme.accent);
      setSkyTheme(theme);
    };

    applySkyTheme();
    const intervalId = window.setInterval(applySkyTheme, 600000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <body className={`${className} ${!preloaderDone ? "overflow-hidden" : ""} relative isolate`}>
      <UIProvider>
        <SkyBackground theme={skyTheme} />
        <FilmPreloader onComplete={() => setPreloaderDone(true)} />
        <CustomCursor />
        <Navbar />
        <FloatingChatbot />
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </UIProvider>
    </body>
  );
}
