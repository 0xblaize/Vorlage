import React, { useState, useRef, useEffect } from 'react';

export const GlowCard = ({ children, theme, className }: { children: React.ReactNode, theme: 'dark' | 'light', className?: string }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden p-8 rounded-2xl border transition-colors duration-500 group ${theme === 'dark' ? 'bg-[#111318] border-white/5 hover:border-white/10' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'} ${className || ''}`}
    >
      {/* Figma-style top inner highlight */}
      <div className={`absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-500 ${theme === 'dark' ? 'shadow-glass-inset opacity-50 group-hover:opacity-100' : 'shadow-glass-inset-light opacity-50 group-hover:opacity-100'}`} />

      {/* Extremely subtle flashlight hover effect */}
      <div 
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'}, transparent 40%)`
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
