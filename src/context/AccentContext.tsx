import React, { createContext, useContext, useState, useEffect } from 'react';

export type AccentColor = 'red' | 'blue' | 'crimson' | 'purple' | 'green' | 'amber' | 'pink' | 'white';

export interface AccentOption {
  id: AccentColor;
  label: string;
  hex: string;
  glow: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'red', label: 'Cinema Red (DX.BI Default)', hex: '#e50914', glow: 'rgba(229, 9, 20, 0.5)' },
  { id: 'blue', label: 'Electric Blue', hex: '#2f80ff', glow: 'rgba(47, 128, 255, 0.5)' },
  { id: 'crimson', label: 'Crimson', hex: '#d81f3c', glow: 'rgba(216, 31, 60, 0.5)' },
  { id: 'purple', label: 'Violet', hex: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
  { id: 'green', label: 'Emerald', hex: '#1db954', glow: 'rgba(29, 185, 84, 0.5)' },
  { id: 'amber', label: 'Amber Gold', hex: '#f5a524', glow: 'rgba(245, 165, 36, 0.5)' },
  { id: 'pink', label: 'Neon Pink', hex: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)' },
  { id: 'white', label: 'Mono White', hex: '#f4f4f5', glow: 'rgba(244, 244, 245, 0.4)' },
];

interface AccentContextType {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  accentHex: string;
  accentGlow: string;
}

const AccentContext = createContext<AccentContextType>({
  accent: 'red',
  setAccent: () => {},
  accentHex: '#e50914',
  accentGlow: 'rgba(229, 9, 20, 0.5)',
});

export const AccentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    // Ensure dx.bi v2 defaults to iconic Cinema Red (#e50914)
    const initialized = localStorage.getItem('dxbi_v2_init');
    if (!initialized) {
      localStorage.setItem('dxbi_v2_init', 'true');
      localStorage.setItem('dx_accent', 'red');
      return 'red';
    }
    return (localStorage.getItem('dx_accent') as AccentColor) || 'red';
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
