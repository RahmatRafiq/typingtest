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

// Custom tooltip component - defined outside to avoid recreation on each render
const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 text-sm">
        <p className="text-white font-medium mb-1">Kata #{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }}>
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {isPractice && (
          <div className="col-span-2 lg:col-span-5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl p-3 text-center text-sm font-medium mb-4">
            Mode Latihan - Hasil ini tidak mempengaruhi statistik global
          </div>
        )}
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-2">{results.wpm}</div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">WPM</div>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-4xl lg:text-5xl font-bold text-green-400 mb-2">{results.accuracy}%</div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">Akurasi</div>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-4xl lg:text-5xl font-bold text-blue-400 mb-2">{results.rawWpm}</div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">WPM Mentah</div>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-4xl lg:text-5xl font-bold text-purple-400 mb-2">{results.consistency}%</div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">Konsistensi</div>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center col-span-2 lg:col-span-1">
          <div className="text-4xl lg:text-5xl font-bold text-orange-400 mb-2">{burst}</div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">Burst</div>
        </div>
      </div>

      {wordPerformance.length > 1 && (
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Performa Per Kata</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wordPerformance}>
                <defs>
                  <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="kata"
                  stroke="#9ca3af"
                  fontSize={12}
                  label={{ value: 'Kata ke-', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={avgWpmLine} stroke="#facc15" strokeDasharray="5 5" label={{ value: `Rata-rata: ${avgWpmLine}`, fill: '#facc15', fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="wpm"
                  name="WPM"
                  stroke="#facc15"
                  fill="url(#wpmGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="akurasi"
                  name="Akurasi"
                  stroke="#4ade80"
                  fill="url(#accGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="text-gray-400">WPM per Kata</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
              <span className="text-gray-400">Akurasi per Kata</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-yellow-400" style={{ borderTop: '2px dashed #facc15' }}></span>
              <span className="text-gray-400">Rata-rata WPM</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Karakter</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total</span>
              <span className="text-white text-lg font-medium">{results.totalChars}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Benar</span>
              <span className="text-green-400 text-lg font-medium">{results.correctChars}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Salah</span>
              <span className="text-red-400 text-lg font-medium">{results.incorrectChars}</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Kata</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total</span>
              <span className="text-white text-lg font-medium">{results.totalWords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Benar</span>
              <span className="text-green-400 text-lg font-medium">{results.correctWords}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Kata Bermasalah</span>
              <span className="text-red-400 text-lg font-medium">{results.problemWords.length}</span>
            </div>
          </div>
        </div>
      </div>

      {problemWordsDetails.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Kata Bermasalah</h3>
            {results.problemWords.length > 0 && (
              <Link
                href="/practice"
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
              >
                Latih kata ini
              </Link>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm uppercase tracking-wide">
                  <th className="text-left pb-4">Kata</th>
                  <th className="text-left pb-4">Yang Diketik</th>
                  <th className="text-right pb-4">Waktu</th>
                  <th className="text-right pb-4">Error</th>
                  <th className="text-center pb-4">Tangan</th>
                </tr>
              </thead>
              <tbody>
                {problemWordsDetails.map((item, index) => (
                  <tr key={index} className="border-t border-white/5">
                    <td className="py-4 text-white font-mono">{item.word}</td>
                    <td className="py-4 font-mono">
                      {item.word === item.typed ? (
                        <span className="text-green-400">{item.typed}</span>
                      ) : (
                        <span className="text-red-400">{item.typed || '(kosong)'}</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={
                          item.time > 2000 ? 'text-red-400' : 'text-gray-400'
                        }
                      >
                        {(item.time / 1000).toFixed(2)}s
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={
                          item.typoCount > 0 ? 'text-red-400' : 'text-gray-400'
                        }
                      >
                        {item.typoCount}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.hand === 'left'
                        ? 'bg-blue-500/20 text-blue-400'
                        : item.hand === 'right'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-gray-500/20 text-gray-400'
                        }`}>
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

      <div className="flex justify-center gap-4">
        <button
          onClick={handleTryAgain}
          className="px-8 py-3 bg-yellow-400 text-gray-900 rounded-xl font-semibold hover:bg-yellow-300 transition-all"
        >
          Coba Lagi
        </button>
        <Link
          href="/analytics"
          className="px-8 py-3 glass-button text-white rounded-xl font-semibold hover:bg-white/10"
        >
          Lihat Analitik
        </Link>
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        Tekan Tab untuk restart cepat
      </p>
    </div>
  );
}
