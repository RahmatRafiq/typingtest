'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTypingStore } from '@/store/typingStore';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import Link from 'next/link';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartTooltipProps } from '@/types';

const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg p-3 text-sm">
        <p className="text-white font-medium mb-1">{payload[0]?.payload?.date || label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name === 'accuracy' || entry.name === 'consistency' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { testHistory, problemWords, resetAllData } = useTypingStore();

  // Filter out practice sessions for analytics
  const validHistory = testHistory.filter(t => !t.isPractice);

  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_WORD = 'HAPUS';

  // Keyboard shortcut to go back to test
  useKeyboardShortcut('Enter', () => {
    if (!showResetModal) {
      router.push('/');
    }
  });

  useKeyboardShortcut(' ', () => {
    if (!showResetModal) {
      router.push('/');
    }
  });

  const totalTests = validHistory.length;
  const avgWpm = totalTests > 0
    ? Math.round(validHistory.reduce((sum, t) => sum + t.results.wpm, 0) / totalTests)
    : 0;
  const avgAccuracy = totalTests > 0
    ? Math.round(validHistory.reduce((sum, t) => sum + t.results.accuracy, 0) / totalTests)
    : 0;
  const bestWpm = totalTests > 0
    ? Math.max(...validHistory.map((t) => t.results.wpm))
    : 0;

  const recentTests = validHistory.slice(0, 10);

  const topProblemWords = problemWords.slice(0, 15);

  const wpmTrend = validHistory.slice(0, 10).map((t) => t.results.wpm);
  const trendDirection =
    wpmTrend.length >= 2
      ? wpmTrend[0] > wpmTrend[wpmTrend.length - 1]
        ? 'meningkat'
        : wpmTrend[0] < wpmTrend[wpmTrend.length - 1]
          ? 'menurun'
          : 'stabil'
      : 'stabil';

  // Data untuk chart WPM (lifetime - semua test)
  const chartData = [...validHistory]
    .reverse()
    .map((test, index) => ({
      name: `#${index + 1}`,
      wpm: test.results.wpm,
      rawWpm: test.results.rawWpm,
      accuracy: test.results.accuracy,
      consistency: test.results.consistency,
      date: new Date(test.timestamp).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      }),
    }));

  // Data untuk chart akurasi kata (lifetime - semua test)
  const wordsChartData = [...validHistory]
    .reverse()
    .map((test, index) => ({
      name: `#${index + 1}`,
      benar: test.results.correctWords,
      salah: test.results.totalWords - test.results.correctWords,
      total: test.results.totalWords,
      akurasiKata: Math.round((test.results.correctWords / test.results.totalWords) * 100),
      errorRate: Math.round(((test.results.totalWords - test.results.correctWords) / test.results.totalWords) * 100),
      date: new Date(test.timestamp).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      }),
    }));

  // Total kumulatif kata benar/salah
  const totalCorrectWords = validHistory.reduce((sum, t) => sum + t.results.correctWords, 0);
  const totalIncorrectWords = validHistory.reduce((sum, t) => sum + (t.results.totalWords - t.results.correctWords), 0);
  const totalWordsTyped = totalCorrectWords + totalIncorrectWords;
  const overallWordAccuracy = totalWordsTyped > 0 ? Math.round((totalCorrectWords / totalWordsTyped) * 100) : 0;

  const handModeData = [
    {
      name: 'Semua',
      tests: validHistory.filter((t) => t.handMode === 'both').length,
      avgWpm: Math.round(
        validHistory
          .filter((t) => t.handMode === 'both')
          .reduce((sum, t) => sum + t.results.wpm, 0) /
        (validHistory.filter((t) => t.handMode === 'both').length || 1)
      ),
    },
    {
      name: 'Kiri',
      tests: validHistory.filter((t) => t.handMode === 'left').length,
      avgWpm: Math.round(
        validHistory
          .filter((t) => t.handMode === 'left')
          .reduce((sum, t) => sum + t.results.wpm, 0) /
        (validHistory.filter((t) => t.handMode === 'left').length || 1)
      ),
    },
    {
      name: 'Kanan',
      tests: validHistory.filter((t) => t.handMode === 'right').length,
      avgWpm: Math.round(
        validHistory
          .filter((t) => t.handMode === 'right')
          .reduce((sum, t) => sum + t.results.wpm, 0) /
        (validHistory.filter((t) => t.handMode === 'right').length || 1)
      ),
    },
    {
      name: 'Bergantian',
      tests: validHistory.filter((t) => t.handMode === 'alternating').length,
      avgWpm: Math.round(
        validHistory
          .filter((t) => t.handMode === 'alternating')
          .reduce((sum, t) => sum + t.results.wpm, 0) /
        (validHistory.filter((t) => t.handMode === 'alternating').length || 1)
      ),
    },
  ].filter((d) => d.tests > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Analitik</h1>
          <p className="text-gray-400">Lacak progres mengetikmu dan identifikasi area yang perlu diperbaiki</p>
        </div>
        <div className="hidden sm:flex gap-2 text-xs text-gray-500 shrink-0">
          <span className="px-3 py-1.5 glass rounded-lg">Enter/Spasi = kembali ke test</span>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Ringkasan</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">{avgWpm}</div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">Rata-rata WPM</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">{avgAccuracy}%</div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">Rata-rata Akurasi</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">{bestWpm}</div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">WPM Terbaik</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">{totalTests}</div>
            <div className="text-gray-400 text-sm uppercase tracking-wide">Total Test</div>
          </div>
        </div>
      </section>

      {chartData.length >= 2 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Tren Performa</h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="glass-card rounded-2xl p-6 flex-1 min-w-0">
              <h3 className="text-lg font-medium text-white mb-4">WPM per Test</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="rawWpmGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="rawWpm"
                      name="Raw WPM"
                      stroke="#6b7280"
                      fill="url(#rawWpmGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="wpm"
                      name="WPM"
                      stroke="#facc15"
                      fill="url(#wpmGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 flex-1 min-w-0">
              <h3 className="text-lg font-medium text-white mb-4">Akurasi & Konsistensi</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      name="Akurasi"
                      stroke="#4ade80"
                      strokeWidth={2}
                      dot={{ fill: '#4ade80', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="consistency"
                      name="Konsistensi"
                      stroke="#a78bfa"
                      strokeWidth={2}
                      dot={{ fill: '#a78bfa', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {wordsChartData.length >= 2 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Tren Akurasi Kata</h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="glass-card rounded-2xl p-6 flex-1 min-w-0">
              <h3 className="text-lg font-medium text-white mb-4">Tren Akurasi & Error Rate</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wordsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0]?.payload;
                          return (
                            <div className="glass-card rounded-lg p-3 text-sm">
                              <p className="text-white font-medium mb-1">{data?.date || data?.name}</p>
                              <p className="text-green-400">Kata Benar: {data?.akurasiKata}%</p>
                              <p className="text-red-400">Kata Salah: {data?.errorRate}%</p>
                              <p className="text-gray-400 text-xs mt-1">
                                {data?.benar} benar / {data?.salah} salah dari {data?.total} kata
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="akurasiKata"
                      name="Kata Benar %"
                      stroke="#4ade80"
                      strokeWidth={2}
                      dot={{ fill: '#4ade80', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="errorRate"
                      name="Kata Salah %"
                      stroke="#f87171"
                      strokeWidth={2}
                      dot={{ fill: '#f87171', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-gray-500 text-xs mt-3">
                Hijau naik & Merah turun = peningkatan
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 lg:w-72">
              <h3 className="text-lg font-medium text-white mb-4">Total Kumulatif</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-1">{overallWordAccuracy}%</div>
                  <div className="text-gray-400 text-sm">Akurasi Keseluruhan</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Kata Benar</span>
                    <span className="text-green-400 font-semibold">{totalCorrectWords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Kata Salah</span>
                    <span className="text-red-400 font-semibold">{totalIncorrectWords.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Total Kata</span>
                      <span className="text-white font-semibold">{totalWordsTyped.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                    style={{ width: `${overallWordAccuracy}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {handModeData.length > 1 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Performa per Mode Tangan</h2>
          <div className="glass-card rounded-2xl p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={handModeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-card rounded-lg p-3 text-sm">
                            <p className="text-white font-medium">{payload[0]?.payload?.name}</p>
                            <p className="text-yellow-400">Rata-rata WPM: {payload[0]?.payload?.avgWpm}</p>
                            <p className="text-gray-400">Total Test: {payload[0]?.payload?.tests}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgWpm" name="Rata-rata WPM" fill="#facc15" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {totalTests >= 2 && (
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${trendDirection === 'meningkat'
              ? 'bg-green-500/20'
              : trendDirection === 'menurun'
                ? 'bg-red-500/20'
                : 'bg-gray-500/20'
              }`}
          >
            <svg
              className={`w-6 h-6 ${trendDirection === 'meningkat'
                ? 'text-green-400 -rotate-45'
                : trendDirection === 'menurun'
                  ? 'text-red-400 rotate-45'
                  : 'text-gray-400'
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={trendDirection === 'stabil' ? 'M5 12h14' : 'M5 12h14M12 5l7 7'}
              />
            </svg>
          </div>
          <span className="text-gray-300">
            Kecepatan mengetikmu{' '}
            <strong
              className={
                trendDirection === 'meningkat'
                  ? 'text-green-400'
                  : trendDirection === 'menurun'
                    ? 'text-red-400'
                    : 'text-gray-400'
              }
            >
              {trendDirection}
            </strong>{' '}
            selama {Math.min(10, totalTests)} test terakhir
          </span>
        </div>
      )}

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Kata Bermasalah</h2>
          {topProblemWords.length > 0 && (
            <Link
              href="/practice"
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
            >
              Latihan Sekarang
            </Link>
          )}
        </div>

        {topProblemWords.length === 0 ? (
          <div className="glass-subtle rounded-2xl p-8 text-center">
            <p className="text-gray-400">
              Belum ada kata bermasalah terdeteksi. Terus berlatih untuk mengidentifikasi kelemahan!
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-white/5">
                <tr className="text-gray-400 text-sm uppercase tracking-wide">
                  <th className="text-left p-4">Kata</th>
                  <th className="text-right p-4">Tingkat Typo</th>
                  <th className="text-right p-4">Waktu Rata-rata</th>
                  <th className="text-center p-4">Keparahan</th>
                  <th className="text-center p-4">Tren</th>
                  <th className="text-center p-4">Tangan</th>
                </tr>
              </thead>
              <tbody>
                {topProblemWords.map((word, index) => (
                  <tr key={index} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-4 font-mono text-white">{word.word}</td>
                    <td className="p-4 text-right">
                      <span
                        className={
                          word.typoRate > 0.5
                            ? 'text-red-400'
                            : word.typoRate > 0.3
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                        }
                      >
                        {Math.round(word.typoRate * 100)}%
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-400">
                      {(word.avgTime / 1000).toFixed(2)}s
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${word.severityScore > 60
                          ? 'bg-red-500/20 text-red-400'
                          : word.severityScore > 30
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                          }`}
                      >
                        {word.severityScore}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-sm ${word.improvementTrend === 'improving'
                        ? 'text-green-400'
                        : word.improvementTrend === 'worsening'
                          ? 'text-red-400'
                          : 'text-gray-400'
                        }`}>
                        {word.improvementTrend === 'improving' && 'Membaik'}
                        {word.improvementTrend === 'worsening' && 'Memburuk'}
                        {word.improvementTrend === 'stable' && 'Stabil'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${word.hand === 'left'
                        ? 'bg-blue-500/20 text-blue-400'
                        : word.hand === 'right'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-gray-500/20 text-gray-400'
                        }`}>
                        {word.hand === 'left' && 'Kiri'}
                        {word.hand === 'right' && 'Kanan'}
                        {word.hand === 'mixed' && 'Campur'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Test Terbaru</h2>

        {recentTests.length === 0 ? (
          <div className="glass-subtle rounded-2xl p-8 text-center">
            <p className="text-gray-400">
              Belum ada test yang terekam.{' '}
              <Link href="/" className="text-yellow-400 hover:text-yellow-300">
                Mulai test pertamamu!
              </Link>
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-white/5">
                <tr className="text-gray-400 text-sm uppercase tracking-wide">
                  <th className="text-left p-4">Tanggal</th>
                  <th className="text-center p-4">Mode</th>
                  <th className="text-center p-4">Tangan</th>
                  <th className="text-right p-4">WPM</th>
                  <th className="text-right p-4">Akurasi</th>
                  <th className="text-right p-4">Kata</th>
                </tr>
              </thead>
              <tbody>
                {recentTests.map((test, index) => (
                  <tr key={index} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-4 text-gray-300">
                      {new Date(test.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4 text-center text-gray-400">
                      {test.mode === 'time' ? `${test.duration}s` : `${test.duration} kata`}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${test.handMode === 'left'
                        ? 'bg-blue-500/20 text-blue-400'
                        : test.handMode === 'right'
                          ? 'bg-purple-500/20 text-purple-400'
                          : test.handMode === 'alternating'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                        {test.handMode === 'left' && 'Kiri'}
                        {test.handMode === 'right' && 'Kanan'}
                        {test.handMode === 'both' && 'Semua'}
                        {test.handMode === 'alternating' && 'Bergantian'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-yellow-400 font-semibold">{test.results.wpm}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={
                          test.results.accuracy >= 95
                            ? 'text-green-400'
                            : test.results.accuracy >= 85
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }
                      >
                        {test.results.accuracy}%
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-400">
                      {test.results.correctWords}/{test.results.totalWords}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="glass-subtle rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tips untuk Meningkat</h2>
        <ul className="space-y-3 text-gray-400 text-sm">
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 shrink-0" />
            Latih kata bermasalahmu setiap hari menggunakan mode Latihan
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 shrink-0" />
            Fokus pada akurasi dulu, baru kecepatan - akurasi menghasilkan ketikan lebih cepat
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 shrink-0" />
            Gunakan mode tangan spesifik untuk menguatkan tangan yang lebih lemah
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 shrink-0" />
            Istirahat setiap 15-20 menit untuk menghindari kelelahan
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 shrink-0" />
            Jaga postur dan posisi tangan yang benar saat mengetik
          </li>
        </ul>
      </section>

      {(totalTests > 0 || problemWords.length > 0) && (
        <section className="glass-subtle rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Reset Data</h2>
              <p className="text-gray-400 text-sm">
                Hapus semua riwayat test dan kata bermasalah
              </p>
            </div>
            <button
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
            >
              Reset Semua Data
            </button>
          </div>
        </section>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
                <p className="text-gray-400 text-sm">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
              <p className="text-gray-200 text-sm">
                Semua data berikut akan dihapus <strong className="text-red-400">secara permanen</strong>:
              </p>
              <ul className="space-y-1 mt-3 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <strong>{totalTests}</strong> riwayat test
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <strong>{problemWords.length}</strong> kata bermasalah
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2">
                Ketik <strong className="text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded">{CONFIRM_WORD}</strong> untuk konfirmasi:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder={CONFIRM_WORD}
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono tracking-wider"
                autoComplete="off"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setConfirmText('');
                }}
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium border border-gray-700"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (confirmText === CONFIRM_WORD) {
                    resetAllData();
                    setShowResetModal(false);
                    setConfirmText('');
                  }
                }}
                disabled={confirmText !== CONFIRM_WORD}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${confirmText === CONFIRM_WORD
                  ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  }`}
              >
                Hapus Semua Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
