import { SyncSliceCreator } from '../types';

export const createSyncSlice: SyncSliceCreator = (set) => ({
  syncStatus: 'idle',
  syncError: null,

  setSyncStatus: (status, error) => {
    set({
      syncStatus: status,
      syncError: error || null,
    });

    if (status === 'success' || status === 'error') {
      setTimeout(() => {
        set({ syncStatus: 'idle' });
      }, 3000);
    }
  },
});
