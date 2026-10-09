import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MessageSquareCode,
  Layers,
  Database,
  UserCheck,
  Code2,
  Settings,
} from 'lucide-react';

const DOCK_ITEMS = [
  { id: 'home', label: 'Overview', icon: Sparkles },
  { id: 'chat', label: 'Chat Workspace', icon: MessageSquareCode },
  { id: 'studio', label: 'Data Studio Canvas', icon: Code2 },
  { id: 'docs', label: 'Architecture & Docs', icon: Layers },
  { id: 'knowledge', label: 'Knowledge Base', icon: Database },
  { id: 'engineer', label: 'Engineer Profile', icon: UserCheck },
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

  // Smooth dock magnification
  const widthSync = useTransform(distance, [-120, 0, 120], [42, 54, 42]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 16 });

  const isActive = activeTab === item.id;
  const Icon = item.icon;

  return (
    <div className="relative flex items-center justify-center">
      {/* DeepSeek Style Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={isVertical ? { opacity: 0, x: -4, scale: 0.96 } : { opacity: 0, y: 6, scale: 0.96 }}
            animate={isVertical ? { opacity: 1, x: 54, scale: 1 } : { opacity: 1, y: -42, scale: 1 }}
            exit={isVertical ? { opacity: 0, x: -4, scale: 0.96 } : { opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className={`absolute pointer-events-none px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide bg-[#161616]/95 text-white border border-white/10 shadow-xl backdrop-blur-xl whitespace-nowrap z-50 flex items-center gap-1.5 ${
              isVertical ? 'left-0' : 'bottom-full mb-1.5'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#6799fe]' : 'bg-white/40'}`} />
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
        className={`relative flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 ${
          isActive
            ? 'bg-white text-[#0a0a0a] shadow-md shadow-white/10'
            : 'bg-white/[0.04] hover:bg-white/[0.09] text-white/60 hover:text-white border border-white/[0.06] hover:border-white/[0.15]'
        }`}
      >
        <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-[#0a0a0a]' : 'text-current'}`} />

        {/* Small Active Indicator Dot */}
        {isActive && (
          isVertical ? (
            <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-2 rounded-full bg-[#6799fe]" />
          ) : (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
          )
        )}
      </motion.button>
    </div>
  );
}

export const FloatingDock = ({ activeTab, onSelectTab, orientation = 'horizontal', onOpenSettings }) => {
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
          : 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-24px)]'
      }
    >
      <motion.nav
        initial={isVertical ? { x: -40, opacity: 0 } : { y: 40, opacity: 0 }}
        animate={isVertical ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
        className={`flex ${
          isVertical ? 'flex-col gap-2 px-2.5 py-3' : 'flex-row items-center gap-1.5 md:gap-2 px-3 py-1.5'
        } rounded-2xl bg-[#111111]/85 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/80 relative`}
        style={{
          boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 12px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
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

        {onOpenSettings && (
          <>
            <div
              className={
                isVertical
                  ? 'w-5 h-[1px] bg-white/[0.08] my-1 self-center'
                  : 'h-5 w-[1px] bg-white/[0.08] mx-1 self-center'
              }
            />
            <DockIcon
              key="settings"
              item={{ id: 'settings', label: 'Settings & API Keys', icon: Settings }}
              coordinate={isVertical ? mouseY : mouseX}
              activeTab={activeTab}
              onSelect={() => onOpenSettings()}
              isVertical={isVertical}
            />
          </>
        )}
      </motion.nav>
    </div>
  );
};
