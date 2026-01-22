import { useTypingStore } from '@/store/typingStore';
import { act } from '@testing-library/react';

describe('inputSlice', () => {
  beforeEach(() => {
    // Reset store sebelum setiap test
    const store = useTypingStore.getState();
    store.resetTest();
  });

  describe('handleKeyPress', () => {
    it('tidak melakukan apa-apa jika status bukan running', () => {
      const store = useTypingStore.getState();
      expect(store.status).toBe('idle');

      act(() => {
        store.handleKeyPress('a');
      });

      expect(store.currentInput).toBe('');
    });

    it('menambahkan karakter ke currentInput saat running', () => {
      const store = useTypingStore.getState();

      // Start test dengan mode words
      act(() => {
        store.setTestMode('words');
        store.setDuration(5);
        store.startTest();
      });

      const runningStore = useTypingStore.getState();
      expect(runningStore.status).toBe('running');
      expect(runningStore.words.length).toBeGreaterThan(0);

      const firstWord = runningStore.words[0];
      const firstChar = firstWord[0];

      act(() => {
        runningStore.handleKeyPress(firstChar);
      });

      expect(useTypingStore.getState().currentInput).toBe(firstChar);
    });

    it('mengabaikan spasi di handleKeyPress (spasi ditangani oleh handleSpace)', () => {
      const store = useTypingStore.getState();

      act(() => {
        store.setTestMode('words');
        store.setDuration(5);
        store.startTest();
      });

      act(() => {
        useTypingStore.getState().handleKeyPress(' ');
      });

      expect(useTypingStore.getState().currentInput).toBe('');
    });
  });

  describe('auto-complete di word mode', () => {
    it('menyelesaikan game saat huruf terakhir dari kata terakhir diketik', () => {
      const store = useTypingStore.getState();

      // Set mode words dengan duration 1 (hanya 1 kata)
      act(() => {
        store.setTestMode('words');
        store.setDuration(1);
        store.startTest();
      });

      const runningStore = useTypingStore.getState();
      expect(runningStore.status).toBe('running');
      expect(runningStore.testMode).toBe('words');
      expect(runningStore.duration).toBe(1);

      const targetWord = runningStore.words[0];

      // Ketik setiap huruf dari kata
      for (const char of targetWord) {
        act(() => {
          useTypingStore.getState().handleKeyPress(char);
        });
      }

      // Game harus selesai setelah huruf terakhir
      const finalStore = useTypingStore.getState();
      expect(finalStore.status).toBe('finished');
      expect(finalStore.wordResults.length).toBe(1);
      expect(finalStore.wordResults[0].correct).toBe(true);
    });

    it('tidak menyelesaikan game jika bukan kata terakhir', () => {
      const store = useTypingStore.getState();

      // Set mode words dengan duration 3
      act(() => {
        store.setTestMode('words');
        store.setDuration(3);
        store.startTest();
      });

      const runningStore = useTypingStore.getState();
      const firstWord = runningStore.words[0];

      // Ketik kata pertama tanpa spasi
      for (const char of firstWord) {
        act(() => {
          useTypingStore.getState().handleKeyPress(char);
        });
      }

      // Game tidak boleh selesai karena masih ada 2 kata lagi
      const afterFirstWord = useTypingStore.getState();
      expect(afterFirstWord.status).toBe('running');
      expect(afterFirstWord.currentInput).toBe(firstWord);
    });

    it('auto-complete di time mode jika semua kata habis', () => {
      const store = useTypingStore.getState();

      // Set mode time
      act(() => {
        store.setTestMode('time');
        store.setDuration(30);
        store.startTest();
      });

      const runningStore = useTypingStore.getState();
      const firstWord = runningStore.words[0];

      // Ketik kata pertama (bukan kata terakhir, jadi tidak auto-complete)
      for (const char of firstWord) {
        act(() => {
          useTypingStore.getState().handleKeyPress(char);
        });
      }

      // Game tidak boleh selesai karena bukan kata terakhir
      const afterWord = useTypingStore.getState();
      expect(afterWord.status).toBe('running');
      // Tapi currentInput harus berisi kata yang sudah diketik
      expect(afterWord.currentInput).toBe(firstWord);
    });

    it('auto-complete berfungsi di practice mode', () => {
      const store = useTypingStore.getState();

      // Start practice mode dengan custom words
      const practiceWords = ['test', 'kata'];
      act(() => {
        store.startPracticeMode(practiceWords);
      });

      const runningStore = useTypingStore.getState();
      expect(runningStore.status).toBe('running');
      expect(runningStore.isPractice).toBe(true);
      expect(runningStore.words).toEqual(practiceWords);

      // Ketik kata pertama dan tekan spasi
      const firstWord = runningStore.words[0];
      for (const char of firstWord) {
        act(() => {
          useTypingStore.getState().handleKeyPress(char);
        });
      }
      act(() => {
        useTypingStore.getState().handleSpace();
      });

      // Sekarang di kata terakhir
      expect(useTypingStore.getState().currentWordIndex).toBe(1);

      // Ketik kata terakhir (harus auto-complete)
      const lastWord = useTypingStore.getState().words[1];
      for (const char of lastWord) {
        act(() => {
          useTypingStore.getState().handleKeyPress(char);
        });
      }

      // Game harus selesai setelah huruf terakhir (tanpa spasi)
      const finalStore = useTypingStore.getState();
      expect(finalStore.status).toBe('finished');
      expect(finalStore.wordResults.length).toBe(2);
    });
  });

  describe('handleSpace', () => {
    it('pindah ke kata berikutnya saat spasi ditekan', () => {
      const store = useTypingStore.getState();

      act(() => {
        store.setTestMode('words');
        store.setDuration(5);
        store.startTest();
      });

      const runningStore = useTypingStore.getState();
      const firstWord = runningStore.words[0];

      // Ketik kata pertama
      for (const char of firstWord) {
        act(() => {
          useTypingStore.getState().handleKeyPress(char);
        });
      }

      // Tekan spasi
      act(() => {
        useTypingStore.getState().handleSpace();
      });

      const afterSpace = useTypingStore.getState();
      expect(afterSpace.currentWordIndex).toBe(1);
      expect(afterSpace.currentInput).toBe('');
      expect(afterSpace.wordResults.length).toBe(1);
    });

    it('tidak melakukan apa-apa jika currentInput kosong', () => {
      const store = useTypingStore.getState();

      act(() => {
        store.setTestMode('words');
        store.setDuration(5);
        store.startTest();
      });

      // Tekan spasi tanpa mengetik apa-apa
      act(() => {
        useTypingStore.getState().handleSpace();
      });

      const afterSpace = useTypingStore.getState();
      expect(afterSpace.currentWordIndex).toBe(0);
      expect(afterSpace.wordResults.length).toBe(0);
    });

    it('menyelesaikan game di word mode saat kata terakhir selesai dengan spasi', () => {
      const store = useTypingStore.getState();

      act(() => {
        store.setTestMode('words');
        store.setDuration(1);
        store.startTest();
      });

      // Ketik kata (tapi jangan semua huruf untuk menghindari auto-complete)
      // Ketik dengan typo supaya tidak auto-complete
      act(() => {
        useTypingStore.getState().handleKeyPress('x'); // typo
      });

      // Tekan spasi
      act(() => {
        useTypingStore.getState().handleSpace();
      });

      // Game harus selesai
      expect(useTypingStore.getState().status).toBe('finished');
    });
  });

  describe('handleBackspace', () => {
    it('menghapus karakter terakhir dari currentInput', () => {
      const store = useTypingStore.getState();

      act(() => {
        store.setTestMode('words');
        store.setDuration(5);
        store.startTest();
      });

      // Ketik beberapa karakter
      act(() => {
        useTypingStore.getState().handleKeyPress('a');
        useTypingStore.getState().handleKeyPress('b');
        useTypingStore.getState().handleKeyPress('c');
      });

      expect(useTypingStore.getState().currentInput).toBe('abc');

      // Backspace
      act(() => {
        useTypingStore.getState().handleBackspace();
      });

      expect(useTypingStore.getState().currentInput).toBe('ab');
    });

    it('tidak melakukan apa-apa jika currentInput kosong dan di kata pertama', () => {
      const store = useTypingStore.getState();

      act(() => {
        store.setTestMode('words');
        store.setDuration(5);
        store.startTest();
      });

      // Backspace tanpa mengetik apa-apa
      act(() => {
        useTypingStore.getState().handleBackspace();
      });

      expect(useTypingStore.getState().currentWordIndex).toBe(0);
      expect(useTypingStore.getState().currentInput).toBe('');
    });
  });

  describe('resetTest (Tab behavior)', () => {
    it('mengubah status dari running ke idle', () => {
      const store = useTypingStore.getState();

      // Start game
      act(() => {
        store.setTestMode('words');
        store.setDuration(5);
        store.startTest();
      });

      expect(useTypingStore.getState().status).toBe('running');

      // Simulasi Tab: memanggil resetTest
      act(() => {
        useTypingStore.getState().resetTest();
      });

      expect(useTypingStore.getState().status).toBe('idle');
    });

    it('mereset semua state game saat dipanggil', () => {
      const store = useTypingStore.getState();

      // Start game dan ketik beberapa karakter
      act(() => {
        store.setTestMode('words');
        store.setDuration(5);
        store.startTest();
      });

      const runningStore = useTypingStore.getState();
      const firstWord = runningStore.words[0];

      // Ketik beberapa karakter
      for (const char of firstWord.slice(0, 3)) {
        act(() => {
          useTypingStore.getState().handleKeyPress(char);
        });
      }

      // Pindah ke kata kedua
      act(() => {
        useTypingStore.getState().handleSpace();
      });

      // Verifikasi state sebelum reset
      const beforeReset = useTypingStore.getState();
      expect(beforeReset.currentWordIndex).toBe(1);
      expect(beforeReset.wordResults.length).toBe(1);
      expect(beforeReset.words.length).toBeGreaterThan(0);

      // Reset (simulasi Tab)
      act(() => {
        useTypingStore.getState().resetTest();
      });

      // Verifikasi semua state direset
      const afterReset = useTypingStore.getState();
      expect(afterReset.status).toBe('idle');
      expect(afterReset.words).toEqual([]);
      expect(afterReset.currentWordIndex).toBe(0);
      expect(afterReset.currentInput).toBe('');
      expect(afterReset.wordResults).toEqual([]);
      expect(afterReset.startTime).toBeNull();
      expect(afterReset.currentWordStartTime).toBeNull();
      expect(afterReset.currentWordKeystrokes).toEqual([]);
      expect(afterReset.furthestWordIndex).toBe(0);
      expect(afterReset.results).toBeNull();
      expect(afterReset.wpmHistory).toEqual([]);
    });

    it('mempertahankan setting duration dan testMode setelah reset', () => {
      const store = useTypingStore.getState();

      // Set mode dan duration custom
      act(() => {
        store.setTestMode('time');
        store.setDuration(60);
        store.startTest();
      });

      // Reset
      act(() => {
        useTypingStore.getState().resetTest();
      });

      // Setting harus tetap
      const afterReset = useTypingStore.getState();
      expect(afterReset.testMode).toBe('time');
      expect(afterReset.duration).toBe(60);
      expect(afterReset.timeRemaining).toBe(60);
    });

    it('tidak melakukan apa-apa jika sudah idle', () => {
      const store = useTypingStore.getState();
      expect(store.status).toBe('idle');

      // Reset saat idle
      act(() => {
        store.resetTest();
      });

      // Tetap idle
      expect(useTypingStore.getState().status).toBe('idle');
    });

    it('dapat dipanggil di tengah permainan time mode', () => {
      const store = useTypingStore.getState();

      // Start time mode
      act(() => {
        store.setTestMode('time');
        store.setDuration(30);
        store.startTest();
      });

      // Ketik beberapa kata
      const runningStore = useTypingStore.getState();
      const firstWord = runningStore.words[0];

      for (const char of firstWord) {
        act(() => {
          useTypingStore.getState().handleKeyPress(char);
        });
      }

      act(() => {
        useTypingStore.getState().handleSpace();
      });

      // Verifikasi game sedang berjalan
      expect(useTypingStore.getState().status).toBe('running');
      expect(useTypingStore.getState().currentWordIndex).toBe(1);

      // Reset (Tab)
      act(() => {
        useTypingStore.getState().resetTest();
      });

      // Game harus reset ke idle
      const afterReset = useTypingStore.getState();
      expect(afterReset.status).toBe('idle');
      expect(afterReset.currentWordIndex).toBe(0);
      expect(afterReset.timeRemaining).toBe(30);
    });
  });
});
