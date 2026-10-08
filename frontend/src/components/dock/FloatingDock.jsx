import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MessageSquareCode,
  Layers,
  Database,
  UserCheck,
  Code2,
} from 'lucide-react';

const DOCK_ITEMS = [
  { id: 'home', label: 'Overview & Standards', icon: Sparkles, color: 'text-cyan-400' },
  { id: 'chat', label: 'PandaPulse AI Workspace', icon: MessageSquareCode, color: 'text-blue-400' },
  { id: 'studio', label: 'Data Studio Canvas', icon: Code2, color: 'text-rose-400' },
  { id: 'docs', label: 'System Architecture', icon: Layers, color: 'text-indigo-400' },
  { id: 'knowledge', label: 'Knowledge Base & Chunks', icon: Database, color: 'text-amber-400' },
  { id: 'engineer', label: 'Ahmed Harby (0xSenior)', icon: UserCheck, color: 'text-emerald-400' },
];

function DockIcon({ coordinate, item, activeTab, onSelect, isVertical }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(coordinate, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
    const center = isVertical
      ? bounds.y + bounds.height / 2
      : bounds.x + bounds.width / 2;
    return val - center;
  });

  // macOS dock magnification formula
  const widthSync = useTransform(distance, [-150, 0, 150], [44, 62, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const isActive = activeTab === item.id;
  const Icon = item.icon;

  return (
    <div className="relative flex items-center justify-center">
      {/* Floating Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={isVertical ? { opacity: 0, x: -5, scale: 0.95 } : { opacity: 0, y: 10, scale: 0.95 }}
            animate={isVertical ? { opacity: 1, x: 58, scale: 1 } : { opacity: 1, y: -45, scale: 1 }}
            exit={isVertical ? { opacity: 0, x: -5, scale: 0.95 } : { opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute pointer-events-none px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide bg-slate-900/95 text-slate-100 border border-white/10 shadow-2xl backdrop-blur-xl whitespace-nowrap z-50 flex items-center gap-1.5 ${isVertical ? 'left-0' : 'bottom-full mb-2'
              }`}
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
        className={`relative flex items-center justify-center rounded-2xl cursor-pointer transition-colors duration-200 ${isActive
            ? 'bg-white/15 border border-cyan-400/50 shadow-lg shadow-cyan-500/25 text-white'
            : 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white'
          }`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-200 ${item.color}`} />

        {/* Active Pill Indicator */}
        {isActive && (
          isVertical ? (
            <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
          ) : (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
          )
        )}
      </motion.button>
    </div>
  );
}

export const FloatingDock = ({ activeTab, onSelectTab, orientation = 'horizontal' }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isVertical = orientation === 'vertical' && !isMobile;
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);

  return (
    <div
      className={
        isVertical
          ? 'fixed left-4 top-1/2 -translate-y-1/2 z-50'
          : 'fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-20px)]'
      }
    >
      <motion.nav
        initial={isVertical ? { x: -50, opacity: 0 } : { y: 50, opacity: 0 }}
        animate={isVertical ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={(e) => {
          if (isVertical) {
            mouseY.set(e.pageY);
          } else {
            mouseX.set(e.pageX);
          }
        }}
        onMouseLeave={() => {
          mouseX.set(Infinity);
          mouseY.set(Infinity);
        }}
        className={`flex ${isVertical ? 'flex-col gap-3 px-3 py-4' : 'flex-row items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 overflow-x-auto no-scrollbar'
          } rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/70 relative`}
      >
        {/* Subtle glowing underlay */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-amber-500/10 blur-xl opacity-60" />

        {DOCK_ITEMS.map((item) => (
          <DockIcon
            key={item.id}
            item={item}
            coordinate={isVertical ? mouseY : mouseX}
            activeTab={activeTab}
            onSelect={onSelectTab}
            isVertical={isVertical}
          />
        ))}
      </motion.nav>
    </div>
  );
};
