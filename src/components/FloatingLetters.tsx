import React from 'react';
import { motion } from 'framer-motion';
import { useFloatingLetters } from '../hooks/useFloatingLetters';

const FloatingLetters: React.FC = () => {
  const letters = useFloatingLetters(25);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {letters.map((letter) => (
        <motion.div
          key={letter.id}
          className="absolute text-6xl font-bold text-blue-200 select-none"
          style={{
            left: `${letter.x}%`,
            top: `${letter.y}%`,
            transform: `rotate(${letter.rotation}deg) scale(${letter.scale})`,
            opacity: letter.opacity,
          }}
          animate={{
            y: [0, -20, 0],
            rotateY: [0, 180, 360],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {letter.letter}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingLetters;