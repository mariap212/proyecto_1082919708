'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { HeroSection } from '@/lib/data/types';

interface HolaMundoProps {
  data: HeroSection;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    rotateX: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

export default function HolaMundo({ data }: HolaMundoProps): React.JSX.Element {
  const words = data.greeting.split(' ');

  return (
    <div className="relative text-center px-6 select-none">

      {/* Halos de fondo */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-indigo-600/10 blur-3xl animate-pulse-slow" />
        <div className="absolute inset-16 rounded-full bg-violet-600/10 blur-2xl animate-float" />
      </div>

      {/* Línea decorativa superior */}
      <motion.div
        className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.8 }}
      />

      {/* Título animado — letra por letra */}
      <div className="overflow-hidden">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block mr-[0.25em] last:mr-0">
            <motion.span
              className="inline-flex"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {word.split('').map((letter, letterIndex) => (
                <motion.span
                  key={letterIndex}
                  variants={letterVariants}
                  className="inline-block text-7xl md:text-[9rem] lg:text-[11rem] font-bold leading-none tracking-tight"
                  style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #818cf8 60%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.span>
          </span>
        ))}
      </div>

      {/* Subtítulo */}
      <motion.p
        custom={0.9}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 text-sm md:text-base tracking-[0.3em] uppercase font-mono text-indigo-400"
      >
        {data.subtitle}
      </motion.p>

      {/* Descripción */}
      <motion.p
        custom={1.1}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="mt-4 max-w-sm md:max-w-md mx-auto text-slate-400 text-sm md:text-base leading-relaxed"
      >
        {data.description}
      </motion.p>

      {/* Separador */}
      <motion.div
        className="mx-auto my-8 h-px w-16 bg-gradient-to-r from-transparent via-slate-600 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      />

      {/* Badge de estado */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5, type: 'spring', stiffness: 300 }}
        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-indigo-500/20 bg-indigo-950/50 backdrop-blur-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        <span className="text-xs font-mono text-slate-300 tracking-wider">
          {data.badge}
        </span>
      </motion.div>

      {/* Grid decorativo de fondo */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}