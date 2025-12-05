'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTypingStore } from '@/store/typingStore';

export default function TypingArea() {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    status,
    words,
    currentWordIndex,
    currentInput,
    wordResults,
    timeRemaining,
    testMode,
    handleKeyPress,
    handleBackspace,
    handleSpace,
    startTest,
    tick,
  } = useTypingStore();

  // Focus container when test starts
  useEffect(() => {
    if (status === 'running' && containerRef.current) {
      containerRef.current.focus();
    }
  }, [status]);

  // Timer tick
  useEffect(() => {
    if (status !== 'running' || testMode !== 'time') return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [status, testMode, tick]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (status !== 'running') return;

      // Prevent default for special keys
      if (e.key === 'Tab') {
        e.preventDefault();
        useTypingStore.getState().resetTest();
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

      // Only handle printable characters (single character keys)
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    },
    [status, handleKeyPress, handleBackspace, handleSpace]
  );

  // Click to focus and start
  const handleContainerClick = useCallback(() => {
    if (status === 'idle') {
      startTest();
    }
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [status, startTest]);

  // Calculate live WPM
  const calculateLiveWpm = useCallback(() => {
    if (wordResults.length === 0 || !useTypingStore.getState().startTime) return 0;
    const elapsedTime = (Date.now() - useTypingStore.getState().startTime!) / 1000;
    const correctChars = wordResults.reduce(
      (sum, w) => sum + (w.correct ? w.typed.length : 0),
      0
    );
    return Math.round((correctChars / 5 / elapsedTime) * 60);
  }, [wordResults]);

  // Calculate live accuracy
  const calculateLiveAccuracy = useCallback(() => {
    const totalKeystrokes = wordResults.reduce(
      (sum, w) => sum + w.keystrokes.length,
      0
    );
    const correctKeystrokes = wordResults.reduce(
      (sum, w) => sum + w.keystrokes.filter((k) => k.correct).length,
      0
    );
    if (totalKeystrokes === 0) return 100;
    return Math.round((correctKeystrokes / totalKeystrokes) * 100);
  }, [wordResults]);

  // Render word with character highlighting
  const renderWord = useCallback(
    (word: string, index: number) => {
      const isCurrentWord = index === currentWordIndex;
      const wordResult = wordResults[index];
      const isCompleted = index < currentWordIndex;

      return (
        <span
          key={index}
          className={`inline-block mr-4 mb-3 text-2xl font-mono transition-all duration-150 ${
            isCurrentWord ? 'scale-105' : ''
          }`}
        >
          {word.split('').map((char, charIndex) => {
            let className = 'text-gray-500'; // Default - belum diketik

            if (isCompleted && wordResult) {
              // Kata sudah selesai
              if (wordResult.correct) {
                className = 'text-green-400';
              } else {
                // Cek apakah karakter spesifik ini benar
                const typedChar = wordResult.typed[charIndex];
                if (typedChar === char) {
                  className = 'text-green-400';
                } else if (typedChar) {
                  className = 'text-red-500';
                } else {
                  className = 'text-red-500/50'; // Karakter hilang
                }
              }
            } else if (isCurrentWord) {
              // Kata yang sedang diketik
              const typedChar = currentInput[charIndex];
              if (charIndex < currentInput.length) {
                if (typedChar === char) {
                  className = 'text-green-400';
                } else {
                  className = 'text-red-500 bg-red-500/20 rounded';
                }
              } else if (charIndex === currentInput.length) {
                // Posisi kursor saat ini
                className = 'text-white border-l-2 border-yellow-400 -ml-px pl-px animate-pulse';
              }
            }

            return (
              <span key={charIndex} className={className}>
                {char}
              </span>
            );
          })}
          {/* Tampilkan karakter lebih yang diketik sebagai error */}
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
          if (e.key !== 'Tab') {
            e.preventDefault();
            startTest();
          }
        }}
        className="glass-strong rounded-2xl min-h-[250px] flex items-center justify-center cursor-pointer group focus:outline-none"
      >
        <div className="text-center">
          <p className="text-gray-300 text-xl mb-3 group-hover:text-white transition-colors">
            Klik di sini atau tekan tombol apa saja untuk mulai
          </p>
          <p className="text-gray-500 text-sm">
            Tekan Tab untuk restart kapan saja
          </p>
          <div className="mt-6 flex gap-4 justify-center text-gray-500 text-xs">
            <span className="px-3 py-1.5 glass rounded-lg">Spasi = lanjut</span>
            <span className="px-3 py-1.5 glass rounded-lg">Backspace = hapus</span>
            <span className="px-3 py-1.5 glass rounded-lg">Tab = restart</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    return null; // Results akan ditampilkan oleh parent component
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      className="relative focus:outline-none"
    >
      {/* Stats bar */}
      <div className="glass-card rounded-2xl p-4 mb-6 flex justify-between items-center">
        <div className="flex gap-8">
          <div>
            <span className="text-gray-400 text-sm uppercase tracking-wide">WPM</span>
            <div className="text-yellow-400 font-bold text-2xl">{calculateLiveWpm()}</div>
          </div>
          <div>
            <span className="text-gray-400 text-sm uppercase tracking-wide">Akurasi</span>
            <div className="text-green-400 font-bold text-2xl">{calculateLiveAccuracy()}%</div>
          </div>
        </div>
        {testMode === 'time' && (
          <div className="text-4xl font-bold text-yellow-400">
            {timeRemaining}
          </div>
        )}
        {testMode === 'words' && (
          <div className="text-lg text-gray-400">
            <span className="text-white font-bold">{currentWordIndex}</span> / {words.length}
          </div>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="flex gap-3 mb-4 text-xs text-gray-500">
        <span className="px-3 py-1.5 glass rounded-lg">Spasi = lanjut</span>
        <span className="px-3 py-1.5 glass rounded-lg">Backspace = hapus</span>
        <span className="px-3 py-1.5 glass rounded-lg">Tab = restart</span>
      </div>

      {/* Words display */}
      <div className="relative glass-strong rounded-2xl p-8 min-h-[180px] overflow-hidden">
        <div className="flex flex-wrap leading-relaxed">
          {words.slice(0, Math.min(currentWordIndex + 20, words.length)).map((word, index) =>
            renderWord(word, index)
          )}
        </div>

        {/* Click to focus message */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 opacity-0 hover:opacity-100 transition-opacity pointer-events-none rounded-2xl">
          <span className="text-gray-400">Klik untuk fokus</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-1.5 glass rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-green-400 transition-all duration-300"
          style={{
            width: `${(currentWordIndex / words.length) * 100}%`,
          }}
        />
      </div>

      {/* Current word preview */}
      <div className="mt-4 text-center">
        <span className="text-gray-500 text-sm">Kata saat ini: </span>
        <span className="text-white font-mono text-lg">
          {words[currentWordIndex] || ''}
        </span>
      </div>
    </div>
  );
}
