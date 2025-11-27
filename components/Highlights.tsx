import React from 'react';
import { Zap, Diamond, Eye, Globe } from 'lucide-react';
import { SpotlightCard } from './ui/SpotlightCard';
import { Feature } from '../types';

interface ColoredFeature extends Feature {
  colorClass: string;
  iconBgClass: string;
}

const features: ColoredFeature[] = [
  {
    id: '1',
    title: '极速开玩',
    description: '0 等待，秒级加载，随时随地进入心流。',
    icon: Zap,
    colorClass: 'group-hover:text-cyan-400',
    iconBgClass: 'bg-cyan-500/20 text-cyan-400'
  },
  {
    id: '2',
    title: '严选收录',
    description: '拒绝粗制滥造，只收录设计感与游戏性兼备的佳作。',
    icon: Diamond,
    colorClass: 'group-hover:text-purple-400',
    iconBgClass: 'bg-purple-500/20 text-purple-400'
  },
  {
    id: '3',
    title: '视觉盛宴',
    description: '每一个像素都经过打磨，适配全平台高刷屏。',
    icon: Eye,
    colorClass: 'group-hover:text-emerald-400',
    iconBgClass: 'bg-emerald-500/20 text-emerald-400'
  },
  {
    id: '4',
    title: '全球联结',
    description: '与世界各地的玩家在排行榜上一决高下。',
    icon: Globe,
    colorClass: 'group-hover:text-amber-400',
    iconBgClass: 'bg-amber-500/20 text-amber-400'
  },
];

export const Highlights: React.FC = () => {
  return (
    <section className="w-full py-24 px-6 md:px-20 bg-background relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <SpotlightCard key={feature.id} className="h-full min-h-[250px] flex flex-col justify-center group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${feature.iconBgClass}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className={`text-2xl font-semibold text-white mb-3 tracking-tight transition-colors duration-300 ${feature.colorClass}`}>
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {feature.description}
                </p>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};