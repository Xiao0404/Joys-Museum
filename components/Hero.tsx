import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const Hero: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background pointer-events-none" />
      
      <motion.div 
        style={{ y: y1, opacity }} 
        className="z-10 text-center px-4"
      >
        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-6 font-serif">
          Joys Museum
        </h1>
        <motion.p 
          style={{ y: y2 }}
          className="text-lg md:text-2xl text-zinc-400 font-light tracking-widest uppercase"
        >
          策展快乐的艺术
        </motion.p>
      </motion.div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-600 text-sm flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span className="tracking-widest">向下滑动进入</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-zinc-600 to-transparent" />
      </motion.div>
    </section>
  );
};