import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Hand, Play } from 'lucide-react';
import { Game } from '../types';

interface GalleryHallProps {
  onPlayGame: (gameId: string) => void;
}

const games: Game[] = [
  {
    id: '1',
    internalId: 'ninja',
    title: 'Ninja Must Die',
    category: 'Action',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop', // Retro synthwave aesthetic
    description: 'Neon. Speed. Survival.',
    tags: ['REFLEX', 'ENDLESS', 'NEON'],
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

export const GalleryHall: React.FC<GalleryHallProps> = ({ onPlayGame }) => {
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
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-6 overflow-x-auto px-6 md:px-20 pb-20 no-scrollbar ${
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
                onClick={() => {
                    if (!isDragging && game.internalId) {
                        onPlayGame(game.internalId);
                    }
                }}
            >
                <div className={`absolute inset-0 rounded-xl overflow-hidden bg-zinc-900 border transition-colors duration-300 ${
                    game.internalId ? 'border-cyan-500/50 group-hover:border-cyan-400' : 'border-white/10'
                }`}>
                <img 
                    src={game.image} 
                    alt={game.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out pointer-events-none"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                {/* Play Button Overlay for Playable Games */}
                {game.internalId && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                        <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-cyan-500/50">
                            <Play className="ml-1 w-8 h-8 fill-black" />
                        </div>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 p-8 w-full pointer-events-none">
                    <div className="flex gap-2 mb-3">
                    {game.tags.map(tag => (
                        <span key={tag} className={`text-[10px] font-mono border px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm ${
                            game.internalId 
                                ? 'border-cyan-500/50 text-cyan-300 bg-cyan-950/30' 
                                : 'border-white/20 text-white/70'
                        }`}>
                        {tag}
                        </span>
                    ))}
                    </div>
                    <h3 className={`text-3xl font-bold mb-1 transition-colors ${
                        game.internalId ? 'text-white group-hover:text-cyan-400' : 'text-white group-hover:text-purple-400'
                    }`}>{game.title}</h3>
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