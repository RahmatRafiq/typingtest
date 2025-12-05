import { DataSliceCreator } from '../types';

export const createDataSlice: DataSliceCreator = (set) => ({
  resetAllData: () => {
    set({
      testHistory: [],
      problemWords: [],
      results: null,
      status: 'idle',
    });
  },
});
