'use client';

import { useRouter } from 'next/navigation';
import { useTypingStore } from '@/store/typingStore';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ChartTooltipProps } from '@/types';

// Custom tooltip component with sketch styling
const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="sketch-tooltip">
        <p
          className="text-[var(--pencil)] font-bold mb-1"
          style={{ fontFamily: 'var(--font-sketch), cursive' }}
        >
          Kata #{label}
        </p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color, fontFamily: 'var(--font-sketch), cursive' }}>
            {entry.name}: {entry.value}{entry.name === 'Akurasi' ? '%' : entry.name === 'Waktu' ? 'ms' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Results() {
  const router = useRouter();
  const { status, results, wordResults, resetTest, isPractice } = useTypingStore();

  if (status !== 'finished' || !results) return null;

  const wordPerformance = wordResults.map((w, index) => {
    const wordTime = (w.endTime - w.startTime) / 1000;
    const charCount = w.typed.length;
    const wordWpm = wordTime > 0 ? Math.round((charCount / 5 / wordTime) * 60) : 0;
    const correctChars = w.expected.split('').filter((c, i) => c === w.typed[i]).length;
    const wordAccuracy = charCount > 0 ? Math.round((correctChars / Math.max(charCount, w.expected.length)) * 100) : 0;

    return {
      kata: index + 1,
      wpm: Math.min(wordWpm, 300),
      akurasi: wordAccuracy,
      waktu: Math.round(wordTime * 1000),
    };
  });

  const calculateBurst = () => {
    if (wordResults.length < 3) return results.wpm;

    let maxBurst = 0;
    const windowSize = 3;

    for (let i = 0; i <= wordResults.length - windowSize; i++) {
      const windowWords = wordResults.slice(i, i + windowSize);
      const totalChars = windowWords.reduce((sum, w) => sum + w.typed.length, 0);
      const totalTime = (windowWords[windowSize - 1].endTime - windowWords[0].startTime) / 1000;

      if (totalTime > 0) {
        const burstWpm = Math.round((totalChars / 5 / totalTime) * 60);
        maxBurst = Math.max(maxBurst, burstWpm);
      }
    }

    return maxBurst;
  };

  const burst = calculateBurst();
  const avgWpmLine = results.wpm;

  const problemWordsDetails = wordResults
    .filter((w) => !w.correct || w.endTime - w.startTime > 2000)
    .map((w) => ({
      word: w.expected,
      typed: w.typed,
      time: w.endTime - w.startTime,
      typoCount: w.typoCount,
      hand: w.hand,
    }))
    .slice(0, 10);

  const handleTryAgain = () => {
    resetTest();
    router.push('/');
  };

  return (
    <div className="animate-fadeIn">
      {/* Practice mode notice */}
      {isPractice && (
        <div className="sketch-card-simple border-[var(--ink-blue)] bg-[var(--ink-blue)]/10 p-3 text-center text-sm font-medium mb-6">
          <span
            className="text-[var(--ink-blue)]"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Mode Latihan - Hasil ini tidak mempengaruhi statistik global
          </span>
        </div>
      )}

      {/* Main stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* WPM */}
        <div className="sketch-stat">
          <div
            className="text-4xl lg:text-5xl font-bold text-[var(--ink-blue)] mb-2"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            {results.wpm}
          </div>
          <div
            className="text-[var(--pencil-light)] text-sm uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            WPM
          </div>
          <span className="doodle-star absolute -top-3 -right-1 scale-75 opacity-60" />
        </div>

        {/* Accuracy */}
        <div className="sketch-stat">
          <div
            className="text-4xl lg:text-5xl font-bold text-[var(--pencil-green)] mb-2"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            {results.accuracy}%
          </div>
          <div
            className="text-[var(--pencil-light)] text-sm uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Akurasi
          </div>
          <span className="doodle-checkmark absolute -top-3 -right-1 scale-75 opacity-60" />
        </div>

        {/* Raw WPM */}
        <div className="sketch-stat">
          <div
            className="text-4xl lg:text-5xl font-bold text-[var(--pencil-purple)] mb-2"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            {results.rawWpm}
          </div>
          <div
            className="text-[var(--pencil-light)] text-sm uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            WPM Mentah
          </div>
        </div>

        {/* Consistency */}
        <div className="sketch-stat">
          <div
            className="text-4xl lg:text-5xl font-bold text-[var(--pencil-orange)] mb-2"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            {results.consistency}%
          </div>
          <div
            className="text-[var(--pencil-light)] text-sm uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Konsistensi
          </div>
        </div>

        {/* Burst */}
        <div className="sketch-stat col-span-2 lg:col-span-1">
          <div
            className="text-4xl lg:text-5xl font-bold text-[var(--pencil-yellow)] mb-2"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            {burst}
          </div>
          <div
            className="text-[var(--pencil-light)] text-sm uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Burst
          </div>
        </div>
      </div>

      {/* Performance chart */}
      {wordPerformance.length > 1 && (
        <div className="sketch-card-simple p-6 mb-8">
          <h3
            className="text-xl font-bold text-[var(--pencil)] mb-4 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            <span className="doodle-arrow" />
            Performa Per Kata
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wordPerformance}>
                <defs>
                  <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e4a8a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1e4a8a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2a5e32" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2a5e32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#c9c4b8" />
                <XAxis
                  dataKey="kata"
                  stroke="#4a4a4a"
                  fontSize={12}
                  fontFamily="var(--font-sketch)"
                  label={{ value: 'Kata ke-', position: 'insideBottom', offset: -5, fill: '#4a4a4a' }}
                />
                <YAxis stroke="#4a4a4a" fontSize={12} fontFamily="var(--font-sketch)" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={avgWpmLine}
                  stroke="#1e4a8a"
                  strokeDasharray="5 5"
                  label={{ value: `Rata-rata: ${avgWpmLine}`, fill: '#1e4a8a', fontSize: 12, fontFamily: 'var(--font-sketch)' }}
                />
                <Area
                  type="monotone"
                  dataKey="wpm"
                  name="WPM"
                  stroke="#1e4a8a"
                  fill="url(#wpmGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="akurasi"
                  name="Akurasi"
                  stroke="#2a5e32"
                  fill="url(#accGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--ink-blue)]"></span>
              <span className="text-[var(--pencil-light)]" style={{ fontFamily: 'var(--font-sketch), cursive' }}>
                WPM per Kata
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--pencil-green)]"></span>
              <span className="text-[var(--pencil-light)]" style={{ fontFamily: 'var(--font-sketch), cursive' }}>
                Akurasi per Kata
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-0.5 border-t-2 border-dashed border-[var(--ink-blue)]"></span>
              <span className="text-[var(--pencil-light)]" style={{ fontFamily: 'var(--font-sketch), cursive' }}>
                Rata-rata WPM
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Character and word stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="sketch-card-simple p-6">
          <h3
            className="text-xl font-bold text-[var(--pencil)] mb-4"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Karakter
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b-2 border-dashed border-[var(--paper-line)] pb-2">
              <span className="text-[var(--pencil-light)]" style={{ fontFamily: 'var(--font-sketch), cursive' }}>
                Total
              </span>
              <span
                className="text-[var(--pencil)] text-xl font-bold"
                style={{ fontFamily: 'var(--font-sketch), cursive' }}
              >
                {results.totalChars}
              </span>
            </div>
            <div className="flex justify-between items-center border-b-2 border-dashed border-[var(--paper-line)] pb-2">
              <span className="text-[var(--pencil-light)] flex items-center gap-2" style={{ fontFamily: 'var(--font-sketch), cursive' }}>
                <span className="doodle-checkmark scale-75" />
                Benar
              </span>
              <span
                className="text-[var(--pencil-green)] text-xl font-bold"
                style={{ fontFamily: 'var(--font-sketch), cursive' }}
              >
                {results.correctChars}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--pencil-light)] flex items-center gap-2" style={{ fontFamily: 'var(--font-sketch), cursive' }}>
                <span className="doodle-circle scale-75" />
                Salah
              </span>
              <span
                className="text-[var(--pencil-red)] text-xl font-bold"
                style={{ fontFamily: 'var(--font-sketch), cursive' }}
              >
                {results.incorrectChars}
              </span>
            </div>
          </div>
        </div>

        <div className="sketch-card-simple p-6">
          <h3
            className="text-xl font-bold text-[var(--pencil)] mb-4"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Kata
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b-2 border-dashed border-[var(--paper-line)] pb-2">
              <span className="text-[var(--pencil-light)]" style={{ fontFamily: 'var(--font-sketch), cursive' }}>
                Total
              </span>
              <span
                className="text-[var(--pencil)] text-xl font-bold"
                style={{ fontFamily: 'var(--font-sketch), cursive' }}
              >
                {results.totalWords}
              </span>
            </div>
            <div className="flex justify-between items-center border-b-2 border-dashed border-[var(--paper-line)] pb-2">
              <span className="text-[var(--pencil-light)] flex items-center gap-2" style={{ fontFamily: 'var(--font-sketch), cursive' }}>
                <span className="doodle-checkmark scale-75" />
                Benar
              </span>
              <span
                className="text-[var(--pencil-green)] text-xl font-bold"
                style={{ fontFamily: 'var(--font-sketch), cursive' }}
              >
                {results.correctWords}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--pencil-light)] flex items-center gap-2" style={{ fontFamily: 'var(--font-sketch), cursive' }}>
                <span className="doodle-circle scale-75" />
                Bermasalah
              </span>
              <span
                className="text-[var(--pencil-red)] text-xl font-bold"
                style={{ fontFamily: 'var(--font-sketch), cursive' }}
              >
                {results.problemWords.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Problem words table */}
      {problemWordsDetails.length > 0 && (
        <div className="sketch-card-simple p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3
              className="text-xl font-bold text-[var(--pencil)] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-sketch), cursive' }}
            >
              <span className="doodle-circle scale-75" />
              Kata Bermasalah
            </h3>
            {results.problemWords.length > 0 && (
              <Link
                href="/practice"
                className="sketch-badge text-[var(--ink-blue)] border-[var(--ink-blue)] hover:bg-[var(--ink-blue)]/10 transition-colors"
                style={{ fontFamily: 'var(--font-sketch), cursive' }}
              >
                Latih kata ini →
              </Link>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="text-[var(--pencil-light)] text-sm uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-sketch), cursive' }}
                >
                  <th className="text-left pb-4">Kata</th>
                  <th className="text-left pb-4">Yang Diketik</th>
                  <th className="text-right pb-4">Waktu</th>
                  <th className="text-right pb-4">Error</th>
                  <th className="text-center pb-4">Tangan</th>
                </tr>
              </thead>
              <tbody>
                {problemWordsDetails.map((item, index) => (
                  <tr key={index} className="border-t-2 border-dashed border-[var(--paper-line)]">
                    <td
                      className="py-4 text-[var(--pencil)]"
                      style={{ fontFamily: 'var(--font-sketch-mono), monospace' }}
                    >
                      {item.word}
                    </td>
                    <td style={{ fontFamily: 'var(--font-sketch-mono), monospace' }} className="py-4">
                      {item.word === item.typed ? (
                        <span className="text-[var(--pencil-green)]">{item.typed}</span>
                      ) : (
                        <span className="text-[var(--pencil-red)] line-through decoration-wavy">
                          {item.typed || '(kosong)'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={item.time > 2000 ? 'text-[var(--pencil-red)]' : 'text-[var(--pencil-light)]'}
                        style={{ fontFamily: 'var(--font-sketch), cursive' }}
                      >
                        {(item.time / 1000).toFixed(2)}s
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={item.typoCount > 0 ? 'text-[var(--pencil-red)]' : 'text-[var(--pencil-light)]'}
                        style={{ fontFamily: 'var(--font-sketch), cursive' }}
                      >
                        {item.typoCount}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`sketch-badge text-xs ${
                          item.hand === 'left'
                            ? 'text-[var(--ink-blue)] border-[var(--ink-blue)]'
                            : item.hand === 'right'
                            ? 'text-[var(--pencil-purple)] border-[var(--pencil-purple)]'
                            : 'text-[var(--pencil-light)] border-[var(--pencil-light)]'
                        }`}
                        style={{ fontFamily: 'var(--font-sketch), cursive' }}
                      >
                        {item.hand === 'left' && 'Kiri'}
                        {item.hand === 'right' && 'Kanan'}
                        {item.hand === 'mixed' && 'Campur'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleTryAgain}
          className="sketch-button sketch-button-primary px-8 py-3 text-lg"
          style={{ fontFamily: 'var(--font-sketch), cursive' }}
        >
          Coba Lagi
        </button>
        <Link
          href="/analytics"
          className="sketch-button px-8 py-3 text-lg text-[var(--pencil)]"
          style={{ fontFamily: 'var(--font-sketch), cursive' }}
        >
          Lihat Analitik
        </Link>
      </div>

      <p
        className="text-center text-[var(--pencil-light)] text-sm mt-6"
        style={{ fontFamily: 'var(--font-sketch), cursive' }}
      >
        Tekan Tab untuk restart cepat
      </p>
    </div>
  );
}
