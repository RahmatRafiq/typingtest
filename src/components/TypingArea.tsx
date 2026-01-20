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

  useEffect(() => {
    if (status === 'running') {
      setFocusMode(true);
      if (containerRef.current) {
        containerRef.current.focus();
      }
    } else {
      setFocusMode(false);
    }
  }, [status, setFocusMode]);

  useEffect(() => {
    return () => {
      setFocusMode(false);
    };
  }, [setFocusMode]);

  useEffect(() => {
    if (prevStatusRef.current === 'running' && status === 'finished') {
      router.push('/results');
    }
    prevStatusRef.current = status;
  }, [status, router]);

  useEffect(() => {
    if (status !== 'running' || testMode !== 'time' || startTime === null) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [status, testMode, startTime, tick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
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
          className={`inline-block mr-3 sm:mr-4 mb-2 sm:mb-3 text-xl sm:text-2xl transition-all duration-150 ${
            isCurrentWord ? 'scale-105' : ''
          }`}
          style={{ fontFamily: 'var(--font-sketch-mono), monospace' }}
        >
          {word.split('').map((char, charIndex) => {
            let className = 'text-[var(--pencil-light)]';

            if (isCompleted && wordResult) {
              if (wordResult.correct) {
                className = 'text-[var(--pencil-green)]';
              } else {
                const typedChar = wordResult.typed[charIndex];
                if (typedChar === char) {
                  className = 'text-[var(--pencil-green)]';
                } else if (typedChar) {
                  className = 'text-[var(--pencil-red)] line-through decoration-wavy';
                } else {
                  className = 'text-[var(--pencil-red)] opacity-50';
                }
              }
            } else if (isCurrentWord) {
              const typedChar = currentInput[charIndex];
              if (charIndex < currentInput.length) {
                if (typedChar === char) {
                  className = 'text-[var(--pencil-green)] transition-colors duration-100';
                } else {
                  className = 'text-[var(--pencil-red)] bg-[var(--pencil-red)]/10 rounded transition-all duration-100';
                }
              } else if (charIndex === currentInput.length) {
                className = 'text-[var(--pencil)] border-l-2 border-[var(--ink-blue)] -ml-px pl-px animate-cursor';
              }
            }

            return (
              <span key={charIndex} className={`${className} transition-all duration-100`}>
                {char}
              </span>
            );
          })}
          {isCurrentWord && currentInput.length > word.length && (
            <span className="text-[var(--pencil-red)] bg-[var(--pencil-red)]/10 rounded">
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
        className="sketch-card-simple p-6 sm:p-8 min-h-[180px] sm:min-h-[250px] flex items-center justify-center cursor-pointer group focus:outline-none"
      >
        <div className="text-center px-4">
          {/* Hand-drawn arrow pointing down */}
          <div className="flex justify-center mb-4">
            <svg width="60" height="40" viewBox="0 0 60 40" className="animate-bounce">
              <path
                d="M30 5 Q 28 15, 30 25 M20 20 Q 25 28, 30 30 Q 35 28, 40 20"
                stroke="var(--ink-blue)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p
            className="text-[var(--pencil)] text-lg sm:text-2xl mb-2 sm:mb-3 group-hover:text-[var(--ink-blue)] transition-colors"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Klik di sini atau tekan tombol apa saja untuk mulai!
          </p>
          <p
            className="text-[var(--pencil-light)] text-sm sm:text-base"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Tekan Tab untuk restart kapan saja
          </p>

          {/* Keyboard shortcuts as sketch badges */}
          <div className="mt-6 hidden sm:flex gap-3 justify-center flex-wrap">
            <span className="sketch-badge text-[var(--pencil-light)]">Spasi = lanjut</span>
            <span className="sketch-badge text-[var(--pencil-light)]">Backspace = hapus</span>
            <span className="sketch-badge text-[var(--pencil-light)]">Tab = restart</span>
          </div>

          {/* Decorative doodles */}
          <div className="absolute top-4 right-4 opacity-40">
            <span className="doodle-star" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-40">
            <span className="doodle-checkmark" />
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
      {/* Caps Lock Warning - Sketch style */}
      {capsLockOn && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[90] animate-wobble pointer-events-none">
          <div className="flex items-center gap-3 px-6 py-3 sketch-card-simple border-[var(--pencil-yellow)] bg-[var(--pencil-yellow)]/20">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M12 3 L20 19 L4 19 Z M12 8 L12 13 M12 16 L12 17"
                stroke="var(--pencil-yellow)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-[var(--pencil)] text-base font-bold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-sketch), cursive' }}
            >
              Caps Lock Aktif!
            </span>
          </div>
        </div>
      )}

      {/* Stats bar - Sketch style */}
      <div className="sketch-card-simple p-3 sm:p-4 mb-4 sm:mb-6 flex justify-between items-center">
        <div className="flex gap-6 sm:gap-10">
          <div className="text-center">
            <span
              className="text-[var(--pencil-light)] text-xs sm:text-sm uppercase tracking-wide block"
              style={{ fontFamily: 'var(--font-sketch), cursive' }}
            >
              WPM
            </span>
            <div
              className="text-[var(--ink-blue)] font-bold text-2xl sm:text-3xl"
              style={{ fontFamily: 'var(--font-sketch), cursive' }}
            >
              {liveWpm}
            </div>
          </div>
          <div className="text-center">
            <span
              className="text-[var(--pencil-light)] text-xs sm:text-sm uppercase tracking-wide block"
              style={{ fontFamily: 'var(--font-sketch), cursive' }}
            >
              Akurasi
            </span>
            <div
              className="text-[var(--pencil-green)] font-bold text-2xl sm:text-3xl"
              style={{ fontFamily: 'var(--font-sketch), cursive' }}
            >
              {liveAccuracy}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {testMode === 'time' && (
            <div
              className="text-3xl sm:text-5xl font-bold text-[var(--ink-blue)]"
              style={{ fontFamily: 'var(--font-sketch), cursive' }}
            >
              {timeRemaining}
              <span className="text-lg ml-1 text-[var(--pencil-light)]">detik</span>
            </div>
          )}
          {testMode === 'words' && (
            <div
              className="text-lg sm:text-xl text-[var(--pencil-light)]"
              style={{ fontFamily: 'var(--font-sketch), cursive' }}
            >
              <span className="text-[var(--pencil)] font-bold text-2xl">{currentWordIndex}</span>
              <span className="mx-1">/</span>
              {words.length}
            </div>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="hidden sm:flex gap-3 mb-4 text-xs">
        <span className="sketch-badge text-[var(--pencil-light)]">Spasi = lanjut</span>
        <span className="sketch-badge text-[var(--pencil-light)]">Backspace = hapus</span>
        <span className="sketch-badge text-[var(--pencil-light)]">Tab = restart</span>
      </div>

      {/* Main typing area - Notebook paper style */}
      <div className="relative sketch-card-simple p-4 sm:p-8 min-h-[150px] sm:min-h-[180px] overflow-hidden">
        {/* Notebook margin line */}
        <div
          className="absolute left-12 top-0 bottom-0 w-0.5 opacity-30"
          style={{ backgroundColor: '#c08080' }}
        />

        <div className="flex flex-wrap leading-relaxed pl-6">
          {words.slice(0, Math.min(currentWordIndex + 20, words.length)).map((word, index) =>
            renderWord(word, index)
          )}
        </div>

        {/* Focus overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--paper)]/90 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <span
            className="text-[var(--pencil-light)]"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Klik untuk fokus
          </span>
        </div>
      </div>

      {/* Progress bar - Sketch style */}
      <div className="mt-4 sm:mt-6 sketch-progress">
        <div
          className="sketch-progress-bar"
          style={{
            width: `${(currentWordIndex / words.length) * 100}%`,
          }}
        />
      </div>

      {/* Current word indicator */}
      <div className="mt-3 sm:mt-4 text-center">
        <span
          className="text-[var(--pencil-light)] text-sm sm:text-base"
          style={{ fontFamily: 'var(--font-sketch), cursive' }}
        >
          Kata saat ini:{' '}
        </span>
        <span
          className="text-[var(--pencil)] text-lg sm:text-xl highlight-yellow"
          style={{ fontFamily: 'var(--font-sketch-mono), monospace' }}
        >
          {words[currentWordIndex] || ''}
        </span>
      </div>
    </div>
  );
}
