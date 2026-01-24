'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Settings from '@/components/Settings';
import { useTypingStore } from '@/store/typingStore';
import { initAudio } from '@/lib/typeSound';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { resetTest } = useTypingStore();

  // Reset state saat masuk home (clean slate)
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  const handleStartTest = useCallback(() => {
    initAudio();
    router.push('/test');
  }, [router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Tab tidak melakukan apa-apa di halaman home
      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      // Tombol apa saja (kecuali Tab, modifier keys) memulai test
      if (e.key.length === 1 || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleStartTest();
      }
    },
    [handleStartTest]
  );

  const handleContainerClick = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="sr-only">
        TypeMaster - Tes Mengetik dengan Analitik Mendalam
      </h1>

      <section aria-label="Pengaturan Test">
        <Settings />
      </section>

      {/* Start Area */}
      <section aria-label="Mulai Tes Mengetik">
        <div
          ref={containerRef}
          tabIndex={0}
          onClick={handleStartTest}
          onKeyDown={handleKeyDown}
          onFocus={handleContainerClick}
          data-tour-step="start-area"
          className="sketch-card-simple p-6 sm:p-8 min-h-[180px] sm:min-h-[250px] flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[var(--ink-blue)] focus:ring-offset-2 focus:ring-offset-[var(--paper)]"
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
          </div>
        </div>
      </section>

      {/* Feature cards */}
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
    </div>
  );
}
