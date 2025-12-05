'use client';

import { useTypingStore } from '@/store/typingStore';
import Link from 'next/link';

export default function Results() {
  const { status, results, wordResults, resetTest } = useTypingStore();

  if (status !== 'finished' || !results) return null;

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

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-5xl font-bold text-yellow-400 mb-2">{results.wpm}</div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">WPM</div>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-5xl font-bold text-green-400 mb-2">{results.accuracy}%</div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">Akurasi</div>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-5xl font-bold text-blue-400 mb-2">{results.rawWpm}</div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">WPM Mentah</div>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-5xl font-bold text-purple-400 mb-2">{results.consistency}%</div>
          <div className="text-gray-400 text-sm uppercase tracking-wide">Konsistensi</div>
        </div>
      </div>

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
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.hand === 'left'
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
          onClick={resetTest}
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
