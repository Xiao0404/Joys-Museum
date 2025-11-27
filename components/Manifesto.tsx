import React from 'react';
import { motion, Variants } from 'framer-motion';

const textVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.215, 0.61, 0.355, 1.0] as [number, number, number, number],
    },
  }),
};

export const Manifesto: React.FC = () => {
  const lines = [
    { text: "我们不仅仅是游戏库。", color: "text-zinc-200" },
    { text: "在数字噪音喧嚣的时代，", color: "text-zinc-200" },
    { text: "Joys Museum 是一座避世的岛屿。", color: "text-purple-400" },
    { text: "甄选全球最具创意的 H5 体验。", color: "text-zinc-200" },
    { text: "无需下载，点击即玩。", color: "text-amber-400" },
    { text: "找回纯粹的童趣与多巴胺。", color: "text-zinc-200" },
  ];

  return (
    <section className="min-h-[80vh] w-full flex items-center justify-center px-6 md:px-20 py-24 bg-background z-20 relative">
      <div className="max-w-4xl w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-4 md:space-y-8"
        >
            <motion.h2 
                variants={textVariant} 
                custom={0}
                className="text-zinc-600 font-mono text-sm tracking-widest uppercase mb-12"
            >
                The Manifesto
            </motion.h2>

            {lines.map((line, index) => (
                <motion.p
                key={index}
                custom={index + 1}
                variants={textVariant}
                className={`text-2xl md:text-5xl font-light leading-tight ${line.color} transition-colors duration-500`}
                >
                {line.text}
                </motion.p>
            ))}
        </motion.div>
      </div>
    </section>
  );
};