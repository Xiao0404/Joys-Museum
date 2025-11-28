import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, RefreshCw, Zap } from 'lucide-react';

interface NinjaGameProps {
  onExit: () => void;
}

// --- Constants & Types ---
const TILE_SPACING = 500; // Distance between tiles
const FOV = 400;

type TileType = 'enemy' | 'gap';

interface Tile {
  id: number;
  index: number; // Grid position
  type: TileType;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  color: string;
}

// --- 3D Helper Functions ---
const project = (x: number, y: number, z: number, width: number, height: number, fov: number) => {
  // Prevent division by zero or negative clipping behind camera
  const safeZ = Math.max(z, 1);
  const scale = fov / (fov + safeZ);
  const x2d = x * scale + width / 2;
  const y2d = y * scale + height / 2;
  return { x: x2d, y: y2d, scale };
};

export const NinjaGame: React.FC<NinjaGameProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [health, setHealth] = useState(3);
  
  // Game State Refs (Mutable for 60fps loop)
  const stateRef = useRef({
    tiles: [] as Tile[],
    particles: [] as Particle[],
    currentTileIndex: 0,
    worldZ: 0,         // Current camera Z position (interpolated)
    targetWorldZ: 0,   // Target Z position (based on currentTileIndex)
    playerAction: 'idle' as 'idle' | 'run' | 'jump' | 'attack' | 'hit',
    playerActionTimer: 0,
    shake: 0,
    hitStop: 0,
    lastSpawnIndex: 0,
    score: 0,
    combo: 0,
    health: 3,
  });

  // --- Game Logic ---

  const spawnTile = (index: number) => {
    // Random generation logic
    // Pure 50/50 for simple fast twitch gameplay
    const type: TileType = Math.random() > 0.5 ? 'enemy' : 'gap';

    stateRef.current.tiles.push({
      id: index, // unique id same as index for simplicity here
      index,
      type,
    });
    stateRef.current.lastSpawnIndex = index;
  };

  const spawnParticles = (x: number, y: number, z: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      stateRef.current.particles.push({
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 100,
        z: z,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        vz: (Math.random() - 0.5) * 30,
        life: 1.0,
        color,
      });
    }
  };

  const handleInput = useCallback((action: 'attack' | 'jump') => {
    if (gameState !== 'playing') return;

    const state = stateRef.current;
    
    // In this new mode, we always check the tile at currentTileIndex
    // The player is technically standing "before" this tile.
    const targetTile = state.tiles.find(t => t.index === state.currentTileIndex);

    if (!targetTile) return;

    // Logic:
    // Enemy -> Needs Attack
    // Gap -> Needs Jump
    let isCorrect = false;

    if (targetTile.type === 'enemy' && action === 'attack') isCorrect = true;
    else if (targetTile.type === 'gap' && action === 'jump') isCorrect = true;

    if (isCorrect) {
      // SUCCESS: DASH FORWARD
      state.score += 100 + state.combo * 10;
      state.combo++;
      
      // Advance Logic
      state.currentTileIndex++;
      state.targetWorldZ = state.currentTileIndex * TILE_SPACING;
      
      // Visuals
      state.playerAction = action;
      state.playerActionTimer = 8; // Very fast reset
      state.hitStop = 2; // Tiny pause for "impact" feel
      
      // Spawn new tile ahead to keep the queue full
      spawnTile(state.lastSpawnIndex + 1);
      
      // Cleanup old tiles to save memory
      if (state.tiles.length > 20) {
        state.tiles.shift();
      }

      // Particles at the enemy location (which is at index * SPACING)
      // Since worldZ will move, we spawn them at absolute coordinates
      spawnParticles(0, 0, targetTile.index * TILE_SPACING, action === 'attack' ? '#06b6d4' : '#fbbf24', 15);

      setScore(state.score);
      setCombo(state.combo);
    } else {
      // FAILURE: TAKE DAMAGE & STAY PUT
      takeDamage();
    }
  }, [gameState]);

  const takeDamage = () => {
    const state = stateRef.current;
    state.health--;
    state.combo = 0;
    state.shake = 40; // Violent shake
    state.hitStop = 5;
    state.playerAction = 'hit';
    state.playerActionTimer = 15;
    
    setHealth(state.health);
    setCombo(0);
    spawnParticles(0, 0, state.worldZ + 200, '#ef4444', 30); // Red explosion near camera

    if (state.health <= 0) {
      setGameState('gameover');
    }
  };

  const resetGame = () => {
    stateRef.current = {
      ...stateRef.current,
      tiles: [],
      particles: [],
      currentTileIndex: 0,
      worldZ: 0,
      targetWorldZ: 0,
      score: 0,
      combo: 0,
      health: 3,
      shake: 0,
      // Reset player state to ensure color resets from 'red' to 'blue'
      playerAction: 'idle',
      playerActionTimer: 0,
      hitStop: 0,
    };
    
    // Spawn initial set
    for (let i = 0; i < 10; i++) {
        spawnTile(i);
    }
    
    setScore(0);
    setCombo(0);
    setHealth(3);
    setGameState('playing');
  };

  // --- Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial spawn if empty
    if (stateRef.current.tiles.length === 0) {
        for (let i = 0; i < 10; i++) {
            spawnTile(i);
        }
    }

    let animationFrameId: number;
    
    const render = () => {
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      const width = canvas.width;
      const height = canvas.height;
      const state = stateRef.current;

      // --- UPDATE PHYSICS ---
      
      // Camera Interpolation (The "Dash" effect)
      // Lerp worldZ towards targetWorldZ
      // Speed depends on distance to create a snap effect
      const dist = state.targetWorldZ - state.worldZ;
      if (Math.abs(dist) > 1) {
          state.worldZ += dist * 0.25; // Fast lerp
      } else {
          state.worldZ = state.targetWorldZ;
      }

      if (state.hitStop > 0) {
          state.hitStop--;
          // Skip drawing updates during hitstop for "freeze" effect? 
          // Actually just skip logic updates, keep drawing
      } else {
           // Update particles
           state.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            p.life -= 0.05;
           });
           state.particles = state.particles.filter(p => p.life > 0);
           
           // Timer
           if (state.playerActionTimer > 0) state.playerActionTimer--;
           else if (state.playerAction !== 'hit') state.playerAction = 'run';
      }

      if (state.shake > 0) state.shake *= 0.9;

      // --- DRAW ---
      
      // Background
      ctx.fillStyle = '#09090b'; 
      ctx.fillRect(0, 0, width, height);

      // Camera Shake
      const shakeX = (Math.random() - 0.5) * state.shake;
      const shakeY = (Math.random() - 0.5) * state.shake;
      
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Grid / Tunnel Effect
      ctx.strokeStyle = `rgba(168, 85, 247, 0.2)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Draw floor lines relative to worldZ to give movement feel
      const gridOffset = state.worldZ % 200;
      for (let i = 0; i < 15; i++) {
          // Horizontal lines moving towards camera
          const z = (i * 200) - gridOffset;
          if (z < 10) continue;
          
          const p1 = project(-1000, 200, z, width, height, FOV);
          const p2 = project(1000, 200, z, width, height, FOV);
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
      }
      // Vertical perspective lines
      for (let i = -2; i <= 2; i++) {
          const x = i * 300;
          const pStart = project(x, 200, 10, width, height, FOV);
          const pEnd = project(x, 200, 3000, width, height, FOV);
          ctx.moveTo(pStart.x, pStart.y);
          ctx.lineTo(pEnd.x, pEnd.y);
      }
      ctx.stroke();

      // Render Tiles
      // We render back to front? No, Painter's algorithm: Back to Front.
      // Filter visible tiles
      const visibleTiles = state.tiles.filter(t => {
          const z = t.index * TILE_SPACING - state.worldZ;
          return z > -FOV && z < 3000;
      });

      // Sort by Z (far to close)
      visibleTiles.sort((a, b) => b.index - a.index);

      visibleTiles.forEach(tile => {
        // Relative Z to camera
        const z = tile.index * TILE_SPACING - state.worldZ;
        const p = project(0, 0, z, width, height, FOV);
        const s = p.scale;

        // Draw Platform/Connector
        ctx.fillStyle = '#18181b';
        const w = 400 * s;
        const h = 20 * s;
        ctx.fillRect(p.x - w/2, p.y + 150*s, w, h);

        if (tile.type === 'enemy') {
            // Draw Enemy (Spiky Red)
            const size = 120 * s;
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 20;
            
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - size);
            ctx.lineTo(p.x + size/2, p.y);
            ctx.lineTo(p.x, p.y + size/2);
            ctx.lineTo(p.x - size/2, p.y);
            ctx.fill();
            
            // Icon overlay
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            ctx.arc(p.x, p.y - size/4, size/5, 0, Math.PI*2);
            ctx.fill();
        } else if (tile.type === 'gap') {
            // Draw Gap (Blue Void)
            const size = 120 * s;
            // Draw floating platform segment
            ctx.fillStyle = '#3b82f6';
            ctx.shadowColor = '#3b82f6';
            ctx.shadowBlur = 20;
            
            ctx.fillRect(p.x - size, p.y + 150*s, size * 2, 10*s);
            
            // "Jump" Hint Arrow
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - size);
            ctx.lineTo(p.x + size/2, p.y);
            ctx.lineTo(p.x - size/2, p.y);
            ctx.fill();
        }
      });

      // Render Particles
      state.particles.forEach(p => {
          // Particle Z is absolute, so subtract worldZ
          const relativeZ = p.z - state.worldZ;
          if (relativeZ < 10) return;
          
          const proj = project(p.x, p.y, relativeZ, width, height, FOV);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life);
          const size = 8 * proj.scale;
          ctx.fillRect(proj.x - size/2, proj.y - size/2, size, size);
          ctx.globalAlpha = 1;
      });

      // Draw Player (Fixed relative to camera, but reacts to action)
      // The player is technically at worldZ (relative 0).
      // We draw player at z=200 offset from camera plane for better view
      const playerZ = 200; 
      
      let playerY = 100;
      if (state.playerAction === 'jump') {
          // Jump arc based on interpolation timer (or dash logic)
          // Just a simple hop visual
          playerY = 100 - Math.sin((state.playerActionTimer / 8) * Math.PI) * 150;
      }
      
      const pp = project(0, playerY, playerZ, width, height, FOV);
      const ps = pp.scale;

      ctx.save();
      ctx.translate(pp.x, pp.y);

      // Player Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 160 * ps, 40 * ps, 10 * ps, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Player Body
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#06b6d4';
      
      if (state.playerAction === 'attack') {
          // Slash Visual
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-50 * ps, -50 * ps);
          ctx.lineTo(150 * ps, 50 * ps); // Big slash forward
          ctx.stroke();
          
          // Lunge pose
          ctx.rotate(0.2);
      }

      // Simple Blocky Ninja
      // Color Logic: Hit = Red, Normal = Cyan
      ctx.fillStyle = state.playerAction === 'hit' ? '#ef4444' : '#06b6d4'; 
      
      // Torso
      ctx.fillRect(-20 * ps, -60 * ps, 40 * ps, 60 * ps);
      
      // Head
      ctx.fillStyle = state.playerAction === 'hit' ? '#ef4444' : '#0891b2';
      ctx.fillRect(-15 * ps, -90 * ps, 30 * ps, 30 * ps);
      
      // Eyes/Visor
      ctx.fillStyle = '#fff';
      ctx.fillRect(-5 * ps, -80 * ps, 20 * ps, 5 * ps);

      // Sword (Fixed to Back/Torso) - Replacing the jittery scarf
      if (state.playerAction !== 'hit') {
        ctx.fillStyle = '#e2e8f0'; // Silver/White
        ctx.beginPath();
        // Start attached to right shoulder/back
        ctx.moveTo(10 * ps, -50 * ps);
        // Project outwards and upwards (diagonal sword on back)
        ctx.lineTo(35 * ps, -85 * ps); 
        ctx.lineTo(40 * ps, -80 * ps);
        ctx.lineTo(15 * ps, -45 * ps);
        ctx.fill();
      }

      ctx.restore();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') handleInput('attack');
        if (e.code === 'KeyD' || e.code === 'ArrowRight') handleInput('jump');
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, handleInput]);

  return (
    <div className="fixed inset-0 z-50 bg-black font-mono overflow-hidden select-none">
      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
                <button onClick={onExit} className="pointer-events-auto bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors z-50">
                    <ArrowLeft className="text-white w-6 h-6" />
                </button>
                <div className="flex flex-col">
                    <span className="text-xs text-white/50 uppercase tracking-widest">Score</span>
                    <span className="text-2xl font-bold text-white tabular-nums">{score.toString().padStart(6, '0')}</span>
                </div>
            </div>
            
            {/* Health */}
            <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                    <Heart 
                        key={i} 
                        className={`w-8 h-8 transition-colors duration-300 ${i < health ? 'fill-red-500 text-red-500' : 'text-white/20'}`} 
                    />
                ))}
            </div>
        </div>

        {/* Center - Combo Counter */}
        <AnimatePresence>
            {combo > 1 && (
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1 + Math.min(combo * 0.1, 0.5), opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key="combo"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                >
                    <span className={`text-7xl md:text-9xl font-black italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] ${
                        combo > 20 ? 'text-amber-400' : combo > 10 ? 'text-yellow-200' : 'text-white'
                    }`}>
                        {combo}
                    </span>
                    <span className="text-white/80 tracking-widest uppercase text-lg font-bold">Combo</span>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Start Screen */}
        {gameState === 'start' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto z-50">
                <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-4">
                        <span className="text-cyan-400">NINJA</span> DASH
                    </h1>
                    <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                        点击 <span className="text-red-400 font-bold">红色</span> 按钮 击杀敌人.<br/>
                        点击 <span className="text-cyan-400 font-bold">蓝色</span> 按钮 跳跃.<br/>
                        <span className="text-white text-xs opacity-50 mt-2 block">(Game waits for your input)</span>
                    </p>
                    <button 
                        onClick={() => setGameState('playing')}
                        className="px-8 py-4 bg-white text-black font-bold text-xl uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        START MISSION
                    </button>
                </div>
            </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-950/90 backdrop-blur-md pointer-events-auto z-50">
                <div className="text-center">
                    <h2 className="text-6xl font-black text-white mb-2 tracking-tighter">FAILURE</h2>
                    <p className="text-white/80 text-xl mb-8 font-mono">SCORE: {score}</p>
                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={onExit}
                            className="px-6 py-3 border border-white/20 text-white font-bold hover:bg-white/10 transition-colors"
                        >
                            EXIT
                        </button>
                        <button 
                            onClick={resetGame}
                            className="px-8 py-3 bg-white text-black font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                        >
                            <RefreshCw size={20} /> RETRY
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Touch Controls Layer - ONLY ACTIVE WHEN PLAYING */}
      {gameState === 'playing' && (
          <div className="absolute inset-0 z-40 flex">
            <div 
                className="w-1/2 h-full active:bg-red-500/10 transition-colors touch-none flex items-end justify-center pb-20"
                onTouchStart={(e) => { e.preventDefault(); handleInput('attack'); }}
                onClick={(e) => { e.preventDefault(); handleInput('attack'); }}
            >
                <div className="border-2 border-red-500/30 text-red-500/50 rounded-full w-24 h-24 flex items-center justify-center animate-pulse">
                    <Zap className="w-8 h-8" />
                </div>
            </div>
            <div 
                className="w-1/2 h-full active:bg-cyan-500/10 transition-colors touch-none flex items-end justify-center pb-20"
                onTouchStart={(e) => { e.preventDefault(); handleInput('jump'); }}
                onClick={(e) => { e.preventDefault(); handleInput('jump'); }}
            >
                 <div className="border-2 border-cyan-500/30 text-cyan-500/50 rounded-full w-24 h-24 flex items-center justify-center animate-pulse">
                    <ArrowLeft className="w-8 h-8 rotate-90" />
                </div>
            </div>
          </div>
      )}
    </div>
  );
};