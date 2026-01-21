'use client';

import { useTypingStore } from '@/store/typingStore';

interface SettingButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}

function SettingButton({ active, onClick, children, title }: SettingButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-3 py-2 sm:px-4 sm:py-2 border-2 transition-all duration-200 text-sm sm:text-base font-semibold ${
        active
          ? 'bg-[var(--ink-blue)] text-[var(--paper)] border-[var(--pencil)] shadow-[2px_2px_0_var(--pencil)]'
          : 'bg-[var(--paper)] text-[var(--pencil-light)] border-[var(--pencil-light)] hover:border-[var(--pencil)] hover:text-[var(--pencil)] hover:shadow-[2px_2px_0_var(--pencil-light)]'
      }`}
      style={{ fontFamily: 'var(--font-sketch), cursive' }}
    >
      {children}
    </button>
  );
}

export default function Settings() {
  const { testMode, handMode, duration, status, soundEnabled, setTestMode, setHandMode, setDuration, setSoundEnabled } =
    useTypingStore();

  const disabled = status === 'running';

  const timeModes = [15, 30, 60, 120];
  const wordModes = [25, 50, 100];

  return (
    <div className={`sketch-card-simple p-4 sm:p-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Mobile: Vertical layout */}
      <div className="flex flex-col space-y-4 lg:hidden">
        <div className="flex flex-col gap-2">
          <span
            className="text-[var(--pencil-light)] text-xs uppercase tracking-wide flex items-center gap-2"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            <span className="doodle-arrow scale-75" />
            Mode
          </span>
          <div className="flex gap-2">
            <SettingButton active={testMode === 'time'} onClick={() => setTestMode('time')}>
              Waktu
            </SettingButton>
            <SettingButton active={testMode === 'words'} onClick={() => setTestMode('words')}>
              Kata
            </SettingButton>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span
            className="text-[var(--pencil-light)] text-xs uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            {testMode === 'time' ? 'Detik' : 'Jumlah Kata'}
          </span>
          <div className="flex gap-2 flex-wrap">
            {testMode === 'time'
              ? timeModes.map((t) => (
                  <SettingButton key={t} active={duration === t} onClick={() => setDuration(t)}>
                    {t}s
                  </SettingButton>
                ))
              : wordModes.map((w) => (
                  <SettingButton key={w} active={duration === w} onClick={() => setDuration(w)}>
                    {w}
                  </SettingButton>
                ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span
            className="text-[var(--pencil-light)] text-xs uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Tangan
          </span>
          <div className="flex gap-2 flex-wrap">
            <SettingButton active={handMode === 'both'} onClick={() => setHandMode('both')}>
              Semua
            </SettingButton>
            <SettingButton active={handMode === 'left'} onClick={() => setHandMode('left')}>
              Kiri
            </SettingButton>
            <SettingButton active={handMode === 'right'} onClick={() => setHandMode('right')}>
              Kanan
            </SettingButton>
            <SettingButton active={handMode === 'alternating'} onClick={() => setHandMode('alternating')}>
              Bergantian
            </SettingButton>
          </div>
        </div>

        {handMode !== 'both' && (
          <div
            className="text-xs text-[var(--pencil-light)] pt-2 border-t-2 border-dashed border-[var(--pencil-light)]/30"
            style={{ fontFamily: 'var(--font-sketch-mono), monospace' }}
          >
            {handMode === 'left' && <span>Q W E R T | A S D F G | Z X C V B</span>}
            {handMode === 'right' && <span>Y U I O P | H J K L | N M</span>}
            {handMode === 'alternating' && <span>Bergantian kiri & kanan</span>}
          </div>
        )}

        {/* Sound Toggle */}
        <div className="flex flex-col gap-2">
          <span
            className="text-[var(--pencil-light)] text-xs uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Suara
          </span>
          <div className="flex gap-2">
            <SettingButton active={soundEnabled} onClick={() => setSoundEnabled(true)}>
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                Aktif
              </span>
            </SettingButton>
            <SettingButton active={!soundEnabled} onClick={() => setSoundEnabled(false)}>
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
                Mati
              </span>
            </SettingButton>
          </div>
        </div>
      </div>

      {/* Desktop: Single horizontal row */}
      <div className="hidden lg:flex lg:items-center lg:justify-center lg:gap-8">
        {/* Mode */}
        <div className="flex items-center gap-3">
          <span
            className="text-[var(--pencil-light)] text-sm uppercase tracking-wide font-medium flex items-center gap-2"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            <span className="doodle-arrow scale-75" />
            Mode
          </span>
          <div className="flex gap-2">
            <SettingButton active={testMode === 'time'} onClick={() => setTestMode('time')}>
              Waktu
            </SettingButton>
            <SettingButton active={testMode === 'words'} onClick={() => setTestMode('words')}>
              Kata
            </SettingButton>
          </div>
        </div>

        {/* Separator - Hand-drawn line */}
        <div
          className="h-8 w-0.5"
          style={{
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 30'%3E%3Cpath d='M1 0 Q 0 5, 1 10 T 1 20 T 1 30' stroke='%233d3d3d' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") no-repeat`,
            backgroundSize: '2px 100%',
          }}
        />

        {/* Duration */}
        <div className="flex items-center gap-3">
          <span
            className="text-[var(--pencil-light)] text-sm uppercase tracking-wide font-medium"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            {testMode === 'time' ? 'Detik' : 'Kata'}
          </span>
          <div className="flex gap-2">
            {testMode === 'time'
              ? timeModes.map((t) => (
                  <SettingButton key={t} active={duration === t} onClick={() => setDuration(t)}>
                    {t}s
                  </SettingButton>
                ))
              : wordModes.map((w) => (
                  <SettingButton key={w} active={duration === w} onClick={() => setDuration(w)}>
                    {w}
                  </SettingButton>
                ))}
          </div>
        </div>

        {/* Separator */}
        <div
          className="h-8 w-0.5"
          style={{
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 30'%3E%3Cpath d='M1 0 Q 0 5, 1 10 T 1 20 T 1 30' stroke='%233d3d3d' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") no-repeat`,
            backgroundSize: '2px 100%',
          }}
        />

        {/* Hand Mode */}
        <div className="flex items-center gap-3">
          <span
            className="text-[var(--pencil-light)] text-sm uppercase tracking-wide font-medium"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Tangan
          </span>
          <div className="flex gap-2">
            <SettingButton active={handMode === 'both'} onClick={() => setHandMode('both')}>
              Semua
            </SettingButton>
            <SettingButton active={handMode === 'left'} onClick={() => setHandMode('left')}>
              Kiri
            </SettingButton>
            <SettingButton active={handMode === 'right'} onClick={() => setHandMode('right')}>
              Kanan
            </SettingButton>
            <SettingButton active={handMode === 'alternating'} onClick={() => setHandMode('alternating')}>
              Bergantian
            </SettingButton>
          </div>
        </div>

        {/* Hand mode hint */}
        {handMode !== 'both' && (
          <>
            <div
              className="h-8 w-0.5"
              style={{
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 30'%3E%3Cpath d='M1 0 Q 0 5, 1 10 T 1 20 T 1 30' stroke='%233d3d3d' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") no-repeat`,
                backgroundSize: '2px 100%',
              }}
            />
            <div
              className="text-xs text-[var(--pencil-light)] sketch-badge"
              style={{ fontFamily: 'var(--font-sketch-mono), monospace' }}
            >
              {handMode === 'left' && <span>Q W E R T | A S D F G | Z X C V B</span>}
              {handMode === 'right' && <span>Y U I O P | H J K L | N M</span>}
              {handMode === 'alternating' && <span>Bergantian kiri & kanan</span>}
            </div>
          </>
        )}

        {/* Separator */}
        <div
          className="h-8 w-0.5"
          style={{
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 30'%3E%3Cpath d='M1 0 Q 0 5, 1 10 T 1 20 T 1 30' stroke='%233d3d3d' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") no-repeat`,
            backgroundSize: '2px 100%',
          }}
        />

        {/* Sound Toggle */}
        <div className="flex items-center gap-3">
          <span
            className="text-[var(--pencil-light)] text-sm uppercase tracking-wide font-medium"
            style={{ fontFamily: 'var(--font-sketch), cursive' }}
          >
            Suara
          </span>
          <div className="flex gap-2">
            <SettingButton active={soundEnabled} onClick={() => setSoundEnabled(true)}>
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                Aktif
              </span>
            </SettingButton>
            <SettingButton active={!soundEnabled} onClick={() => setSoundEnabled(false)}>
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
                Mati
              </span>
            </SettingButton>
          </div>
        </div>
      </div>

      {/* Decorative corner doodle */}
      <div className="absolute -top-2 -right-2 opacity-30 hidden sm:block">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path
            d="M5 35 Q 20 30, 35 5"
            stroke="var(--pencil-light)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
          <circle cx="35" cy="5" r="3" fill="var(--pencil-yellow)" stroke="var(--pencil)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
