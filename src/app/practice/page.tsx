'use client';

import { useState, useCallback } from 'react';
import { useTypingStore } from '@/store/typingStore';
import TypingArea from '@/components/TypingArea';
import Link from 'next/link';
import { WORDS } from '@/lib/words';
import { TYPING_THRESHOLDS } from '@/lib/constants';
import { useResetOnMount } from '@/hooks/useResetOnMount';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

type PracticeMode = 'problem-words' | 'left-hand' | 'right-hand' | 'custom';

export default function PracticePage() {
  const { status, problemWords, startPracticeMode } = useTypingStore();
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('problem-words');
  const [wordCount, setWordCount] = useState(25);
  const [customWords, setCustomWords] = useState('');

  useResetOnMount();

  const generateWords = useCallback(() => {
    let words: string[] = [];

    switch (practiceMode) {
      case 'problem-words':
        const problems = problemWords.slice(0, Math.floor(wordCount * 0.7)).map(p => p.word);
        const fillerCount = wordCount - problems.length;
        words = [...problems];
        const mixedWords = [...WORDS.mixed];
        for (let i = 0; i < fillerCount; i++) {
          words.push(mixedWords[i % mixedWords.length]);
        }
        words = words.sort(() => Math.random() - 0.5);
        break;

      case 'left-hand':
        words = [...WORDS.left].sort(() => Math.random() - 0.5).slice(0, wordCount);
        break;

      case 'right-hand':
        words = [...WORDS.right].sort(() => Math.random() - 0.5).slice(0, wordCount);
        break;

      case 'custom':
        words = customWords
          .trim()
          .split(/\s+/)
          .filter(w => w.length > 0 && w.length <= TYPING_THRESHOLDS.MAX_WORD_LENGTH)
          .slice(0, TYPING_THRESHOLDS.MAX_CUSTOM_WORDS);
        break;
    }

    return words;
  }, [practiceMode, wordCount, customWords, problemWords]);

  const handleTabPress = useCallback(() => {
    if (status !== 'running') {
      const words = generateWords();
      if (words.length > 0) {
        startPracticeMode(words);
      }
    }
  }, [status, generateWords, startPracticeMode]);

  useKeyboardShortcut('Tab', handleTabPress, { preventDefault: true });

  const handleStartPractice = () => {
    const words = generateWords();
    if (practiceMode === 'custom' && words.length === 0) {
      alert('Silakan masukkan beberapa kata untuk dilatih');
      return;
    }
    startPracticeMode(words);
  };

  // TypingArea akan redirect ke /results saat selesai
  if (status === 'running') {
    return (
      <div className="space-y-6 sm:space-y-8">
        <TypingArea />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mode Latihan</h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Latihan tertarget untuk memperbaiki kelemahanmu
        </p>
      </div>

      <section className="glass-card rounded-2xl p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-5">Pilih Jenis Latihan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => setPracticeMode('problem-words')}
            className={`p-4 sm:p-5 rounded-xl text-left transition-all ${
              practiceMode === 'problem-words'
                ? 'bg-yellow-400 text-gray-900'
                : 'glass-button text-gray-300 hover:text-white'
            }`}
          >
            <div className="text-base sm:text-lg font-semibold mb-1">Kata Bermasalah</div>
            <div className={`text-xs sm:text-sm ${practiceMode === 'problem-words' ? 'text-gray-700' : 'text-gray-500'}`}>
              Latih kata-kata yang sulit kamu ketik ({problemWords.length} teridentifikasi)
            </div>
          </button>

          <button
            onClick={() => setPracticeMode('left-hand')}
            className={`p-4 sm:p-5 rounded-xl text-left transition-all ${
              practiceMode === 'left-hand'
                ? 'bg-yellow-400 text-gray-900'
                : 'glass-button text-gray-300 hover:text-white'
            }`}
          >
            <div className="text-base sm:text-lg font-semibold mb-1">Fokus Tangan Kiri</div>
            <div className={`text-xs sm:text-sm ${practiceMode === 'left-hand' ? 'text-gray-700' : 'text-gray-500'}`}>
              Kata yang diketik terutama dengan tangan kiri (QWERT, ASDFG, ZXCVB)
            </div>
          </button>

          <button
            onClick={() => setPracticeMode('right-hand')}
            className={`p-4 sm:p-5 rounded-xl text-left transition-all ${
              practiceMode === 'right-hand'
                ? 'bg-yellow-400 text-gray-900'
                : 'glass-button text-gray-300 hover:text-white'
            }`}
          >
            <div className="text-base sm:text-lg font-semibold mb-1">Fokus Tangan Kanan</div>
            <div className={`text-xs sm:text-sm ${practiceMode === 'right-hand' ? 'text-gray-700' : 'text-gray-500'}`}>
              Kata yang diketik terutama dengan tangan kanan (YUIOP, HJKL, NM)
            </div>
          </button>

          <button
            onClick={() => setPracticeMode('custom')}
            className={`p-4 sm:p-5 rounded-xl text-left transition-all ${
              practiceMode === 'custom'
                ? 'bg-yellow-400 text-gray-900'
                : 'glass-button text-gray-300 hover:text-white'
            }`}
          >
            <div className="text-base sm:text-lg font-semibold mb-1">Kata Kustom</div>
            <div className={`text-xs sm:text-sm ${practiceMode === 'custom' ? 'text-gray-700' : 'text-gray-500'}`}>
              Masukkan kata-kata sendiri untuk dilatih
            </div>
          </button>
        </div>
      </section>

      {practiceMode === 'custom' && (
        <section className="glass-card rounded-2xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Masukkan Kata Kustom</h2>
          <textarea
            value={customWords}
            onChange={(e) => setCustomWords(e.target.value)}
            placeholder="Masukkan kata-kata dipisahkan dengan spasi..."
            className="w-full h-28 sm:h-32 glass-input text-white text-sm sm:text-base rounded-xl p-3 sm:p-4 focus:outline-none"
          />
        </section>
      )}

      {practiceMode !== 'custom' && (
        <section className="glass-card rounded-2xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Jumlah Kata</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[15, 25, 50, 100].map((count) => (
              <button
                key={count}
                onClick={() => setWordCount(count)}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base font-medium ${
                  wordCount === count
                    ? 'bg-yellow-400 text-gray-900'
                    : 'glass-button text-gray-300 hover:text-white'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </section>
      )}

      {practiceMode === 'problem-words' && problemWords.length > 0 && (
        <section className="glass-subtle rounded-2xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Kata yang Akan Dilatih</h2>
          <div className="flex flex-wrap gap-2">
            {problemWords.slice(0, 20).map((word) => (
              <span
                key={word.word}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-mono ${
                  word.severityScore > 60
                    ? 'bg-red-500/20 text-red-400'
                    : word.severityScore > 30
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                }`}
              >
                {word.word}
              </span>
            ))}
            {problemWords.length > 20 && (
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-gray-500 text-xs sm:text-sm">
                +{problemWords.length - 20} lagi
              </span>
            )}
          </div>
        </section>
      )}

      {practiceMode === 'problem-words' && problemWords.length === 0 && (
        <div className="glass border border-yellow-500/30 rounded-2xl p-4 sm:p-6">
          <p className="text-yellow-400 text-sm sm:text-base">
            Belum ada kata bermasalah terdeteksi.{' '}
            <Link href="/" className="underline hover:text-yellow-300">
              Lakukan test dulu
            </Link>{' '}
            untuk mengidentifikasi kata yang sulit, atau pilih mode latihan lain.
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleStartPractice}
          disabled={practiceMode === 'problem-words' && problemWords.length === 0}
          className="px-8 py-3 sm:px-12 sm:py-4 bg-yellow-400 text-gray-900 rounded-xl font-bold text-base sm:text-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mulai Latihan
        </button>
      </div>
    </div>
  );
}
