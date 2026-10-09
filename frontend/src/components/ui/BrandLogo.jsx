import React from 'react';

export const BrandLogo = ({ size = 'default', onClick }) => {
  const isSmall = size === 'small';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''}`}
    >
      {/* Mascot Icon */}
      <div className={`relative shrink-0 flex items-center justify-center ${isSmall ? 'w-6 h-6' : 'w-7 h-7'}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#6799fe] group-hover:text-white transition-colors"
        >
          <path
            d="M23 5c-.3-.2-.5 0-.7.2-.1 0-.1.1-.2.2-.4.4-.8.7-1.4.7-.8 0-1.5.3-2.1.9-.1-.8-.5-1.2-1.2-1.5-.3-.2-.7-.3-1-.7-.2-.2-.2-.5-.3-.8 0-.2-.1-.3-.3-.4-.2 0-.3.2-.4.3-.3.6-.4 1.2-.4 1.8 0 1.4.6 2.5 1.8 3.3.1.1.2.2.1.3-.1.3-.2.5-.3.8 0 .2-.1.2-.3.2-.6-.3-1.2-.7-1.7-1.2-.8-.8-1.6-1.7-2.5-2.4-.2-.2-.4-.3-.7-.5-1-.9.1-1.7.4-1.8.3-.1.1-.4-.7-.4-.8 0-1.6.3-2.6.7-.1.1-.3.1-.4.1-.9-.2-1.8-.2-2.8-.1C5.8 4.8 4.3 5.7 3.2 7.2 1.9 9 1.6 11 2 13.1c.4 2.2 1.5 4 3.2 5.5 1.8 1.5 3.9 2.2 6.2 2.1 1.4-.1 3-.3 4.8-1.8.5.2.9.3 1.7.4.6.1 1.2 0 1.7-.1.7-.2.7-.8.4-.9-2.1-1-1.6-.6-2-.9 1.1-1.2 2.7-3.5 3.2-6.5 0-.3.1-.8.1-1.1 0-.2 0-.2.2-.2.5-.1 1-.2 1.5-.5 1.3-.7 1.9-1.9 2-3.4 0-.2 0-.5-.2-.6z"
            fill="currentColor"
          />
          <circle cx="12.5" cy="11.8" r="0.9" fill="#0a0a0a" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex items-center">
        <span className="font-display font-semibold tracking-[-0.03em] text-white text-[17px] group-hover:text-white/95">
          PandaPulse
        </span>
      </div>
    </div>
  );
};
