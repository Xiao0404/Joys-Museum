import React, { useEffect, useRef } from 'react';

export const KineticExhibit: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight * 0.8; // 80vh
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    // Game state
    const particles: { x: number; y: number; z: number; color: string }[] = [];
    const speed = 15;
    const fov = 300;
    
    // Colors matching the dark/neon theme
    const colors = ['#A855F7', '#3B82F6', '#10B981', '#ffffff'];

    // Car vertices (simple retro low-poly shape)
    const carWidth = 40;
    const carHeight = 20;
    const carDepth = 60;
    
    // Generate initial particles
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 4,
        y: (Math.random() - 0.5) * height * 4,
        z: Math.random() * 2000,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const draw = () => {
      // Clear background with trail effect
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Grid Floor (simple lines moving towards screen)
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)'; // Purple tint
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Only drawing bottom grid for "road" feel
      for (let i = -10; i <= 10; i++) {
        const x = centerX + i * 100;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x * 5, height * 2); 
      }
      ctx.stroke();

      // Update and draw particles (The flying pixels)
      particles.forEach(p => {
        p.z -= speed;
        if (p.z <= 0) {
          p.z = 2000;
          p.x = (Math.random() - 0.5) * width * 4;
          p.y = (Math.random() - 0.5) * height * 4;
        }

        const scale = fov / p.z;
        const x2d = p.x * scale + centerX;
        const y2d = p.y * scale + centerY;
        const size = Math.max(1, 4 * scale);

        // Draw pixel
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, scale);
        ctx.fillRect(x2d, y2d, size, size);
        ctx.globalAlpha = 1;
      });

      // Draw Retro Car (Wireframe/Neon style)
      // Position: Bottom Center
      const carY = centerY + 100;
      
      // Car Body Shake
      const shakeX = (Math.random() - 0.5) * 2;
      const shakeY = (Math.random() - 0.5) * 2;
      
      const cx = centerX + shakeX;
      const cy = carY + shakeY;

      ctx.save();
      ctx.translate(cx, cy);
      
      // Glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#A855F7';
      
      // Draw Car Back (Main Body)
      ctx.fillStyle = '#111';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      
      // Main chassis
      ctx.beginPath();
      ctx.moveTo(-carWidth, 0);
      ctx.lineTo(carWidth, 0);
      ctx.lineTo(carWidth, -carHeight);
      ctx.lineTo(-carWidth, -carHeight);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tail lights
      ctx.fillStyle = '#ff0044'; // Red neon lights
      ctx.shadowColor = '#ff0044';
      ctx.shadowBlur = 10;
      
      // Left light
      ctx.fillRect(-carWidth + 5, -carHeight + 5, 10, 5);
      // Right light
      ctx.fillRect(carWidth - 15, -carHeight + 5, 10, 5);

      // Exhaust flames
      if (Math.random() > 0.5) {
        ctx.fillStyle = '#fbbf24'; // Amber flame
        ctx.beginPath();
        ctx.arc(-carWidth + 20, 0, 4 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(carWidth - 20, 0, 4 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      <div className="absolute bottom-10 right-10 md:right-20 text-right z-10 pointer-events-none">
        <h3 className="text-white/50 font-mono text-xs md:text-sm tracking-widest">
          EXHIBIT 001 <br />
          NEON OVERDRIVE
        </h3>
      </div>
      
      {/* Overlay vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0A0A_90%)] pointer-events-none" />
    </section>
  );
};