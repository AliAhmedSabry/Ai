import { useState, useEffect } from 'react';
import { FloatingLetter } from '../types';

const arabicLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

export const useFloatingLetters = (count: number = 20) => {
  const [letters, setLetters] = useState<FloatingLetter[]>([]);

  useEffect(() => {
    const generateLetters = (): FloatingLetter[] => {
      return Array.from({ length: count }, (_, index) => ({
        id: index,
        letter: arabicLetters[Math.floor(Math.random() * arabicLetters.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.4,
        opacity: 0.1 + Math.random() * 0.3,
      }));
    };

    setLetters(generateLetters());

    const interval = setInterval(() => {
      setLetters(prev => prev.map(letter => ({
        ...letter,
        x: (letter.x + 0.1) % 100,
        y: (letter.y + 0.05) % 100,
        rotation: (letter.rotation + 0.5) % 360,
      })));
    }, 100);

    return () => clearInterval(interval);
  }, [count]);

  return letters;
};