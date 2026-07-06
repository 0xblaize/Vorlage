import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface CustomCursorProps {
  theme: 'dark' | 'light';
}

export const CustomCursor = ({ theme }: CustomCursorProps) => {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover' | 'magnetic'>('default');
  const [magneticRect, setMagneticRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      const magneticEl = target.closest('[data-magnetic="true"]') as HTMLElement;
      const interactiveEl = target.closest('button, a, [role="button"]') as HTMLElement;

      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        setMagneticRect({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
        setCursorVariant('magnetic');
      } else if (interactiveEl) {
        setCursorVariant('hover');
      } else {
        setCursorVariant('default');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[100] hidden md:block"
        animate={{
          x: cursorVariant === 'magnetic' ? magneticRect.x - 4 : cursorPos.x - 16,
          y: cursorVariant === 'magnetic' ? magneticRect.y - 4 : cursorPos.y - 16,
          width: cursorVariant === 'magnetic' ? magneticRect.width + 8 : 32,
          height: cursorVariant === 'magnetic' ? magneticRect.height + 8 : 32,
          borderRadius: cursorVariant === 'magnetic' ? 24 : 16,
          scale: cursorVariant === 'hover' ? 1.5 : 1,
          opacity: cursorPos.x < 0 ? 0 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
      >
        <div className={`w-full h-full rounded-[inherit] border-2 ${theme === 'dark' ? 'border-fuchsia-500/50' : 'border-indigo-500/50'} transition-all duration-300 ${cursorVariant === 'magnetic' ? 'bg-fuchsia-500/10 backdrop-blur-sm' : ''}`} />
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[100] hidden md:block"
        animate={{
          x: cursorPos.x - 4,
          y: cursorPos.y - 4,
          opacity: cursorVariant === 'magnetic' ? 0 : 1
        }}
        transition={{ type: "spring", stiffness: 1000, damping: 40 }}
      >
        <div className={`w-full h-full rounded-full ${theme === 'dark' ? 'bg-fuchsia-400' : 'bg-indigo-500'}`} />
      </motion.div>
    </>
  );
};
