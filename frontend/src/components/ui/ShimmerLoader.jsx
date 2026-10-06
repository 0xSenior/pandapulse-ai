import React from 'react';

export const ShimmerLoader = ({
  className = '',
  lines = 3,
}) => {
  return (
    <div className={`space-y-3 w-full animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="h-3.5 bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 rounded-lg relative overflow-hidden"
          style={{
            width: idx === lines - 1 ? '60%' : idx % 2 === 1 ? '85%' : '100%',
          }}
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      ))}
    </div>
  );
};
