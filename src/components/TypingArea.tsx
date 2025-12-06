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

  useEffect(() => {
    if (status === 'running' && containerRef.current) {
      containerRef.current.focus();
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'running' || testMode !== 'time') return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [status, testMode, tick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (status !== 'running') return;

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

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    },
    [status, handleKeyPress, handleBackspace, handleSpace]
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

  const calculateLiveWpm = useCallback(() => {
    if (wordResults.length === 0 || !useTypingStore.getState().startTime) return 0;
    const elapsedTimeInMinutes = (Date.now() - useTypingStore.getState().startTime!) / 1000 / 60;
    if (elapsedTimeInMinutes === 0) return 0;

    let correctChars = 0;

    // Count fully correct words characters
    wordResults.forEach((w) => {
      if (w.correct) {
        correctChars += w.expected.length;
        // Add space for correct words (except last one logic is handled in final calc but for live we can approximate)
        // Actually, let's keep it simple: correct chars in correct words + correct spaces
        correctChars++; // Assuming space after correct word is correct
      } else {
        // For incorrect words, we can still count correct characters if we want strictly "correct chars" metric
        // But usually live WPM on Monkeytype is based on correct WORDs or correct CHARS depending on setting.
        // Standard Monkeytype WPM counts correct chars.
        const expectedChars = w.expected.split('');
        const typedChars = w.typed.split('');
        expectedChars.forEach((char, charIndex) => {
          if (typedChars[charIndex] === char) correctChars++;
        });
      }
    });

    // Add current correct characters in the word being typed
    const currentWord = words[currentWordIndex];
    if (currentWord && currentInput) {
      const expectedChars = currentWord.split('');
      const typedChars = currentInput.split('');
      expectedChars.forEach((char, charIndex) => {
        if (typedChars[charIndex] === char) correctChars++;
      });
    }

    // Adjust for space overflow if needed, but simple sum is good for live
    return Math.round((correctChars / 5) / elapsedTimeInMinutes);
  }, [wordResults, currentInput, currentWordIndex, words]);

  const calculateLiveAccuracy = useCallback(() => {
    // Collect all keystrokes from previous words
    const completedKeystrokes = wordResults.reduce(
      (sum, w) => sum + w.keystrokes.length,
      0
    );
    const completedCorrectKeystrokes = wordResults.reduce(
      (sum, w) => sum + w.keystrokes.filter((k) => k.correct).length,
      0
    );

    // Add current word keystrokes from state (need to track them or approximate)
    // Since we don't strictly track currentWordKeystrokes in a way that is exposed easily in this component without subscribe,
    // we can rely on completed words for stability or try to infer.
    // However, `useTypingStore` exposes `currentWordKeystrokes`.
    const currentKeystrokes = useTypingStore.getState().currentWordKeystrokes;
    const currentTotal = completedKeystrokes + currentKeystrokes.length;
    const currentCorrect = completedCorrectKeystrokes + currentKeystrokes.filter(k => k.correct).length;

    if (currentTotal === 0) return 100;
    return Math.round((currentCorrect / currentTotal) * 100);
  }, [wordResults]);

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
          if (e.key !== 'Tab') {
            e.preventDefault();
            startTest();
          }
        }}
        className="glass-strong rounded-2xl min-h-[180px] sm:min-h-[250px] flex items-center justify-center cursor-pointer group focus:outline-none"
      >
        <div className="text-center px-4">
          <p className="text-gray-300 text-base sm:text-xl mb-2 sm:mb-3 group-hover:text-white transition-colors">
            Klik di sini atau tekan tombol apa saja untuk mulai
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">
            Tekan Tab untuk restart kapan saja
          </p>
          <div className="mt-4 sm:mt-6 hidden sm:flex gap-4 justify-center text-gray-500 text-xs">
            <span className="px-3 py-1.5 glass rounded-lg">Spasi = lanjut</span>
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
      <div className="glass-card rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex justify-between items-center">
        <div className="flex gap-4 sm:gap-8">
          <div>
            <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide">WPM</span>
            <div className="text-yellow-400 font-bold text-xl sm:text-2xl">{calculateLiveWpm()}</div>
          </div>
          <div>
            <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide">Akurasi</span>
            <div className="text-green-400 font-bold text-xl sm:text-2xl">{calculateLiveAccuracy()}%</div>
          </div>
        </div>
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

      <div className="hidden sm:flex gap-3 mb-4 text-xs text-gray-500">
        <span className="px-3 py-1.5 glass rounded-lg">Spasi = lanjut</span>
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
