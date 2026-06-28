"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  isLightboxOpen: boolean;
  setLightboxOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType>({
  isLightboxOpen: false,
  setLightboxOpen: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  return (
    <UIContext.Provider value={{ isLightboxOpen, setLightboxOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
