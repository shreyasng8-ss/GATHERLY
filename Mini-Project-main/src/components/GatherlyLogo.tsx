import React from 'react';

interface GatherlyLogoProps {
  variant?: 'cyan' | 'orange' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}

export const GatherlyLogo: React.FC<GatherlyLogoProps> = ({
  variant = 'cyan',
  size = 'md',
  withText = true,
  className = '',
}) => {
  const isOrange = variant === 'orange';
  const primaryColor = isOrange ? '#ff7a00' : variant === 'white' ? '#ffffff' : '#00f2ff';
  const glowFilter = isOrange
    ? 'drop-shadow(0 0 8px rgba(255,122,0,0.5))'
    : variant === 'cyan'
    ? 'drop-shadow(0 0 8px rgba(0,242,255,0.6))'
    : 'none';

  const sizeClasses = {
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-9',
    xl: 'h-11',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-extrabold tracking-tight',
    xl: 'text-3xl font-extrabold tracking-tight',
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Authentic Gatherly cluster node icon */}
      <svg
        className={`${sizeClasses[size]} w-auto transition-transform hover:scale-105`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: glowFilter }}
      >
        {isOrange ? (
          // Electric Orange Spark node
          <g>
            <circle cx="16" cy="16" r="4.5" fill="#ff7a00" />
            <circle cx="8" cy="8" r="2.5" fill="#ffb68b" />
            <circle cx="24" cy="8" r="2.5" fill="#ffb68b" />
            <circle cx="24" cy="24" r="2.5" fill="#ffb68b" />
            <circle cx="8" cy="24" r="2.5" fill="#ffb68b" />
            <line x1="16" y1="16" x2="8" y2="8" stroke="#ff7a00" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="16" x2="24" y2="8" stroke="#ff7a00" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="16" x2="24" y2="24" stroke="#ff7a00" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="16" x2="8" y2="24" stroke="#ff7a00" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 11L13 17H17L15 22" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : (
          // Neon Cyan cluster node as in screenshots
          <g>
            <circle cx="16" cy="16" r="4.5" fill="#00f2ff" />
            <circle cx="7" cy="12" r="3" fill="#00f2ff" />
            <circle cx="25" cy="12" r="3" fill="#00f2ff" />
            <circle cx="11" cy="25" r="3" fill="#00f2ff" />
            <circle cx="21" cy="25" r="3" fill="#00f2ff" />
            <line x1="16" y1="16" x2="7" y2="12" stroke="#00f2ff" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="16" y1="16" x2="25" y2="12" stroke="#00f2ff" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="16" y1="16" x2="11" y2="25" stroke="#00f2ff" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="16" y1="16" x2="21" y2="25" stroke="#00f2ff" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="16" cy="16" r="2" fill="#080f10" />
          </g>
        )}
      </svg>

      {withText && (
        <span
          className={`${textSizes[size]}`}
          style={{
            color: primaryColor,
            textShadow: isOrange
              ? '0 0 16px rgba(255,122,0,0.35)'
              : variant === 'cyan'
              ? '0 0 16px rgba(0,242,255,0.45)'
              : 'none',
            letterSpacing: '-0.02em',
          }}
        >
          Gatherly
        </span>
      )}
    </div>
  );
};
