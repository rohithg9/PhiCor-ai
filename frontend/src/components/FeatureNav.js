import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Settings } from 'lucide-react';
import RegionSelector from './RegionSelector';

/**
 * Greek Symbol Navigation Component
 * 
 * Φ (Phi) - PhiCor Engine (Dashboard)
 * Δ (Delta) - Differential Diagnosis
 * Σ (Sigma) - Medical Scribe
 * 
 * Future symbols:
 * Ω (Omega) - Patient Timeline
 * Λ (Lambda) - Lab Calculator
 * Π (Pi) - Probability Engine
 * Θ (Theta) - Treatment Protocols
 */

const features = [
  {
    symbol: 'Φ',
    name: 'PhiCor Engine',
    description: 'Organ models & physiology database',
    path: '/dashboard',
    color: 'from-indigo-500 to-purple-500',
    activeColor: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-500/20',
  },
  {
    symbol: 'Δ',
    name: 'Differential Diagnosis',
    description: 'Mathematical diagnostic engine',
    path: '/differential',
    color: 'from-emerald-500 to-teal-500',
    activeColor: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-500/20',
  },
  {
    symbol: 'ρ',
    name: 'Drug Details',
    description: 'Pharmacology & drug effects',
    path: '/drugs',
    color: 'from-rose-500 to-pink-500',
    activeColor: 'bg-rose-500',
    hoverColor: 'hover:bg-rose-500/20',
  },
  {
    symbol: 'Π',
    name: 'Food Analysis',
    description: 'Mathematical nutrition engine',
    path: '/food',
    color: 'from-green-500 to-lime-500',
    activeColor: 'bg-green-500',
    hoverColor: 'hover:bg-green-500/20',
  },
  {
    symbol: 'Μ',
    name: 'MEDIQ',
    description: 'Clinical pharmacology intelligence',
    path: '/mediq',
    color: 'from-cyan-500 to-teal-500',
    activeColor: 'bg-cyan-500',
    hoverColor: 'hover:bg-cyan-500/20',
  },
];

const FeatureNav = ({ showTitle = true, compact = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <header className={`sticky top-0 z-50 ${isDark ? 'bg-gray-950/95' : 'bg-white/95'} backdrop-blur-xl border-b ${isDark ? 'border-gray-800/50' : 'border-gray-200'}`}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between ${compact ? 'py-2' : 'py-3'}`}>
          
          {/* Logo - PhiCor text only */}
          <div className="flex items-center gap-3">
            {showTitle && (
              <div 
                className="cursor-pointer group"
                onClick={() => navigate('/')}
              >
                <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} group-hover:text-purple-400 transition-colors`}>
                  Phi<span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Cor</span>
                </h1>
              </div>
            )}
          </div>
          
          {/* Greek Symbol Navigation */}
          <nav className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
            {features.map((feature) => (
              <button
                key={feature.path}
                onClick={() => navigate(feature.path)}
                className={`
                  relative group flex items-center justify-center
                  ${compact ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14'}
                  rounded-lg sm:rounded-xl transition-all duration-300
                  ${isActive(feature.path) 
                    ? `bg-gradient-to-br ${feature.color} shadow-lg` 
                    : `${isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'}`
                  }
                `}
                title={feature.name}
              >
                {/* Symbol */}
                <span 
                  className={`
                    font-serif font-bold transition-all duration-300
                    ${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl'}
                    ${isActive(feature.path) 
                      ? 'text-white' 
                      : `${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`
                    }
                  `}
                >
                  {feature.symbol}
                </span>
                
                {/* Active indicator */}
                {isActive(feature.path) && (
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${feature.activeColor}`} />
                )}
                
                {/* Tooltip - only show for non-active pages on hover */}
                {!isActive(feature.path) && (
                  <div className={`
                    absolute top-full mt-2 left-1/2 -translate-x-1/2 
                    px-3 py-2 rounded-lg shadow-xl
                    ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
                    opacity-0 group-hover:opacity-100 pointer-events-none
                    transition-opacity duration-200 whitespace-nowrap z-50
                  `}>
                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {feature.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {feature.description}
                    </div>
                    {/* Tooltip arrow */}
                    <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${isDark ? 'bg-gray-800 border-l border-t border-gray-700' : 'bg-white border-l border-t border-gray-200'}`} />
                  </div>
                )}
              </button>
            ))}
          </nav>
          
          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Region selector */}
            <RegionSelector compact={compact} />
            
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`
                p-2.5 rounded-xl transition-all duration-300
                ${isDark 
                  ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }
              `}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Compact floating version for bottom of pages
export const FloatingNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className={`
        flex items-center gap-2 px-4 py-3 rounded-2xl
        ${isDark ? 'bg-gray-900/95 border border-gray-700/50' : 'bg-white/95 border border-gray-200'}
        backdrop-blur-xl shadow-2xl
      `}>
        {features.map((feature) => (
          <button
            key={feature.path}
            onClick={() => navigate(feature.path)}
            className={`
              relative group flex items-center justify-center w-12 h-12
              rounded-xl transition-all duration-300
              ${isActive(feature.path) 
                ? `bg-gradient-to-br ${feature.color} shadow-lg scale-110` 
                : `${isDark ? 'bg-gray-800/50 hover:bg-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'}`
              }
            `}
            title={feature.name}
          >
            <span 
              className={`
                font-serif font-bold text-xl transition-all
                ${isActive(feature.path) 
                  ? 'text-white' 
                  : `${isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`
                }
              `}
            >
              {feature.symbol}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default FeatureNav;
