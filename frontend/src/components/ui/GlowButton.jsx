import React from 'react';

export const GlowButton = ({
  children,
  onClick,
  variant = 'cyan', // 'cyan' | 'violet' | 'amber' | 'outline'
  className = '',
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'violet':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30';
      case 'amber':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-semibold shadow-lg shadow-amber-500/25 border border-amber-300/30';
      case 'outline':
        return 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 hover:border-white/20';
      case 'cyan':
      default:
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25 border border-cyan-300/30';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${getVariantStyles()} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
};
