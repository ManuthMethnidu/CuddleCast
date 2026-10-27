import React, { createContext, useContext, useState, useEffect } from 'react';

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
  { id: 'blue', label: 'Cerulean Blue (Echora Default)', hex: '#2185D5', glow: 'rgba(33, 133, 213, 0.5)' },
  { id: 'slate', label: 'Steel Slate', hex: '#3A4750', glow: 'rgba(58, 71, 80, 0.6)' },
  { id: 'red', label: 'Cinema Red', hex: '#e50914', glow: 'rgba(229, 9, 20, 0.5)' },
  { id: 'crimson', label: 'Crimson', hex: '#d81f3c', glow: 'rgba(216, 31, 60, 0.5)' },
  { id: 'purple', label: 'Violet', hex: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
  { id: 'green', label: 'Emerald', hex: '#1db954', glow: 'rgba(29, 185, 84, 0.5)' },
  { id: 'amber', label: 'Amber Gold', hex: '#f5a524', glow: 'rgba(245, 165, 36, 0.5)' },
  { id: 'pink', label: 'Neon Pink', hex: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)' },
  { id: 'white', label: 'Mono White', hex: '#F3F3F3', glow: 'rgba(243, 243, 243, 0.4)' },
];

interface AccentContextType {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  accentHex: string;
  accentGlow: string;
}

const AccentContext = createContext<AccentContextType>({
  accent: 'blue',
  setAccent: () => {},
  accentHex: '#2185D5',
  accentGlow: 'rgba(33, 133, 213, 0.5)',
});

export const AccentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    // Migrate or initialize to new Echora Palette (Cerulean Blue #2185D5)
    const initialized = localStorage.getItem('echora_palette_v1');
    if (!initialized) {
      localStorage.setItem('echora_palette_v1', 'true');
      localStorage.setItem('dx_accent', 'blue');
      return 'blue';
    }
    return (localStorage.getItem('dx_accent') as AccentColor) || 'blue';
  });

  const activeOption = ACCENT_OPTIONS.find(o => o.id === accent) || ACCENT_OPTIONS[0];

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem('dx_accent', newAccent);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--dx-accent', activeOption.hex);
    document.documentElement.style.setProperty('--dx-accent-glow', activeOption.glow);
  }, [activeOption]);

  return (
    <AccentContext.Provider
      value={{
        accent,
        setAccent,
        accentHex: activeOption.hex,
        accentGlow: activeOption.glow,
      }}
    >
      {children}
    </AccentContext.Provider>
  );
};

export const useAccent = () => useContext(AccentContext);
