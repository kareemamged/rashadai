import React, { useState, useEffect, useRef } from 'react';

interface TypingEffectProps {
  text: string;
  onComplete?: () => void;
  className?: string;
  speed?: { min: number; max: number };
  initialDelay?: number;
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  text,
  onComplete,
  className = '',
  speed = { min: 20, max: 50 },
  initialDelay = 400
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  // Function to get random typing speed
  const getRandomSpeed = () => {
    return Math.floor(Math.random() * (speed.max - speed.min + 1)) + speed.min;
  };

  // Add natural pauses at punctuation
  const getPauseTime = (char: string) => {
    if (['.', '!', '?'].includes(char)) return 400;
    if ([',', ';', ':'].includes(char)) return 200;
    return getRandomSpeed();
  };

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    completedRef.current = false;
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, currentIndex === 0 ? initialDelay : getPauseTime(text[currentIndex - 1]));
      
      timeoutRef.current = timer;
      
      return () => clearTimeout(timer);
    } else if (!completedRef.current && onComplete) {
      completedRef.current = true;
      onComplete();
    }
  }, [currentIndex, text, initialDelay, onComplete]);

  return <span className={`typing-effect-text ${className}`}>{displayedText}</span>;
};

export default TypingEffect;


