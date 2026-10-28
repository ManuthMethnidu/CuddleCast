import React, { createContext, useContext, useEffect } from 'react';
import { defaultM3DarkScheme, type M3ColorScheme, applyM3ColorScheme } from '../theme/m3-expressive';

export const ECHORA_ACCENT_HEX = '#2185D5';
export const ECHORA_ACCENT_GLOW = 'rgba(33, 133, 213, 0.5)';

export type AccentColor =
  | 'blue'
  | 'slate'
  | 'red'
  | 'crimson'
  | 'purple'
  | 'green'
  | 'amber'
  | 'pink'
  | 'white';

export interface AccentOption {
  id: AccentColor;
  label: string;
  hex: string;
  glow: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'blue', label: 'Cerulean Blue (Echora Brand)', hex: ECHORA_ACCENT_HEX, glow: ECHORA_ACCENT_GLOW },
];

interface AccentContextType {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  accentHex: string;
  accentGlow: string;
  m3Scheme: M3ColorScheme;
}

const AccentContext = createContext<AccentContextType>({
  accent: 'blue',
  setAccent: () => {},
  accentHex: ECHORA_ACCENT_HEX,
  accentGlow: ECHORA_ACCENT_GLOW,
  m3Scheme: defaultM3DarkScheme,
});

export const AccentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Clear any persisted dynamic accent keys from localStorage
    localStorage.removeItem('dx_accent');
    localStorage.removeItem('echora_palette_v1');

    document.documentElement.style.setProperty('--dx-accent', ECHORA_ACCENT_HEX);
    document.documentElement.style.setProperty('--dx-accent-glow', ECHORA_ACCENT_GLOW);
    applyM3ColorScheme(defaultM3DarkScheme);
  }, []);

  return (
    <AccentContext.Provider
      value={{
        accent: 'blue',
        setAccent: () => {},
        accentHex: ECHORA_ACCENT_HEX,
        accentGlow: ECHORA_ACCENT_GLOW,
        m3Scheme: defaultM3DarkScheme,
      }}
    >
      {children}
    </AccentContext.Provider>
  );
};

export const useAccent = () => useContext(AccentContext);
