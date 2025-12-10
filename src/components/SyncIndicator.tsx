'use client';

import { useTypingStore } from '@/store/typingStore';

export default function SyncIndicator() {
  const { syncStatus, syncError } = useTypingStore();

  if (syncStatus === 'idle') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {syncStatus === 'syncing' && (
        <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-300">Menyimpan...</span>
        </div>
      )}
      {syncStatus === 'success' && (
        <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-2 border border-green-500/30">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-green-400">Tersimpan</span>
        </div>
      )}
      {syncStatus === 'error' && (
        <div className="glass-card rounded-lg px-4 py-2 flex items-center gap-2 border border-red-500/30">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-sm text-red-400">{syncError || 'Gagal menyimpan'}</span>
        </div>
      )}
    </div>
  );
}
