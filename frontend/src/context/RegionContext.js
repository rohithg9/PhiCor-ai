import React, { createContext, useContext, useState, useEffect } from 'react';

// Supported regions with their configurations
export const REGIONS = {
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    unitSystem: 'imperial',
    labUnits: 'conventional',
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    unitSystem: 'metric',
    labUnits: 'SI',
  },
  EU: {
    code: 'EU',
    name: 'Europe',
    flag: '🇪🇺',
    unitSystem: 'metric',
    labUnits: 'SI',
  },
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    unitSystem: 'metric',
    labUnits: 'SI',
  },
  ASIA: {
    code: 'ASIA',
    name: 'Asia Pacific',
    flag: '🌏',
    unitSystem: 'metric',
    labUnits: 'SI',
  },
};

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  // Initialize from localStorage or detect from browser
  const [region, setRegion] = useState(() => {
    const saved = localStorage.getItem('phicor_region');
    if (saved && REGIONS[saved]) {
      return saved;
    }
    // Auto-detect from browser timezone/locale
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locale = navigator.language || 'en-US';
      
      if (timezone?.includes('America') || locale.includes('US')) return 'US';
      if (timezone?.includes('Europe/London') || locale.includes('GB')) return 'UK';
      if (timezone?.includes('Europe')) return 'EU';
      if (timezone?.includes('Asia/Kolkata') || timezone?.includes('Asia/Mumbai') || locale.includes('IN')) return 'IN';
      if (timezone?.includes('Asia')) return 'ASIA';
    } catch (e) {
      console.log('Could not detect region:', e);
    }
    return 'US'; // Default
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('phicor_region', region);
  }, [region]);

  const currentRegion = REGIONS[region];

  const value = {
    region,
    setRegion,
    currentRegion,
    regions: REGIONS,
    isMetric: currentRegion?.unitSystem === 'metric',
    isSI: currentRegion?.labUnits === 'SI',
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};

export default RegionContext;
