import { useEffect } from 'react';

export const useKioskTamperDetection = (onTamperDetected: () => void) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        onTamperDetected();
      }
    };

    const handleBlur = () => {
      onTamperDetected();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Catch escape, alt+tab simulation, meta keys
      if (e.key === 'Escape' || (e.altKey && e.key === 'Tab') || e.metaKey || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        onTamperDetected();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onTamperDetected]);
};
