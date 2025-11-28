import React, { useRef, useState } from 'react';

export interface SpotlightCardProps extends React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode;
}

export const SpotlightCard = ({ 
  children, 
  className = "", 
  onClick, 
  onMouseMove,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  ...props 
}: SpotlightCardProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    onMouseMove?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    setOpacity(1);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setOpacity(0);
    onBlur?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setOpacity(1);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setOpacity(0);
    onMouseLeave?.(e);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/5 px-8 py-10 transition-colors duration-300 hover:border-white/20 ${className}`}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};