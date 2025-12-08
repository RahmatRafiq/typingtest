import { deleteAllUserData } from '@/lib/supabaseSync';
import { DataSliceCreator } from '../types';

export const createDataSlice: DataSliceCreator = (set) => ({
  resetAllData: () => {
    // Clear local state
    set({
      testHistory: [],
      problemWords: [],
      results: null,
      status: 'idle',
    });

    // Delete from Supabase (fire and forget)
    deleteAllUserData().catch(console.error);
  },
});
