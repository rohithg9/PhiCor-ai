import React, { useState } from 'react';
import { useRegion, REGIONS } from '../context/RegionContext';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { Button } from './ui/button';

const RegionSelector = ({ compact = false }) => {
  const { region, setRegion, currentRegion } = useRegion();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (regionCode) => {
    setRegion(regionCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size={compact ? "sm" : "default"}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <span className="text-base">{currentRegion?.flag}</span>
        {!compact && (
          <span className="text-xs font-medium hidden sm:inline">
            {currentRegion?.code}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                <Globe className="h-3 w-3" />
                <span>Select Region</span>
              </div>
            </div>
            
            <div className="p-1">
              {Object.values(REGIONS).map((r) => (
                <button
                  key={r.code}
                  onClick={() => handleSelect(r.code)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-colors
                    ${region === r.code 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted text-foreground'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{r.flag}</span>
                    <span className="font-medium">{r.name}</span>
                  </div>
                  {region === r.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-2 border-t border-border bg-muted/50">
              <p className="text-[10px] text-muted-foreground px-2">
                Units & normal ranges adjust automatically
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegionSelector;
