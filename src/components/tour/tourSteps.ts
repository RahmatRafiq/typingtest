export interface TourStep {
  id: string;
  target: string | null;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: null,
    title: 'Selamat Datang di TypeMaster!',
    description: 'Aplikasi latihan mengetik dengan gaya notebook. Mari kita lihat fitur-fitur yang tersedia.',
    placement: 'center',
  },
  {
    id: 'mode-selection',
    target: '[data-tour-step="mode-selection"]',
    title: 'Pilih Mode Test',
    description: 'Pilih antara mode Waktu (batas waktu) atau Kata (jumlah kata tertentu).',
    placement: 'bottom',
    highlightPadding: 8,
  },
  {
    id: 'duration-settings',
    target: '[data-tour-step="duration-settings"]',
    title: 'Atur Durasi',
    description: 'Sesuaikan berapa lama atau berapa kata yang ingin kamu ketik dalam satu sesi.',
    placement: 'bottom',
    highlightPadding: 8,
  },
  {
    id: 'hand-mode',
    target: '[data-tour-step="hand-mode"]',
    title: 'Mode Tangan',
    description: 'Latih tangan kiri, kanan, atau bergantian untuk menguatkan jari yang lemah.',
    placement: 'bottom',
    highlightPadding: 8,
  },
  {
    id: 'start-area',
    target: '[data-tour-step="start-area"]',
    title: 'Mulai Mengetik!',
    description: 'Klik area ini atau tekan tombol apa saja untuk memulai test. Tekan Tab untuk restart.',
    placement: 'top',
    highlightPadding: 4,
  },
  {
    id: 'nav-analytics',
    target: '[data-tour-step="nav-analytics"]',
    title: 'Lihat Statistikmu',
    description: 'Lacak progres, lihat tren WPM, dan identifikasi kata bermasalah di halaman Analitik.',
    placement: 'bottom',
    highlightPadding: 8,
  },
];
