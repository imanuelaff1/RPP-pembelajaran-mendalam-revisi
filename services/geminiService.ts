import { GoogleGenAI, Type } from "@google/genai";
import type { RppFormData, GeneratedRpp } from '../types';

const rppSectionItemSchema = {
  type: Type.OBJECT,
  properties: {
    konteks: { type: Type.STRING, description: 'Judul atau konteks singkat dari poin ini.' },
    deskripsi: { type: Type.STRING, description: 'WAJIB IKUTI FORMAT HIERARKIS: Poin utama ditebalkan (**Contoh Poin Utama**). Sub-poin penjelas di bawahnya WAJIB menggunakan daftar bernomor (1., 2., dst.). DILARANG KERAS menggunakan bullet point (*) atau tanda hubung (-).' },
  },
  required: ['konteks', 'deskripsi'],
};

const kktpItemSchema = {
    type: Type.OBJECT,
    properties: {
        tujuan: { type: Type.STRING, description: 'Satu tujuan pembelajaran spesifik yang dapat diukur dan diamati.' },
        kriteria: { type: Type.STRING, description: 'Deskripsi kriteria konkret, jelas, dan terukur yang menunjukkan ketercapaian tujuan pembelajaran ini.' },
    },
    required: ['tujuan', 'kriteria'],
};


const responseSchemaProperties = {
    A_identitasKonteks: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Identitas dan Konteks RPP" },
    B_capaianTujuanPembelajaran: { type: Type.ARRAY, items: kktpItemSchema, description: "Rincian Tujuan Pembelajaran dan Kriteria Ketercapaiannya (KKTP), dipecah menjadi tujuan dan kriteria spesifik." },
    C_dimensiProfilLulusan: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Keterkaitan dengan Dimensi Profil Lulusan" },
    D_lintasDisiplinTopik: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Keterkaitan Lintas Disiplin Ilmu dengan Topik" },
    E_praktikPedagogisUtama: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Praktik Pedagogis Utama yang Digunakan" },
    F_lingkunganPembelajaran: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Pengaturan Lingkungan Pembelajaran" },
    G_pemanfaatanDigital: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Pemanfaatan Teknologi Digital" },
    H_kemitraanPembelajaran: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Kemitraan dengan Orang Tua/Komunitas" },
    I_langkahLangkahPembelajaran: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Langkah-langkah Pembelajaran Detail per Pertemuan" },
    J_asesmenInstrumen: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Strategi dan Instrumen Asesmen (Diagnostik, Formatif, Sumatif)" },
    K_diferensiasiAkomodasi: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Strategi Diferensiasi dan Akomodasi (Konten, Proses, Produk)" },
    L_tindakLanjutRefleksi: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Kegiatan Tindak Lanjut dan Refleksi Guru/Siswa" },
    M_daftarRujukanInternal: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar Rujukan dan Sumber Belajar" },
};

const responseSchema = {
    type: Type.OBJECT,
    properties: responseSchemaProperties,
    required: Object.keys(responseSchemaProperties)
};

