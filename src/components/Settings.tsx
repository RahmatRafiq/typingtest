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

  // Tidak boleh ubah setting saat test berjalan
  const disabled = status === 'running';

  const timeModes = [15, 30, 60, 120];
  const wordModes = [25, 50, 100];

  return (
    <div className={`glass-card rounded-2xl p-4 sm:p-8 flex justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col space-y-4 sm:space-y-5 w-full sm:w-auto">
        {/* Mode Test */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span className="text-gray-400 sm:w-20 text-xs sm:text-sm uppercase tracking-wide">mode</span>
          <div className="flex gap-2 sm:gap-3">
            <SettingButton
              active={testMode === 'time'}
              onClick={() => setTestMode('time')}
            >
              waktu
            </SettingButton>
            <SettingButton
              active={testMode === 'words'}
              onClick={() => setTestMode('words')}
            >
              kata
            </SettingButton>
          </div>
        </div>

        {/* Durasi / Jumlah Kata */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span className="text-gray-400 sm:w-20 text-xs sm:text-sm uppercase tracking-wide">
            {testMode === 'time' ? 'detik' : 'kata'}
          </span>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {testMode === 'time'
              ? timeModes.map((t) => (
                  <SettingButton
                    key={t}
                    active={duration === t}
                    onClick={() => setDuration(t)}
                  >
                    {t}
                  </SettingButton>
                ))
              : wordModes.map((w) => (
                  <SettingButton
                    key={w}
                    active={duration === w}
                    onClick={() => setDuration(w)}
                  >
                    {w}
                  </SettingButton>
                ))}
          </div>
        </div>

        {/* Mode Tangan */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span className="text-gray-400 sm:w-20 text-xs sm:text-sm uppercase tracking-wide">tangan</span>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <SettingButton
              active={handMode === 'both'}
              onClick={() => setHandMode('both')}
              title="Kedua tangan - semua kata"
            >
              semua
            </SettingButton>
            <SettingButton
              active={handMode === 'left'}
              onClick={() => setHandMode('left')}
              title="Fokus tangan kiri - kata menggunakan tombol QWERT ASDFG ZXCVB"
            >
              kiri
            </SettingButton>
            <SettingButton
              active={handMode === 'right'}
              onClick={() => setHandMode('right')}
              title="Fokus tangan kanan - kata menggunakan tombol YUIOP HJKL NM"
            >
              kanan
            </SettingButton>
            <SettingButton
              active={handMode === 'alternating'}
              onClick={() => setHandMode('alternating')}
              title="Bergantian - bergantian antara kata tangan kiri dan kanan"
            >
              bergantian
            </SettingButton>
          </div>
        </div>

        {/* Penjelasan mode tangan */}
        {handMode !== 'both' && (
          <div className="text-xs text-gray-500 sm:pl-[6.5rem]">
            {handMode === 'left' && (
              <span>Fokus pada tombol: Q W E R T | A S D F G | Z X C V B</span>
            )}
            {handMode === 'right' && (
              <span>Fokus pada tombol: Y U I O P | H J K L | N M</span>
            )}
            {handMode === 'alternating' && (
              <span>Kata bergantian antara dominan tangan kiri dan tangan kanan</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
