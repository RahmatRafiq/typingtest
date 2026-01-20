import { HandMode } from './constants';

const LEFT_HAND_KEYS = new Set(['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b']);
const RIGHT_HAND_KEYS = new Set(['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm']);

export type WordHand = 'left' | 'right' | 'mixed';

export function getWordHand(word: string): WordHand {
  const chars = word.toLowerCase().split('').filter(c => /[a-z]/.test(c));
  const leftCount = chars.filter(c => LEFT_HAND_KEYS.has(c)).length;
  const rightCount = chars.filter(c => RIGHT_HAND_KEYS.has(c)).length;

  if (leftCount > 0 && rightCount === 0) return 'left';
  if (rightCount > 0 && leftCount === 0) return 'right';
  return 'mixed';
}

const ALL_WORDS = [
  'abu', 'ada', 'adalah', 'agar', 'ahli', 'air', 'akan', 'akar', 'akibat', 'aku',
  'alami', 'amarah', 'anak', 'anda', 'aneka', 'angin', 'angka', 'antara', 'apa', 'apalagi',
  'arah', 'arus', 'asal', 'astaga', 'atau', 'atas', 'ayah', 'ayo', 'baca', 'bagai',
  'bagaikan', 'bagaimana', 'bagi', 'bagian', 'bahasa', 'bahkan', 'bahwa', 'baik', 'baku', 'banjir',
  'bantu', 'banyak', 'bapak', 'bawah', 'beberapa', 'belajar', 'beliau', 'belum', 'benar', 'bentuk',
  'berapa', 'berarti', 'berbagi', 'berbeda', 'berharap', 'berhenti', 'bermain', 'bersih', 'besar', 'besok',
  'biar', 'biarpun', 'bicara', 'bila', 'bisa', 'buka', 'buku', 'bukan', 'cahaya', 'cantik',
  'cara', 'cari', 'cinta', 'cipta', 'ciri', 'coba', 'contoh', 'cukup', 'dalam', 'dan',
  'dapat', 'dari', 'dekat', 'demi', 'demikian', 'dengan', 'depan', 'desa', 'detik', 'di',
  'dia', 'dingin', 'dulu', 'ganti', 'gila', 'guna', 'habis', 'hanya', 'hari', 'harus',
  'hati', 'hidup', 'hilang', 'hingga', 'huruf', 'ibu', 'ingin', 'ini', 'itu', 'jadi',
  'jam', 'jarak', 'jarang', 'jika', 'jumlah', 'jari', 'kadang', 'kalah', 'kalau', 'kalian',
  'kalimat', 'kami', 'kamu', 'kanan', 'kapan', 'karena', 'kasih', 'kata', 'kau', 'ke',
  'kecil', 'kecuali', 'kemarin', 'kembali', 'kemudian', 'keras', 'kerja', 'kertas', 'ketika', 'kiri',
  'kita', 'kota', 'kotor', 'kurang', 'lagi', 'lagipula', 'lalu', 'lari', 'layanan', 'lebih',
  'lekas', 'lewat', 'libur', 'lupa', 'lusa', 'maaf', 'macam', 'maha', 'mampu', 'mana',
  'marah', 'mari', 'masalah', 'mati', 'maupun', 'melainkan', 'melakukan', 'melalui', 'membaca', 'membuat',
  'memerlukan', 'memiliki', 'mencuri', 'menang', 'mengapa', 'mengatakan', 'mengenai', 'menit', 'menjadi', 'menjual',
  'menulis', 'merasa', 'mereka', 'meski', 'meskipun', 'milik', 'mohon', 'muda', 'mulai', 'muncul',
  'mungkin', 'naik', 'nama', 'namun', 'nikmat', 'oleh', 'orang', 'pada', 'paham', 'panas',
  'para', 'pendek', 'percaya', 'pergi', 'perlu', 'pertama', 'pohon', 'pria', 'publik', 'pulang',
  'radius', 'ragam', 'ramah', 'ras', 'rasa', 'rasio', 'rasional', 'rayu', 'rendah', 'rumah',
  'rusa', 'rusak', 'rusuk', 'sabar', 'sakit', 'saku', 'salah', 'sama', 'sambil', 'sampai',
  'samping', 'sana', 'sangat', 'sapa', 'saya', 'sebab', 'sebagai', 'sebelum', 'sebuah', 'secara',
  'sedang', 'sedangkan', 'sedikit', 'sehingga', 'sejak', 'sekali', 'sekarang', 'sekolah', 'selain', 'selalu',
  'selama', 'selamat', 'selanjutnya', 'seperti', 'sering', 'serta', 'seru', 'serupa', 'setelah', 'setiap',
  'siapa', 'sini', 'situ', 'suara', 'suatu', 'sudah', 'sulit', 'sungguh', 'supaya', 'tahu',
  'takut', 'taman', 'tambah', 'tanaman', 'tangkap', 'tanya', 'tempat', 'tenang', 'terampil', 'terasa',
  'terbang', 'terima', 'terjadi', 'terlalu', 'ternyata', 'tetapi', 'tiba', 'tidak', 'tinggal', 'tinggi',
  'tolong', 'tua', 'tumbuh', 'tunas', 'tunggu', 'turun', 'tutup', 'udara', 'untuk', 'wahai',
  'wajah', 'wajar', 'waktu', 'walau', 'walaupun', 'wanita', 'yaitu', 'yakin', 'yakni', 'yang',
];

function categorizeWords() {
  const left: string[] = [];
  const right: string[] = [];
  const mixed: string[] = [];

  for (const word of ALL_WORDS) {
    const hand = getWordHand(word);
    if (hand === 'left') left.push(word);
    else if (hand === 'right') right.push(word);
    else mixed.push(word);
  }

  return { left, right, mixed };
}

export const WORDS = categorizeWords();

export function getWords(handMode: HandMode, count: number): string[] {
  let wordPool: string[] = [];

  switch (handMode) {
    case 'left':
      wordPool = [...WORDS.left];
      break;
    case 'right':
      wordPool = [...WORDS.right];
      break;
    case 'alternating':
      const leftWords = shuffleArray([...WORDS.left]);
      const rightWords = shuffleArray([...WORDS.right]);
      const result: string[] = [];
      for (let i = 0; i < count; i++) {
        if (i % 2 === 0) {
          result.push(leftWords[i % leftWords.length]);
        } else {
          result.push(rightWords[i % rightWords.length]);
        }
      }
      return result;
    case 'both':
    default:
      wordPool = [...WORDS.left, ...WORDS.right, ...WORDS.mixed];
  }

  return shuffleArray(wordPool).slice(0, count);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getProblemWords(problemList: string[], mixRatio: number = 0.7, totalCount: number = 50): string[] {
  const problemCount = Math.floor(totalCount * mixRatio);
  const fillerCount = totalCount - problemCount;

  const problems = shuffleArray([...problemList]).slice(0, problemCount);
  const fillers = shuffleArray([...WORDS.mixed]).slice(0, fillerCount);

  return shuffleArray([...problems, ...fillers]);
}
