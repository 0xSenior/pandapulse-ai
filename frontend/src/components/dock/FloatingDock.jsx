import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MessageSquareCode, 
  Layers, 
  Database, 
  UserCheck 
} from 'lucide-react';

const DOCK_ITEMS = [
  { id: 'home', label: 'Home / Hero', icon: Sparkles, color: 'text-cyan-400' },
  { id: 'chat', label: 'Assistant', icon: MessageSquareCode, color: 'text-blue-400' },
  { id: 'docs', label: 'Architecture', icon: Layers, color: 'text-indigo-400' },
  { id: 'knowledge', label: 'Knowledge Base', icon: Database, color: 'text-amber-400' },
  { id: 'engineer', label: 'The Engineer', icon: UserCheck, color: 'text-emerald-400' },
];

function DockIcon({ mouseX, item, activeTab, onSelect }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // macOS dock magnification formula
  const widthSync = useTransform(distance, [-150, 0, 150], [44, 62, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const isActive = activeTab === item.id;
  const Icon = item.icon;

  return (
    <div className="relative flex flex-col items-center">
      {/* Floating Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -45, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute pointer-events-none px-3 py-1 rounded-lg text-xs font-medium tracking-wide bg-slate-900/90 text-slate-100 border border-white/10 shadow-xl backdrop-blur-xl whitespace-nowrap z-50 flex items-center gap-1.5"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400' : 'bg-slate-400'}`} />
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={ref}
        style={{ width, height: width }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSelect(item.id)}
        className={`relative flex items-center justify-center rounded-2xl cursor-pointer transition-colors duration-200 ${
          isActive 
            ? 'bg-white/15 border border-cyan-400/50 shadow-lg shadow-cyan-500/20 text-white' 
            : 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white'
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-200 ${item.color}`} />
        
        {/* Active Pill Indicator */}
        {isActive && (
          <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
        )}
      </motion.button>
    </div>
  );
}

export const FloatingDock = ({ activeTab, onSelectTab }) => {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.nav
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-3xl bg-slate-950/75 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/60 relative"
      >
        {/* Subtle glowing underlay */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-amber-500/10 blur-xl opacity-60" />

        {DOCK_ITEMS.map((item) => (
          <DockIcon
            key={item.id}
            item={item}
            mouseX={mouseX}
            activeTab={activeTab}
            onSelect={onSelectTab}
          />
        ))}
      </motion.nav>
    </div>
  );
};
