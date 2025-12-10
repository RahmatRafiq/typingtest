'use client';

import { useEffect, useCallback, useRef } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: { preventDefault?: boolean }
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === key) {
      if (options?.preventDefault) {
        e.preventDefault();
      }
      callbackRef.current();
    }
  }, [key, options?.preventDefault]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
