import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { Hero } from './components/Hero';
import { KineticExhibit } from './components/KineticExhibit';
import { Manifesto } from './components/Manifesto';
import { Highlights } from './components/Highlights';
import { GalleryHall } from './components/GalleryHall';
import { NinjaGame } from './components/NinjaGame';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'museum' | 'game-ninja'>('museum');

  useEffect(() => {
    if (currentView !== 'museum') return;

    // Initialize Smooth Scrolling only for museum view
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [currentView]);

  if (currentView === 'game-ninja') {
    return <NinjaGame onExit={() => setCurrentView('museum')} />;
  }

  return (
    <main className="w-full min-h-screen bg-[#0A0A0A] text-white">
      <Hero />
      <KineticExhibit />
      <Manifesto />
      <Highlights />
      <GalleryHall onPlayGame={(id) => {
        if (id === 'ninja') setCurrentView('game-ninja');
      }} />
      
      <footer className="w-full py-10 text-center text-zinc-600 text-xs font-mono tracking-widest uppercase border-t border-white/5">
        &copy; {new Date().getFullYear()} Joys Museum. All rights reserved.
      </footer>
    </main>
  );
};

export default App;