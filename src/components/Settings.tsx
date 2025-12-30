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
      className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base font-medium ${
        active
          ? 'bg-yellow-400 text-gray-900'
          : 'glass-button text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export default function Settings() {
  const { testMode, handMode, duration, status, setTestMode, setHandMode, setDuration } =
    useTypingStore();

  const disabled = status === 'running';

  const timeModes = [15, 30, 60, 120];
  const wordModes = [25, 50, 100];

  return (
    <div className={`glass-card rounded-2xl p-4 sm:p-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Mobile: Vertical layout */}
      <div className="flex flex-col space-y-4 lg:hidden">
        <div className="flex flex-col gap-2">
          <span className="text-gray-400 text-xs uppercase tracking-wide">Mode</span>
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
          <span className="text-gray-400 text-xs uppercase tracking-wide">
            {testMode === 'time' ? 'Detik' : 'Kata'}
          </span>
          <div className="flex gap-2 flex-wrap">
            {testMode === 'time'
              ? timeModes.map((t) => (
                  <SettingButton key={t} active={duration === t} onClick={() => setDuration(t)}>
                    {t}
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
          <span className="text-gray-400 text-xs uppercase tracking-wide">Tangan</span>
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
          <div className="text-xs text-gray-500 pt-2 border-t border-white/5">
            {handMode === 'left' && <span>Q W E R T | A S D F G | Z X C V B</span>}
            {handMode === 'right' && <span>Y U I O P | H J K L | N M</span>}
            {handMode === 'alternating' && <span>Bergantian kiri & kanan</span>}
          </div>
        )}
      </div>

      {/* Desktop: Single horizontal row */}
      <div className="hidden lg:flex lg:items-center lg:justify-center lg:gap-8">
        {/* Mode */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm uppercase tracking-wide font-medium">Mode</span>
          <div className="flex gap-2">
            <SettingButton active={testMode === 'time'} onClick={() => setTestMode('time')}>
              Waktu
            </SettingButton>
            <SettingButton active={testMode === 'words'} onClick={() => setTestMode('words')}>
              Kata
            </SettingButton>
          </div>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-white/10"></div>

        {/* Duration */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm uppercase tracking-wide font-medium">
            {testMode === 'time' ? 'Detik' : 'Kata'}
          </span>
          <div className="flex gap-2">
            {testMode === 'time'
              ? timeModes.map((t) => (
                  <SettingButton key={t} active={duration === t} onClick={() => setDuration(t)}>
                    {t}
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
        <div className="h-8 w-px bg-white/10"></div>

        {/* Hand Mode */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm uppercase tracking-wide font-medium">Tangan</span>
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
            <div className="h-8 w-px bg-white/10"></div>
            <div className="text-xs text-gray-500">
              {handMode === 'left' && <span>Q W E R T | A S D F G | Z X C V B</span>}
              {handMode === 'right' && <span>Y U I O P | H J K L | N M</span>}
              {handMode === 'alternating' && <span>Bergantian kiri & kanan</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
