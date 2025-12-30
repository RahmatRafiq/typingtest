'use client';

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTypingStore } from '@/store/typingStore';
import { useFocus } from '@/context/FocusContext';
import { calculateWpm, calculateAccuracy, countCorrectChars } from '@/lib/calculations';

export default function TypingArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef<string>('idle');
  const router = useRouter();
  const { setFocusMode } = useFocus();
  const [capsLockOn, setCapsLockOn] = useState(false);

  const {
    status,
    words,
    currentWordIndex,
    currentInput,
    wordResults,
    timeRemaining,
    testMode,
    startTime,
    currentWordKeystrokes,
    handleKeyPress,
    handleBackspace,
    handleSpace,
    startTest,
    tick,
    resetTest,
  } = useTypingStore();

  // Focus mode: sembunyikan header saat typing
  useEffect(() => {
    if (status === 'running') {
      setFocusMode(true);
      if (containerRef.current) {
        containerRef.current.focus();
      }
    } else {
      // Reset focus mode saat status bukan 'running' (termasuk 'finished' dan 'idle')
      setFocusMode(false);
    }
  }, [status, setFocusMode]);

  // Pastikan focus mode di-reset saat komponen unmount
  useEffect(() => {
    return () => {
      setFocusMode(false);
    };
  }, [setFocusMode]);

  // Redirect to results when test finishes (only on status change, not on mount)
  useEffect(() => {
    if (prevStatusRef.current === 'running' && status === 'finished') {
      router.push('/results');
    }
    prevStatusRef.current = status;
  }, [status, router]);

  useEffect(() => {
    // Only start timer after first keystroke (when startTime is set)
    if (status !== 'running' || testMode !== 'time' || startTime === null) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [status, testMode, startTime, tick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Always check caps lock status on any key press
      setCapsLockOn(e.getModifierState('CapsLock'));

      if (status !== 'running') return;

      if (e.key === 'Tab') {
        e.preventDefault();
        resetTest();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        handleSpace();
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    },
    [status, handleKeyPress, handleBackspace, handleSpace, resetTest]
  );

  const handleContainerClick = useCallback(() => {
    if (status === 'idle') {
      startTest();
    }
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [status, startTest]);

  const handleBlur = useCallback(() => {
    if (status === 'running' && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.focus();
      }, 10);
    }
  }, [status]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (status === 'running') {
      e.preventDefault();
    }
  }, [status]);

  const liveWpm = useMemo(() => {
    if (wordResults.length === 0 || !startTime) return 0;
    const elapsedTimeInMinutes = (Date.now() - startTime) / 1000 / 60;
    if (elapsedTimeInMinutes <= 0) return 0;

    const currentWord = words[currentWordIndex];
    const correctChars = countCorrectChars(wordResults, currentWord, currentInput);

    return calculateWpm(correctChars, elapsedTimeInMinutes);
  }, [wordResults, currentInput, currentWordIndex, words, startTime]);

  const liveAccuracy = useMemo(() => {
    const completedKeystrokes = wordResults.reduce(
      (sum, w) => sum + w.keystrokes.length,
      0
    );
    const completedCorrectKeystrokes = wordResults.reduce(
      (sum, w) => sum + w.keystrokes.filter((k) => k.correct).length,
      0
    );

    const currentTotal = completedKeystrokes + currentWordKeystrokes.length;
    const currentCorrect = completedCorrectKeystrokes + currentWordKeystrokes.filter(k => k.correct).length;

    return calculateAccuracy(currentCorrect, currentTotal);
  }, [wordResults, currentWordKeystrokes]);

  const renderWord = useCallback(
    (word: string, index: number) => {
      const isCurrentWord = index === currentWordIndex;
      const wordResult = wordResults[index];
      const isCompleted = index < currentWordIndex;

      return (
        <span
          key={index}
          className={`inline-block mr-2 sm:mr-4 mb-2 sm:mb-3 text-lg sm:text-2xl font-mono transition-all duration-150 ${isCurrentWord ? 'scale-105' : ''
            }`}
        >
          {word.split('').map((char, charIndex) => {
            let className = 'text-gray-500';

            if (isCompleted && wordResult) {
              if (wordResult.correct) {
                className = 'text-green-400';
              } else {
                const typedChar = wordResult.typed[charIndex];
                if (typedChar === char) {
                  className = 'text-green-400';
                } else if (typedChar) {
                  className = 'text-red-500';
                } else {
                  className = 'text-red-500/50';
                }
              }
            } else if (isCurrentWord) {
              const typedChar = currentInput[charIndex];
              if (charIndex < currentInput.length) {
                if (typedChar === char) {
                  className = 'text-green-400 transition-colors duration-100';
                } else {
                  className = 'text-red-500 bg-red-500/20 rounded transition-all duration-100';
                }
              } else if (charIndex === currentInput.length) {
                className = 'text-white border-l-2 border-yellow-400 -ml-px pl-px animate-pulse transition-all duration-75';
              }
            }

            return (
              <span key={charIndex} className={`${className} transition-all duration-100`}>
                {char}
              </span>
            );
          })}
          {isCurrentWord && currentInput.length > word.length && (
            <span className="text-red-500 bg-red-500/20 rounded">
              {currentInput.slice(word.length)}
            </span>
          )}
        </span>
      );
    },
    [currentWordIndex, currentInput, wordResults]
  );

  if (status === 'idle') {
    return (
      <div
        ref={containerRef}
        tabIndex={0}
        onClick={handleContainerClick}
        onKeyDown={(e) => {
          setCapsLockOn(e.getModifierState('CapsLock'));
          if (e.key !== 'Tab') {
            e.preventDefault();
            startTest();
          }
        }}
        className="glass-strong rounded-2xl min-h-[180px] sm:min-h-[250px] flex items-center justify-center cursor-pointer group focus:outline-none"
      >
        <div className="text-center px-4">
          <p className="text-gray-300 text-base sm:text-xl mb-2 sm:mb-3 group-hover:text-white transition-colors">
            Klik di sini atau tekan Spasi untuk mulai
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">
            Tekan Tab untuk restart kapan saja
          </p>
          <div className="mt-4 sm:mt-6 hidden sm:flex gap-4 justify-center text-gray-500 text-xs">
            <span className="px-3 py-1.5 glass rounded-lg">Spasi = mulai/lanjut</span>
            <span className="px-3 py-1.5 glass rounded-lg">Backspace = hapus</span>
            <span className="px-3 py-1.5 glass rounded-lg">Tab = restart</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    return null;
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      className="relative focus:outline-none select-none"
    >
      {/* Caps Lock Warning - Fixed position overlay */}
      {capsLockOn && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[90] animate-pulse pointer-events-none">
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-yellow-500/30 border-2 border-yellow-400 backdrop-blur-md shadow-2xl">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
            </svg>
            <span className="text-yellow-400 text-base font-bold uppercase tracking-wider">Caps Lock Aktif!</span>
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
            </svg>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex justify-between items-center">
        <div className="flex gap-4 sm:gap-8">
          <div>
            <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide">WPM</span>
            <div className="text-yellow-400 font-bold text-xl sm:text-2xl">{liveWpm}</div>
          </div>
          <div>
            <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide">Akurasi</span>
            <div className="text-green-400 font-bold text-xl sm:text-2xl">{liveAccuracy}%</div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {testMode === 'time' && (
            <div className="text-2xl sm:text-4xl font-bold text-yellow-400">
              {timeRemaining}
            </div>
          )}
          {testMode === 'words' && (
            <div className="text-sm sm:text-lg text-gray-400">
              <span className="text-white font-bold">{currentWordIndex}</span> / {words.length}
            </div>
          )}
        </div>
      </div>

      <div className="hidden sm:flex gap-3 mb-4 text-xs text-gray-500">
        <span className="px-3 py-1.5 glass rounded-lg">Spasi = mulai/lanjut</span>
        <span className="px-3 py-1.5 glass rounded-lg">Backspace = hapus</span>
        <span className="px-3 py-1.5 glass rounded-lg">Tab = restart</span>
      </div>

      <div className="relative glass-strong rounded-2xl p-4 sm:p-8 min-h-[150px] sm:min-h-[180px] overflow-hidden">
        <div className="flex flex-wrap leading-relaxed">
          {words.slice(0, Math.min(currentWordIndex + 20, words.length)).map((word, index) =>
            renderWord(word, index)
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 opacity-0 hover:opacity-100 transition-opacity pointer-events-none rounded-2xl">
          <span className="text-gray-400">Klik untuk fokus</span>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 h-1 sm:h-1.5 glass rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-green-400 transition-all duration-300"
          style={{
            width: `${(currentWordIndex / words.length) * 100}%`,
          }}
        />
      </div>

      <div className="mt-3 sm:mt-4 text-center">
        <span className="text-gray-500 text-xs sm:text-sm">Kata saat ini: </span>
        <span className="text-white font-mono text-base sm:text-lg">
          {words[currentWordIndex] || ''}
        </span>
      </div>
    </div>
  );
}
