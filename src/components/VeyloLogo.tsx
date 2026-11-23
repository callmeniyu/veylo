// src/components/VeyloLogo.tsx
import React from 'react';

interface VeyloLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
}

export const VeyloLogo: React.FC<VeyloLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showBadge = false,
}) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { icon: 32, text: 'text-xl', badge: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 40, text: 'text-2xl', badge: 'text-xs px-2.5 py-0.5' },
    xl: { icon: 48, text: 'text-3xl', badge: 'text-xs px-2.5 py-1' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="vl-grad-1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="0.5" stopColor="#6366F1" />
              <stop offset="1" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="vl-grad-2" x1="20" y1="6" x2="40" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
            <filter id="vl-glow" x="-4" y="-4" width="56" height="56" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.3" />
            </filter>
          </defs>
          <rect width="48" height="48" rx="12" fill="#0F172A" />
          <path
            d="M12 14L24 36L36 14H29.5L24 25.5L18.5 14H12Z"
            fill="url(#vl-grad-1)"
            filter="url(#vl-glow)"
          />
          <path
            d="M24 36L30 24L36 14H31L24 28.5L20 20H15L24 36Z"
            fill="url(#vl-grad-2)"
            opacity="0.9"
          />
          <circle cx="24" cy="14" r="2.5" fill="#38BDF8" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${currentSize.text}`}>
            Veylo
          </span>
          {showBadge && (
            <span
              className={`font-semibold tracking-wider uppercase rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 ${currentSize.badge}`}
            >
              Demo
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default VeyloLogo;
