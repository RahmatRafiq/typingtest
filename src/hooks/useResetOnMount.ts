'use client';

import { useEffect } from 'react';
import { useTypingStore } from '@/store/typingStore';
import { useFocus } from '@/context/FocusContext';

export function useResetOnMount() {
  const { status, resetTest } = useTypingStore();
  const { setFocusMode } = useFocus();

  useEffect(() => {
    if (status === 'finished') {
      resetTest();
      setFocusMode(false);
    }
  }, []);
}
