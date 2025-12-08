'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTypingStore } from '@/store/typingStore';
import { useFocus } from '@/context/FocusContext';
import Results from '@/components/Results';

export default function ResultsPage() {
  const router = useRouter();
  const { status, results, resetTest } = useTypingStore();
  const { setFocusMode } = useFocus();

  // Reset focus mode saat masuk results page
  useEffect(() => {
    setFocusMode(false);
  }, [setFocusMode]);

  useEffect(() => {
    // Redirect ke home jika belum ada hasil
    if (status !== 'finished' || !results) {
      router.push('/');
    }
  }, [status, results, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        resetTest();
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetTest, router]);

  if (status !== 'finished' || !results) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Results />
    </div>
  );
}
