import { useEffect, useRef } from 'react';

export const useKioskSessionGuard = (onReset: () => void, timeoutMs: number = 60000) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onReset();
      }, timeoutMs);
    };

    const events = ['touchstart', 'click', 'keydown', 'scroll', 'mousemove'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [onReset, timeoutMs]);
};
