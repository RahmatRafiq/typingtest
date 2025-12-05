'use client';

import { useEffect } from 'react';
import TypingArea from '@/components/TypingArea';
import Settings from '@/components/Settings';
import Results from '@/components/Results';
import { useTypingStore } from '@/store/typingStore';

export default function Home() {
  const { status, resetTest } = useTypingStore();

  // Handle Tab key untuk restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        resetTest();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetTest]);

  return (
    <div className="space-y-8">
      {/* Heading SEO-friendly (tersembunyi secara visual tapi bisa dibaca search engine) */}
      <h1 className="sr-only">
        TypeMaster - Tes Mengetik dengan Analitik Mendalam
      </h1>

      {/* Settings */}
      {status !== 'running' && (
        <section aria-label="Pengaturan Test">
          <Settings />
        </section>
      )}

      {/* Area Mengetik atau Hasil */}
      <section aria-label="Area Tes Mengetik">
        {status === 'finished' ? <Results /> : <TypingArea />}
      </section>

      {/* Bagian fitur untuk SEO (ditampilkan hanya saat idle) */}
      {status === 'idle' && (
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="glass-card rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-yellow-400 mb-2">
              Deteksi Masalah
            </h2>
            <p className="text-gray-400 text-sm">
              Otomatis mengidentifikasi kata-kata yang sulit kamu ketik dan melacak perkembanganmu.
            </p>
          </article>
          <article className="glass-card rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-green-400/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-green-400 mb-2">
              Latihan Tangan
            </h2>
            <p className="text-gray-400 text-sm">
              Latihan dengan mode tangan kiri, kanan, atau bergantian untuk menguatkan jari yang lemah.
            </p>
          </article>
          <article className="glass-card rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-blue-400 mb-2">
              Analitik Mendalam
            </h2>
            <p className="text-gray-400 text-sm">
              Analisis detail keystroke, pola waktu, dan rekomendasi latihan yang dipersonalisasi.
            </p>
          </article>
        </section>
      )}
    </div>
  );
}
