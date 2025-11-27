import React, { useEffect } from 'react';
import Lenis from 'lenis'; // Assuming lenis is available as a module, or we implement a simple version
import { Hero } from './components/Hero';
import { KineticExhibit } from './components/KineticExhibit';
import { Manifesto } from './components/Manifesto';
import { Highlights } from './components/Highlights';
import { GalleryHall } from './components/GalleryHall';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <main className="w-full min-h-screen bg-[#0A0A0A] text-white">
      <Hero />
      <KineticExhibit />
      <Manifesto />
      <Highlights />
      <GalleryHall />
      
      <footer className="w-full py-10 text-center text-zinc-600 text-xs font-mono tracking-widest uppercase border-t border-white/5">
        &copy; {new Date().getFullYear()} Joys Museum. All rights reserved.
      </footer>
    </main>
  );
};

export default App;