const buildPrompt = (formData: RppFormData): string => {
    let prompt = `Anda adalah seorang ahli pedagogi dan desainer instruksional yang sangat berpengalaman di Indonesia. Tugas Anda adalah membuat Rencana Pelaksanaan Pembelajaran (RPP) yang mendalam, berpusat pada siswa, dan inovatif berdasarkan data yang diberikan.

    **Instruksi Kritis untuk Format Konten:**
    1.  **HANYA JSON:** Seluruh output Anda HARUS berupa objek JSON tunggal yang valid, tanpa teks pembuka, penutup, atau penjelasan lain.
    2.  **Struktur Deskripsi (FORMAT SANGAT PENTING & WAJIB DIIKUTI):** Setiap nilai untuk properti 'deskripsi' HARUS mengikuti format hierarkis yang ketat:
        - **Poin Utama:** Selalu tulis sebagai teks tebal (menggunakan sintaks Markdown \`**...**\`). JANGAN diawali dengan karakter lain (seperti *, -, atau nomor).
        - **Sub-Poin Penjelas:** Jika ada, selalu tulis sebagai daftar bernomor (dimulai dari \`1.\`, \`2.\`, dst.) yang terletak di baris baru di bawah poin utama.
        - **LARANGAN MUTLAK:** Jangan pernah menggunakan bullet point (\`*\`) atau tanda hubung (\`-\`) dalam bentuk apapun di seluruh respons Anda. Penggunaan karakter ini akan dianggap sebagai kegagalan.
        - **Contoh Format yang BENAR:**
          "deskripsi": "**Karakteristik Peserta Didik:**\\n1. Siswa memiliki gaya belajar visual.\\n2. Beberapa siswa memerlukan bimbingan tambahan."
        - **Contoh Format yang SALAH:**
          "deskripsi": "* Karakteristik Peserta Didik\\n- Siswa visual\\n- Bimbingan tambahan"
    3.  **Instruksi Khusus untuk Bagian A (Identitas dan Konteks):** JANGAN mengulangi data institusional dan informasi umum RPP (seperti Nama Sekolah, Kelas, Mata Pelajaran) yang sudah disediakan dalam input. Fokuskan isi bagian ini HANYA pada analisis konteks yang relevan seperti karakteristik umum satuan pendidikan atau lingkungan belajar siswa.
    4.  **Instruksi Khusus untuk KKTP (Bagian B):** Untuk bagian \`B_capaianTujuanPembelajaran\`, pecah Capaian Pembelajaran yang diberikan menjadi beberapa 'tujuan' pembelajaran yang spesifik. Untuk setiap tujuan, buatlah 'kriteria' ketercapaian yang jelas dan terukur. Gunakan Nilai Minimal Ketercapaian (${formData.kktp || '75'}) sebagai acuan untuk kelulusan siswa dalam kesimpulan asesmen.
    5.  **Kualitas & Bahasa:** Isi setiap bagian RPP dengan deskripsi yang konkret dan implementatif dalam Bahasa Indonesia yang baik dan benar.
    6.  **Konteks SLB/ABK:** Jika tipe satuan pendidikan adalah "SLB/ABK", berikan perhatian khusus pada bagian diferensiasi, akomodasi, dan data spesifik ABK yang diberikan.

    Berikut adalah data untuk penyusunan RPP:
    
    --- DATA RPP ---
    
    **1. Informasi Institusional:**
    - Nama Sekolah: ${formData.schoolName}
    - Nama Guru: ${formData.teacherName}
    - NIP: ${formData.nip || 'Tidak diisi'}
    - Kota: ${formData.city}
    - Tahun Pelajaran: ${formData.academicYear}

    **2. Informasi Umum RPP:**
    - Tipe Satuan Pendidikan: ${formData.educationUnitType}
    - Kelas: ${formData.class}
    - Fase: ${formData.phase}
    - Semester: ${formData.semester}
    - Mata Pelajaran: ${formData.subject}
    - Topik/Tema: ${formData.topicTheme}
    - Alokasi Waktu: ${formData.timeAllocation}
    - Jumlah Pertemuan: ${formData.meetings}
    
    **3. Konteks Pembelajaran:**
    - Capaian Pembelajaran (CP) Ringkas: ${formData.learningOutcomes}
    - Nilai Minimal Ketercapaian (KKM): ${formData.kktp || '75'}
    - Konteks & Sumber Daya (Lingkungan, Teknologi, dll): ${formData.learningContext}
    - Sarana dan Prasarana di Kelas: ${formData.facilities}
    
    **4. Identifikasi Awal Siswa:**
    - Karakteristik Siswa: ${formData.studentCharacteristics}
    - Minat Belajar: ${formData.learningInterests}
    - Motivasi Belajar: ${formData.learningMotivation}
    - Prestasi Belajar: ${formData.learningAchievement}
    - Lingkungan Sekolah: ${formData.schoolEnvironment}
    
    **5. Kerangka Pembelajaran Mendalam:**
    - Dimensi Profil Lulusan yang Ditekankan: ${formData.graduateProfileDimensions.join(', ')}
    - Model/Strategi Pedagogis Utama: ${formData.pedagogyModel}
    `;

    if (formData.educationUnitType === 'SLB/ABK') {
        prompt += `
    **6. Data Khusus Siswa Berkebutuhan Khusus (ABK):**
    - Kategori Kebutuhan: ${formData.slbCategory}
    - Target Individual (IEP): ${formData.iepTargets}
    - Profil Sensorik & Kesehatan: ${formData.sensoryProfile}
    - Mode Komunikasi: ${formData.communicationMode}
    - Alat Bantu yang Digunakan: ${formData.assistiveTools}
    - Peran Pendamping/Terapis/Orang Tua: ${formData.assistantRole}
    `;
    }

    prompt += `
    --- AKHIR DATA ---
    
    Sekarang, berdasarkan data dan SEMUA instruksi di atas, hasilkan RPP dalam format JSON yang diminta.
    `;
    return prompt;
};

export const generateRpp = async (formData: RppFormData, apiKey: string): Promise<GeneratedRpp> => {
    if (!apiKey) {
      throw new Error("API Key tidak tersedia. Harap konfigurasikan di halaman Pengaturan.");
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const prompt = buildPrompt(formData);
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            },
        });
        
        const result = JSON.parse(response.text);
        return result as GeneratedRpp;

    } catch (error: any) {
        console.error("Error generating RPP with Gemini:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Gagal mem-parsing respons dari AI. Coba lagi.");
        }
        throw new Error(`Gagal menghasilkan RPP: ${error.message}`);
    }
};