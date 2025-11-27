import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Hand } from 'lucide-react';
import { Game } from '../types';

const games: Game[] = [
  {
    id: '1',
    title: 'Neon Drift',
    category: 'Racing',
    image: 'https://picsum.photos/600/900?random=1',
    description: '虚空中的赛博漂移',
    tags: ['速度', '反应'],
  },
  {
    id: '2',
    title: 'Echoes of Light',
    category: 'Puzzle',
    image: 'https://picsum.photos/600/900?random=2',
    description: '用光线追踪解开谜题',
    tags: ['逻辑', '宁静'],
  },
  {
    id: '3',
    title: 'Void Breaker',
    category: 'Action',
    image: 'https://picsum.photos/600/900?random=3',
    description: '击碎玻璃天花板',
    tags: ['街机', '激烈'],
  },
  {
    id: '4',
    title: 'Poly Garden',
    category: 'Simulation',
    image: 'https://picsum.photos/600/900?random=4',
    description: '培育你的数字花园',
    tags: ['放松', '养成'],
  },
  {
    id: '5',
    title: 'Binary Beat',
    category: 'Rhythm',
    image: 'https://picsum.photos/600/900?random=5',
    description: '跟随节奏入侵系统',
    tags: ['音乐', '极速'],
  },
];

export const GalleryHall: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = () => {
    if (showHint && containerRef.current && containerRef.current.scrollLeft > 50) {
      setShowHint(false);
    }
  };

  // Mouse Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    // Prevent default to stop text selection or image dragging behaviors
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast multiplier
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="w-full py-24 bg-background border-t border-white/5 relative z-20 overflow-hidden">
      <div className="px-6 md:px-20 mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-2">正在热映</h2>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">A馆 — 精选作品</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-zinc-400 text-sm">
            滑动或拖拽查看 <ArrowRight size={16} />
        </div>
      </div>

      <div className="relative">
        <div 
            ref={containerRef}
            data-lenis-prevent="true"
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-6 overflow-x-auto px-6 md:px-20 pb-20 no-scrollbar touch-pan-x ${
                isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory'
            }`}
            style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
            {games.map((game) => (
            <motion.div
                key={game.id}
                className="relative flex-shrink-0 w-[85vw] md:w-[400px] h-[600px] snap-center group select-none"
                whileHover={{ y: isDragging ? 0 : -10 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <div className="absolute inset-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/10">
                <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out pointer-events-none"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="flex gap-2 mb-3">
                    {game.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-mono border border-white/20 text-white/70 px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        {tag}
                        </span>
                    ))}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{game.title}</h3>
                    <p className="text-zinc-400 text-sm">{game.description}</p>
                </div>
                </div>
                
                {/* Glass reflection effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/5 to-transparent pointer-events-none border border-white/10" />
            </motion.div>
            ))}
            
            {/* End padding */}
            <div className="w-20 flex-shrink-0" />
        </div>

        {/* Mobile Swipe Hint */}
        {showHint && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none md:hidden z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-full w-24 h-24 text-white"
            >
                <Hand className="w-8 h-8 mb-2 animate-pulse" />
                <span className="text-xs font-mono">左滑</span>
            </motion.div>
        )}
      </div>
    </section>
  );
};