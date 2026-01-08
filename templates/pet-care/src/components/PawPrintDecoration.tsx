import React from 'react';

/**
 * Decorative paw prints scattered in the background
 * Adds playful pet-themed visual element
 */
export const PawPrintDecoration: React.FC = () => {
  const pawPrints = [
    { top: '10%', left: '5%', size: 'w-8 h-8', opacity: 'opacity-10', rotate: 'rotate-12' },
    { top: '25%', left: '85%', size: 'w-12 h-12', opacity: 'opacity-5', rotate: '-rotate-45' },
    { top: '45%', left: '10%', size: 'w-10 h-10', opacity: 'opacity-10', rotate: 'rotate-45' },
    { top: '60%', left: '90%', size: 'w-8 h-8', opacity: 'opacity-5', rotate: '-rotate-12' },
    { top: '80%', left: '15%', size: 'w-12 h-12', opacity: 'opacity-10', rotate: 'rotate-90' },
    { top: '15%', left: '50%', size: 'w-6 h-6', opacity: 'opacity-5', rotate: '-rotate-90' },
    { top: '70%', left: '60%', size: 'w-10 h-10', opacity: 'opacity-10', rotate: 'rotate-12' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {pawPrints.map((paw, index) => (
        <div
          key={index}
          className={`absolute ${paw.size} ${paw.opacity} ${paw.rotate}`}
          style={{ top: paw.top, left: paw.left }}
        >
          <PawIcon />
        </div>
      ))}
    </div>
  );
};

/**
 * Simple paw print SVG icon
 */
export const PawIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`text-pet-blue-600 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main pad */}
    <ellipse cx="12" cy="16" rx="4" ry="5" />
    {/* Toe pads */}
    <circle cx="8" cy="10" r="2" />
    <circle cx="12" cy="8" r="2" />
    <circle cx="16" cy="10" r="2" />
    <circle cx="6" cy="14" r="1.5" />
    <circle cx="18" cy="14" r="1.5" />
  </svg>
);
