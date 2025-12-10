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

export const WORDS = {
  left: [
    'ada', 'agar', 'adat', 'ajar', 'atas', 'bab', 'bad', 'baca', 'badan', 'bagi',
    'bagas', 'bakar', 'barat', 'baru', 'basa', 'batas', 'bawa', 'bebas', 'beda',
    'beras', 'berat', 'besar', 'besar', 'beta', 'biar', 'bisa', 'buah', 'buat',
    'buka', 'cagar', 'cara', 'catat', 'catu', 'dada', 'dapat', 'dasar', 'data',
    'dekat', 'desa', 'dewasa', 'duga', 'era', 'edar', 'erat', 'fajar', 'fakta',
    'gada', 'gaji', 'galak', 'gara', 'garis', 'gas', 'gawat', 'gelar', 'gema',
    'gera', 'giat', 'gila', 'gitar', 'gula', 'guru', 'habis', 'hadap', 'hadir',
    'hafal', 'haji', 'halal', 'halang', 'hama', 'hampir', 'hancur', 'hangat',
    'hanya', 'hapal', 'hapus', 'harga', 'harian', 'harus', 'hasil', 'hati',
    'haus', 'hebat', 'hemat', 'hendak', 'hewan', 'hiasan', 'hidup', 'hijau',
    'hilang', 'hingga', 'hiruk', 'hitung', 'hobi', 'hormat', 'hotel', 'hubung',
    'hukum', 'hutan', 'hutang', 'ibu', 'ide', 'ijin', 'ikut', 'ilmu', 'iman',
    'impor', 'indah', 'induk', 'info', 'ingat', 'ingin', 'ini', 'injak', 'inovasi',
    'insaf', 'insinyur', 'inti', 'ipar', 'irama', 'iri', 'iring', 'iris', 'isi',
    'islam', 'istana', 'istri', 'isu', 'itu', 'izin', 'jadi', 'jaga', 'jagat',
    'jago', 'jahat', 'jahit', 'jajak', 'jajan', 'jaka', 'jalan', 'jalur', 'jam',
    'jaman', 'jambu', 'jamin', 'jamu', 'jamur', 'janda', 'jangan', 'janggal',
    'janji', 'jantan', 'jantung', 'jarak', 'jarang', 'jari', 'jaring', 'jarum',
    'jas', 'jasa', 'jasad', 'jasmani', 'jatah', 'jatuh', 'jauh', 'jawab', 'jaya',
    'jelas', 'jelita', 'jemaat', 'jembatan', 'jemput', 'jemu', 'jendela', 'jenggot',
    'jenis', 'jenuh', 'jepit', 'jerih', 'jernih', 'jeruk', 'jidat', 'jijik', 'jimat',
    'jin', 'jinak', 'jinjing', 'jiwa', 'jodoh', 'joget', 'jorok', 'jual', 'juara',
    'jubah', 'judes', 'judi', 'judo', 'juga', 'jujur', 'juluk', 'jumlah', 'jumpa',
    'jungkir', 'junior', 'junjung', 'juntai', 'jurai', 'juri', 'jurnal', 'juru',
    'jurus', 'justru', 'juta', 'kabar', 'kabur', 'kaca', 'kadar', 'kado', 'kaget',
    'kagum', 'kail', 'kain', 'kait', 'kaji', 'kaku', 'kala', 'kalah', 'kali',
    'kalian', 'kalori', 'kam', 'kamar', 'kambuh', 'kami', 'kampung', 'kamu',
    'kanal', 'kanan', 'kandung', 'kantor', 'kapan', 'kapal', 'kapas', 'kapsul',
    'kapur', 'karang', 'karena', 'karet', 'karier', 'kartu', 'karung', 'karya',
    'kasih', 'kasur', 'kata', 'kategori', 'katun', 'kaus', 'kawan', 'kawin',
    'kawat', 'kaya', 'kayu', 'kecil', 'kejar', 'keluar', 'kembali', 'kemeja',
    'kena', 'kendali', 'keras', 'kerja', 'kertas', 'kesempatan', 'ketua', 'khas',
    'kini', 'kira', 'kiri', 'kita', 'klaim', 'klien', 'klub', 'kode', 'koin',
    'kolam', 'koleksi', 'komentar', 'komputer', 'kondisi', 'kontak', 'kontrak',
    'kopral', 'korek', 'korban', 'kos', 'kota', 'kotor', 'kritis', 'kuasa', 'kuat',
    'kubu', 'kuda', 'kudus', 'kue', 'kuis', 'kuku', 'kuli', 'kulit', 'kulkas',
    'kuma', 'kumpul', 'kunci', 'kuning', 'kunjung', 'kuno', 'kuota', 'kuping',
    'kupu', 'kurang', 'kuras', 'kurban', 'kursus', 'kurung', 'kurus', 'kurva',
    'kusam', 'kusen', 'kusir', 'kutip', 'kutu', 'labuh', 'laci', 'ladang', 'laga',
    'lagi', 'lagu', 'lahir', 'lain', 'laju', 'laki', 'laku', 'lama', 'lamar',
    'lambat', 'lampu', 'lancar', 'langit', 'langkah', 'langsung', 'lanjut', 'lantai',
    'lapang', 'lapor', 'larang', 'lari', 'larut', 'laskar', 'latih', 'laut', 'lawan',
    'layak', 'layanan', 'layar', 'layu', 'lebih', 'leher', 'lelah', 'lemah', 'lemak',
    'lembab', 'lembaga', 'lembar', 'lembut', 'lengkap', 'lepas', 'letak', 'lewat',
    'lezat', 'liburan', 'lidah', 'lihat', 'lima', 'limbah', 'lindung', 'lingkar',
    'lintang', 'lipat', 'lirik', 'listrik', 'liter', 'lobang', 'logam', 'lokal',
    'lomba', 'lompat', 'loncat', 'longgar', 'lorong', 'loteng', 'luang', 'luar',
    'lubang', 'lucu', 'ludes', 'luhur', 'luka', 'lukis', 'lulus', 'lumayan',
    'lumpur', 'lunak', 'luncur', 'luntur', 'lupa', 'luput', 'lurus', 'lusa',
    'macam', 'mahal', 'makan', 'makna', 'malam', 'malas', 'malu', 'mama', 'mana',
    'mandi', 'mantan', 'mantap', 'marga', 'mari', 'masa', 'masak', 'masih', 'masuk',
    'masyarakat', 'mata', 'mati', 'mau', 'mebel', 'melarang', 'melati', 'memang',
    'memasak', 'membaca', 'membantu', 'membawa', 'membeli', 'membuat', 'memilih',
    'meminta', 'mempunyai', 'menang', 'menanti', 'mencari', 'mendapat', 'mendengar',
    'menerima', 'mengapa', 'mengerti', 'mengikuti', 'menikmati', 'meniru', 'menolak',
    'menolong', 'menonton', 'menuju', 'menulis', 'menunggu', 'menyapa', 'merasa',
    'mereka', 'meski', 'mewah', 'mie', 'milik', 'minta', 'minum', 'minyak', 'miring',
    'mirip', 'miskin', 'mitra', 'mobil', 'modal', 'mode', 'modern', 'mohon', 'momen',
    'monarki', 'mondar', 'moneter', 'monitor', 'monyet', 'moral', 'motif', 'motivasi',
    'motor', 'motto', 'muat', 'muda', 'mudah', 'muka', 'mula', 'mulai', 'mulia',
    'mulut', 'mumpung', 'muncul', 'mundur', 'mungil', 'mungkin', 'murah', 'murni',
    'murid', 'murka', 'murung', 'murus', 'musang', 'museum', 'musik', 'musim',
    'muslim', 'musnah', 'mustahil', 'mutu', 'nabi', 'nafas', 'nafkah', 'nafsu',
    'naga', 'naif', 'naik', 'nakal', 'nama', 'nampak', 'nanas', 'nanti', 'narapidana',
    'narasi', 'narkoba', 'nasib', 'nasional', 'nasi', 'natal', 'naungan', 'nazar',
    'negatif', 'negara', 'negosiasi', 'nekat', 'nenek', 'neon', 'neraca', 'neraka',
    'netral', 'ngeri', 'niaga', 'niat', 'nihil', 'nikah', 'nikmat', 'nilai', 'niscaya',
    'nista', 'noda', 'nol', 'nomor', 'nona', 'nongkrong', 'nonpribumi', 'norma',
    'normal', 'nostalgia', 'nota', 'novel', 'november', 'nuansa', 'nubuat', 'nujum',
    'nukilan', 'numpang', 'nuri', 'nurani', 'nutrisi', 'nyala', 'nyali', 'nyaman',
    'nyamuk', 'nyanyi', 'nyaris', 'nyata', 'nyawa', 'nyeri', 'obat', 'obor', 'obral',
    'observasi', 'obsesi', 'obyek', 'ode', 'odol', 'ofensif', 'ogah', 'ohoho',
    'ojek', 'oke', 'oktober', 'olah', 'oleh', 'oleskan', 'olimpiade', 'omong',
    'omset', 'ondel', 'ongkos', 'online', 'ontel', 'operasi', 'opini', 'optimal',
    'opsi', 'orbit', 'order', 'organ', 'organisasi', 'orisinal', 'orkestra', 'ornamen',
    'otak', 'otentik', 'otomatis', 'otonom', 'otot', 'oval', 'oven', 'pabrik', 'pacar',
    'padat', 'paduan', 'pagar', 'pagi', 'paham', 'pahat', 'pahlawan', 'pajak', 'pakai',
    'pakar', 'pakat', 'paket', 'paksa', 'paku', 'palang', 'paling', 'palsu', 'palu',
    'paman', 'pameran', 'pamit', 'pamor', 'panas', 'pancar', 'pancing', 'pandan',
    'pandang', 'panduan', 'panggang', 'pangkal', 'pangkat', 'panggil', 'panggung',
    'panik', 'panjang', 'panjat', 'pantai', 'pantas', 'pantau', 'panti', 'pantul',
    'papa', 'papan', 'papar', 'par', 'para', 'parah', 'parasit', 'parau', 'parfum',
    'parkir', 'parlemen', 'partai', 'paruh', 'paru', 'pas', 'pasak', 'pasang', 'pasar',
    'pasien', 'pasir', 'pasti', 'pasukan', 'patah', 'patek', 'paten', 'patri', 'patuh',
    'patung', 'patut', 'paulus', 'paus', 'pause', 'paut', 'pawang', 'payah', 'payung',
    'pecah', 'pedang', 'pedas', 'pedih', 'pegal', 'pegang', 'pegat', 'pegawai', 'pekan',
    'pekat', 'pelari', 'pelayan', 'peluk', 'pemain', 'pembeli', 'pemerintah', 'pemuda',
    'penari', 'panas', 'pendek', 'pendidikan', 'pengarang', 'penting', 'penuh', 'penulis',
    'penumpang', 'penyakit', 'per', 'peran', 'perahu', 'perak', 'peras', 'peraturan',
    'percaya', 'perdagangan', 'perempuan', 'pergantian', 'perhitungan', 'periksa', 'peringatan',
    'perintah', 'periodik', 'perjanjian', 'perkara', 'perlu', 'pernahkah', 'pernah', 'perpustakaan',
    'persis', 'pertama', 'pertanyaan', 'pertemuan', 'perut', 'pesanan', 'pesawat', 'petak',
    'petani', 'peti', 'petir', 'pihak', 'pikir', 'pimpin', 'pindah', 'pinggir', 'pintar',
    'pintu', 'pipa', 'pipi', 'pisah', 'pisau', 'pita', 'pizza', 'plakat', 'plan',
    'planet', 'plasma', 'plastik', 'plat', 'platform', 'plester', 'plot', 'plus',
    'pokok', 'polisi', 'politik', 'polo', 'pompa', 'pondok', 'porak', 'pori', 'portal',
    'porsi', 'pos', 'posisi', 'positif', 'poster', 'pot', 'potong', 'potongan', 'prabayar',
    'pramuka', 'praktek', 'prangko', 'prasarana', 'prasmanan', 'pratama', 'prediksi', 'preferensi',
    'presiden', 'prestasi', 'preventif', 'prima', 'printer', 'prioritas', 'pria', 'pribadi',
    'prihatin', 'prinsip', 'printer', 'privasi', 'pro', 'prodi', 'produk', 'profesi',
    'profil', 'program', 'proges', 'promo', 'promosi', 'properti', 'proposal', 'prosa',
    'proses', 'prospek', 'prosper', 'proteksi', 'protes', 'protokol', 'provinsi', 'proyeksi',
    'proyek', 'publikasi', 'publik', 'pucat', 'pucuk', 'pudar', 'puing', 'puisi', 'puja',
    'puji', 'pukul', 'pula', 'pulang', 'pulau', 'puli', 'pulih', 'pulpen', 'pulsa',
    'puluh', 'pun', 'punah', 'puncak', 'pungut', 'punya', 'pupuk', 'pupus', 'puput',
    'pura', 'puri', 'purna', 'purnama', 'purnawirawan', 'pusat', 'pusing', 'puspa',
    'pustaka', 'putar', 'putera', 'putih', 'putri', 'putus', 'puyuh', 'rabat', 'raba',
    'rabuk', 'racun', 'rada', 'radang', 'radiasi', 'radio', 'radius', 'raga', 'ragam',
    'ragi', 'ragu', 'rahang', 'rahasia', 'raih', 'raja', 'rajin', 'rajut', 'raket',
    'rakitan', 'rakyat', 'rala', 'ramai', 'rambat', 'rambut', 'rampas', 'rampung',
    'ramu', 'rancang', 'rancangan', 'randa', 'randuk', 'rang', 'rangka', 'rangkai',
    'rangkap', 'rangkul', 'rangkum', 'rangsang', 'rantai', 'rantang', 'rantas', 'ranting',
    'ranum', 'rapuh', 'rapat', 'rasa', 'rasal', 'rasio', 'rasional', 'rata', 'ratap',
    'ratu', 'raung', 'rawat', 'raya', 'rayap', 'rayuan', 'reaksi', 'real', 'realis',
    'realita', 'reban', 'rebut', 'redaksi', 'redup', 'referensi', 'refleksi', 'reformasi',
    'regu', 'regulasi', 'registrasi', 'rejeki', 'reka', 'rekam', 'rekan', 'rekap',
    'rekat', 'rekening', 'rekomendasi', 'rekonstruksi', 'rekor', 'rekrut', 'reksa',
    'rela', 'relasi', 'relevan', 'relief', 'religi', 'rem', 'remah', 'remaja', 'remas',
    'remis', 'rempah', 'rencana', 'rendam', 'rendah', 'renovasi', 'renta', 'rentang',
    'rentan', 'rentenir', 'renyah', 'reorganisasi', 'repot', 'representasi', 'reproduksi',
    'reputasi', 'reruntuhan', 'resah', 'resam', 'resep', 'reservasi', 'resiko', 'resign',
    'resmi', 'resolusi', 'resonansi', 'resort', 'respek', 'respon', 'restoran', 'restorasi',
    'restu', 'resume', 'resurgent', 'retakan', 'retak', 'retorika', 'retribusi', 'reuni',
    'revisi', 'revolusi', 'rezeki', 'rezim', 'riasan', 'ribuan', 'riba', 'ribut', 'ridha',
    'rileks', 'rim', 'rimba', 'rimpang', 'rinci', 'rindu', 'ringan', 'ringkas', 'ringkasan',
    'ringsek', 'rintang', 'rintihan', 'rintik', 'riset', 'risih', 'risiko', 'ritual',
    'riuh', 'riyal', 'roda', 'rokok', 'rol', 'roman', 'romantis', 'rombak', 'rombeng',
    'rombongan', 'rompi', 'rona', 'rongga', 'rontgen', 'rontok', 'rosot', 'roti', 'rotan',
    'royal', 'ruang', 'ruas', 'rubah', 'rubrik', 'ruda', 'rugi', 'rujak', 'rujuk',
    'rukun', 'rumah', 'rumbai', 'rumit', 'rumor', 'rumput', 'rumus', 'runding', 'runtuh',
    'runtunan', 'rupa', 'rupiah', 'rusak', 'rusuh', 'rutin', 'saat', 'sabda', 'sabet',
    'sabit', 'sabu', 'sabuk', 'sabun', 'sabur', 'sadap', 'sadar', 'sado', 'saf',
    'safari', 'sah', 'sahabat', 'sahaja', 'saham', 'sahih', 'sahur', 'sahut', 'sais',
    'saja', 'saji', 'sajian', 'sak', 'sakit', 'sakral', 'saksi', 'saksikan', 'sakti',
    'saku', 'salah', 'salak', 'salam', 'saldo', 'saleh', 'sales', 'salib', 'salin',
    'salju', 'salon', 'salur', 'salut', 'sama', 'samak', 'samar', 'sambang', 'sambar',
    'sambil', 'sambung', 'sambut', 'sampah', 'sampai', 'sampan', 'samping', 'sampul',
    'sana', 'sanad', 'sanak', 'sandal', 'sandang', 'sandar', 'sandi', 'sandiwara', 'sandung',
    'sanga', 'sangat', 'sangga', 'sanggah', 'sanggul', 'sanggup', 'sangka', 'sangkar',
    'sangkur', 'sangkut', 'sangsi', 'sangu', 'sanitasi', 'santa', 'santai', 'santan',
    'santap', 'santer', 'santun', 'saos', 'sapa', 'sapu', 'sar', 'sara', 'saran',
    'sarang', 'sarap', 'sarat', 'sarden', 'sari', 'saring', 'sarjana', 'sarpan', 'sarung',
    'sasaran', 'satelit', 'sate', 'satria', 'satuan', 'satu', 'saudara', 'saus', 'sawah',
    'sawit', 'saya', 'sayap', 'sayang', 'sayat', 'sayup', 'sayur'
  ],

  right: [
    'hiu', 'hijau', 'hilmi', 'hindu', 'hingga', 'hirup', 'hitung', 'hobby', 'hongkong',
    'horizon', 'hormati', 'hosting', 'hotel', 'hubungi', 'hujung', 'hukum', 'hujan',
    'humoris', 'hungaria', 'hunian', 'hunjam', 'hutan', 'hyena', 'ibadah', 'ibarat',
    'ibu', 'ibukota', 'idaman', 'ide', 'ideal', 'identik', 'identitas', 'idiom',
    'idiot', 'idol', 'idola', 'igama', 'igau', 'ihlas', 'ijab', 'ijin', 'ijo',
    'ijuk', 'ikan', 'ikat', 'iklim', 'iklan', 'ikhlas', 'ikhtiar', 'iklan', 'ikon',
    'ikrar', 'ikut', 'ilahi', 'ilegal', 'ilham', 'ilmiah', 'ilmu', 'ilustrasi', 'imaji',
    'imam', 'iman', 'imbang', 'imbau', 'iming', 'imigran', 'imigrasi', 'imitasi', 'imlek',
    'impas', 'impian', 'implikasi', 'impor', 'impoten', 'impresi', 'imunisasi', 'imut',
    'inap', 'incar', 'inci', 'indah', 'indeks', 'india', 'indikasi', 'indikator', 'individu',
    'indoesia', 'indoor', 'indra', 'induk', 'industri', 'inersia', 'infak', 'infant',
    'infeksi', 'inferior', 'inflasi', 'info', 'informal', 'informan', 'informasi', 'infrastruktur',
    'infus', 'ingat', 'ingin', 'inggris', 'inheren', 'ini', 'inisial', 'inisiatif', 'injak',
    'inovasi', 'inovatif', 'input', 'inquiri', 'insaf', 'insan', 'inseminasi', 'insert',
    'inses', 'insiden', 'insight', 'insinuasi', 'insinyur', 'inspeksi', 'inspirasi', 'instansi',
    'instink', 'institusi', 'instruksi', 'instrumen', 'insulin', 'intel', 'intelektual', 'intelijen',
    'intensif', 'intensitas', 'interaksi', 'interest', 'interior', 'intermeso', 'intern', 'internal',
    'internet', 'interpretasi', 'interupsi', 'interviu', 'inti', 'intim', 'intimidasi', 'intip',
    'intrik', 'intrinsik', 'intro', 'introduksi', 'introspeksi', 'intuisi', 'invasi', 'inventaris',
    'inventif', 'investasi', 'investor', 'involusi', 'ion', 'ipar', 'irama', 'iran', 'iri',
    'irigasi', 'iring', 'iris', 'ironi', 'irregular', 'irup', 'isa', 'isap', 'iseng', 'isian',
    'isim', 'islam', 'islandia', 'isolasi', 'israel', 'istana', 'istilah', 'istimewa', 'istirahat',
    'istri', 'isu', 'isyarat', 'itu', 'iuran', 'izin', 'janji', 'jamin', 'jampi', 'jinjing',
    'jintan', 'jitu', 'jiwa', 'jilbab', 'jilid', 'jimat', 'jinak', 'jingga', 'jinjit',
    'jip', 'jiplak', 'jiprat', 'jirat', 'jiran', 'jitu', 'jiwa', 'joki', 'jolok',
    'jongkok', 'jorok', 'juang', 'jual', 'juara', 'jubah', 'judes', 'judi', 'judo',
    'juga', 'juhi', 'jujur', 'julai', 'julang', 'juli', 'juluk', 'julur', 'julung',
    'jumaat', 'jumbo', 'jumhur', 'jumjumah', 'jumlah', 'jumpa', 'jumpai', 'jumput', 'junani',
    'jundi', 'jungkat', 'jungkir', 'jungkit', 'juni', 'junior', 'junjung', 'juntai', 'junub',
    'jupa', 'jurai', 'juragan', 'juri', 'jurnal', 'jurnalis', 'juru', 'jurus', 'jurubicara',
    'jurumudi', 'justeru', 'justifikasi', 'justru', 'juta', 'jutawan', 'kabin', 'kabinet',
    'kini', 'kirim', 'koloni', 'komik', 'konon', 'kuno', 'kulit', 'kuliah', 'kulon',
    'lilin', 'limit', 'linimasa', 'lirik', 'lion', 'lipan', 'lipur', 'lirik', 'lisensi',
    'lini', 'link', 'linux', 'lion', 'lipan', 'lipit', 'lipstik', 'lipur', 'lirik',
    'lisensi', 'lisong', 'listrik', 'liter', 'litografi', 'literasi', 'literatur', 'litigasi',
    'litmus', 'liturgi', 'liuk', 'liur', 'liwa', 'liwat', 'lobi', 'lobak', 'lobby',
    'lobi', 'login', 'loji', 'lok', 'loka', 'lokal', 'lokasi', 'lokomotif', 'loloh',
    'lolongan', 'lom', 'lomba', 'lombok', 'lompat', 'loncat', 'londong', 'long', 'longgar',
    'longsor', 'lonjak', 'lonjong', 'lonjor', 'lontar', 'lontaran', 'lontong', 'look',
    'loper', 'loreng', 'lori', 'lorong', 'los', 'losion', 'losmen', 'losin', 'lot',
    'lotek', 'loteri', 'loti', 'lotion', 'lotong', 'loyak', 'loyal', 'loyalis', 'loyalitas',
    'luap', 'luar', 'lubang', 'lubuk', 'lucu', 'ludah', 'lugas', 'lugu', 'luhung',
    'luhur', 'luing', 'luka', 'luku', 'luluh', 'lulus', 'lumayan', 'lumas', 'lumbung',
    'lumpur', 'lumpuh', 'lumur', 'lumuran', 'lunak', 'lunas', 'luncur', 'luncuran', 'lundi',
    'lunglai', 'luntur', 'lunturan', 'lup', 'lupa', 'lupakan', 'lupus', 'luput', 'luruh',
    'luruhan', 'lurus', 'lusa', 'lusuh', 'lusin', 'lutut', 'makmur', 'makna', 'maksim',
    'maksimal', 'maksimum', 'maksud', 'makul', 'malu', 'mamah', 'mamalia', 'maman', 'mami',
    'mamik', 'mamil', 'mampat', 'mampu', 'mampus', 'manah', 'manajemen', 'manan', 'manasik',
    'manat', 'mandala', 'mandarin', 'mandataris', 'mandi', 'mandiri', 'mandor', 'mandraguna',
    'mandung', 'mandur', 'manekin', 'manga', 'mangga', 'mangir', 'mangkok', 'mangkuk',
    'mangkuang', 'mangsi', 'mangut', 'mani', 'mania', 'manifes', 'manifestasi', 'manifesto',
    'manik', 'manikmaya', 'manipulasi', 'manis', 'manisan', 'manisnya', 'manjur', 'manja',
    'manjakani', 'manoar', 'manor', 'mansur', 'mantab', 'mantan', 'mantap', 'manteb',
    'mantera', 'manti', 'mantik', 'mantis', 'manto', 'mantol', 'mantri', 'mantu', 'mantuk',
    'manuk', 'manula', 'manuskrip', 'manusia', 'manusiawi', 'manut', 'manuver', 'map',
    'mapak', 'maqasid', 'mar', 'mara', 'marabahaya', 'marah', 'marak', 'maraknya', 'maram',
    'mimpi', 'mimin', 'minggir', 'mini', 'minim', 'minimum', 'minit', 'minjam', 'minna',
    'minum', 'minuman', 'minus', 'minyak', 'mio', 'mipe', 'mir', 'mirip', 'miring',
    'misah', 'misi', 'misil', 'misin', 'miskin', 'missa', 'mister', 'misteri', 'mistik',
    'mistis', 'mit', 'mitasi', 'mitologi', 'mitos', 'mitra', 'mitrais', 'miu', 'mizan',
    'mobil', 'mobilisasi', 'moda', 'modal', 'modalis', 'modalitas', 'mode', 'model',
    'modem', 'moden', 'moderasi', 'moderator', 'modern', 'modifikasi', 'modin', 'modis',
    'modiste', 'modul', 'modular', 'mogok', 'mohon', 'mok', 'mokal', 'moksa', 'mol',
    'mola', 'molar', 'molas', 'molekul', 'molek', 'moler', 'moles', 'molok', 'mom',
    'momen', 'momentum', 'momok', 'momon', 'momong', 'monarki', 'moncer', 'mondar', 'mondok',
    'moneter', 'monil', 'monitor', 'mono', 'monocle', 'monogami', 'monografi', 'monolog',
    'monopoli', 'monosuku', 'monoton', 'monotype', 'monster', 'monsun', 'montase', 'montir',
    'montok', 'montor', 'monumen', 'monyet', 'moon', 'mop', 'mopeng', 'mor', 'moral',
    'moralis', 'moralitas', 'morat', 'morfem', 'morfin', 'morfologi', 'mori', 'mortalitas',
    'mortir', 'mosaik', 'motif', 'motivasi', 'moto', 'motor', 'motorsport', 'motto', 'mou',
    'mual', 'muamalah', 'muara', 'muat', 'muatan', 'muazin', 'mubah', 'mubalig', 'mubarak',
    'mucikari', 'muda', 'mudah', 'mudarat', 'mudik', 'mudin', 'mudun', 'mufakat', 'mufti',
    'mugkin', 'muhabah', 'muhibah', 'muhrim', 'muhsin', 'mujahid', 'mujahidin', 'mujair',
    'mujarab', 'mujizat', 'mujur', 'muka', 'mukah', 'mukalaf', 'mukena', 'mukhalafah', 'mukhtasar',
    'mukidi', 'mukimin', 'mukjizat', 'muktamar', 'mul', 'mula', 'mulai', 'mulak', 'mulas',
    'mulato', 'mulhak', 'muli', 'mulia', 'muliakan', 'muliawan', 'mulsa', 'multi', 'multimedia',
    'multiplikasi', 'multiprosesor', 'multivitamin', 'muluk', 'mulus', 'mulut', 'mumkin', 'mumpung',
    'mumpuni', 'mumtaz', 'mun', 'munafarit', 'munafik', 'munajat', 'munas', 'muncikari', 'muncrat',
    'muncul', 'munculnya', 'mundung', 'mundur', 'mungil', 'mungkin', 'mungkir', 'mungkum', 'mungsi',
    'muni', 'munifik', 'munim', 'munir', 'munjung', 'munkar', 'munsyi', 'muntaber', 'muntah',
    'munyuk', 'mupakat', 'muqaddam', 'muqadimah', 'mur', 'murah', 'murai', 'murak', 'muram',
    'murba', 'murdar', 'muri', 'murid', 'murka', 'murni', 'murojaah', 'mursal', 'mursid',
    'murtad', 'murung', 'murup', 'murus', 'mus', 'musa', 'musabab', 'musabaqah', 'musafir',
    'musang', 'musawwir', 'museum', 'mushaf', 'musik', 'musikal', 'musikalisasi', 'musikus',
    'musim', 'muskil', 'muslim', 'muslimah', 'muslimin', 'musnah', 'musola', 'muspida', 'muspukom',
    'mustahak', 'mustahil', 'mustakim', 'mustang', 'musuh', 'musyafir', 'musyarakah', 'musyawarah',
    'musyrik', 'musytari', 'mut', 'mutaakhir', 'mutabar', 'mutah', 'mutakhir', 'mutalaah', 'mutasi',
    'mutawatir', 'mutia', 'mutiara', 'mutlak', 'mutu', 'muturut', 'muzakarah', 'muzaki', 'myopia'
  ],

  mixed: [
    'adalah', 'adanya', 'adapun', 'agama', 'akan', 'akhir', 'akibat', 'aktivitas', 'alam',
    'alasan', 'amat', 'anak', 'antara', 'apa', 'apabila', 'apakah', 'arah', 'artikel',
    'atas', 'atau', 'badan', 'bagaimana', 'bagi', 'bahasa', 'bahkan', 'bahwa', 'baik',
    'banyak', 'baru', 'bawah', 'beberapa', 'begitu', 'belakang', 'belum', 'benar', 'bentuk',
    'berapa', 'berat', 'berbagai', 'berbeda', 'berdiri', 'berhasil', 'berjalan', 'berkembang',
    'berlaku', 'bersama', 'besar', 'biasa', 'bidang', 'bila', 'bisa', 'boleh', 'buah',
    'bukan', 'bulan', 'dapat', 'dari', 'dasar', 'dengan', 'depan', 'diri', 'dunia',
    'ekonomi', 'empat', 'guna', 'hal', 'hampir', 'hanya', 'harga', 'harus', 'hasil',
    'hidup', 'hingga', 'hubungan', 'indonesia', 'informasi', 'ini', 'ingin', 'itu', 'jadi',
    'jalan', 'jangan', 'jauh', 'jelas', 'jenis', 'jika', 'jumlah', 'justru', 'kali',
    'kalau', 'kami', 'karena', 'kata', 'kedua', 'kegiatan', 'kembali', 'kemudian', 'kepada',
    'kerja', 'kesempatan', 'ketika', 'kini', 'kita', 'kondisi', 'kurang', 'lagi', 'lain',
    'lalu', 'lama', 'langsung', 'lebih', 'lewat', 'lima', 'maka', 'makna', 'malam',
    'mampu', 'mana', 'masing', 'masih', 'masyarakat', 'mata', 'melalui', 'melakukan', 'memang',
    'memiliki', 'menang', 'menjadi', 'menurut', 'merupakan', 'meski', 'milik', 'misalnya',
    'mulai', 'muncul', 'mungkin', 'nama', 'namun', 'negara', 'nilai', 'nomor', 'oleh',
    'orang', 'pada', 'paling', 'para', 'pasti', 'pemerintah', 'pendidikan', 'penting',
    'perlu', 'pernah', 'pertama', 'pihak', 'pola', 'proses', 'produk', 'program', 'proyek',
    'pula', 'rakyat', 'rata', 'rupanya', 'saat', 'saja', 'salah', 'sama', 'sampai',
    'sangat', 'satu', 'sebab', 'sebagai', 'sebelum', 'sedang', 'sedikit', 'segala', 'segera',
    'sejak', 'sekarang', 'sekitar', 'selain', 'selalu', 'selama', 'seluruh', 'semakin',
    'semua', 'sendiri', 'seperti', 'sering', 'serta', 'sesuai', 'setelah', 'setiap', 'siapa',
    'sistem', 'situasi', 'sudah', 'sulit', 'tahun', 'tampak', 'tanpa', 'tapi', 'tentu',
    'tentang', 'terdapat', 'terhadap', 'termasuk', 'terjadi', 'terlalu', 'ternyata', 'tersebut',
    'terus', 'tetap', 'tetapi', 'tidak', 'tiga', 'tinggi', 'tujuan', 'turut', 'umum',
    'untuk', 'upaya', 'waktu', 'walaupun', 'yang', 'yaitu'
  ]
};

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
