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

const responseSchemaProperties = {
    A_identitasKonteks: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Identitas dan Konteks RPP" },
    B_capaianTujuanPembelajaran: { type: Type.ARRAY, items: rppSectionItemSchema, description: "Capaian dan Tujuan Pembelajaran" },
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
    3.  **Kualitas & Bahasa:** Isi setiap bagian RPP dengan deskripsi yang konkret dan implementatif dalam Bahasa Indonesia yang baik dan benar.
    4.  **Konteks SLB/ABK:** Jika tipe satuan pendidikan adalah "SLB/ABK", berikan perhatian khusus pada bagian diferensiasi, akomodasi, dan data spesifik ABK yang diberikan.

    Berikut adalah data untuk penyusunan RPP:
    
    --- DATA RPP ---
    
    **1. Informasi Umum:**
    - Tipe Satuan Pendidikan: ${formData.educationUnitType}
    - Fase/Kelas: ${formData.phaseClass}
    - Mata Pelajaran: ${formData.subject}
    - Topik/Tema: ${formData.topicTheme}
    - Alokasi Waktu: ${formData.timeAllocation}
    - Jumlah Pertemuan: ${formData.meetings}
    
    **2. Konteks Pembelajaran:**
    - Capaian Pembelajaran (CP) Ringkas: ${formData.learningOutcomes}
    - Profil Kelas: ${formData.classProfile}
    - Konteks & Sumber Daya (Lingkungan, Sarana, Teknologi): ${formData.learningContext}
    
    **3. Kerangka Pembelajaran Mendalam:**
    - Dimensi Profil Lulusan yang Ditekankan: ${formData.graduateProfileDimensions.join(', ')}
    - Model/Strategi Pedagogis Utama: ${formData.pedagogyModel}
    `;

    if (formData.educationUnitType === 'SLB/ABK') {
        prompt += `
    **4. Data Khusus Siswa Berkebutuhan Khusus (ABK):**
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

// FIX: Update function signature and implementation to adhere to API key guidelines.
export const generateRpp = async (formData: RppFormData): Promise<GeneratedRpp> => {
    // FIX: API key must be sourced exclusively from process.env.API_KEY.
    if (!process.env.API_KEY) {
      throw new Error("Kunci API tidak tersedia. Pastikan variabel lingkungan API_KEY sudah diatur.");
    }
    // FIX: Initialize GoogleGenAI with the required {apiKey: ...} object structure.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        
        // FIX: With responseMimeType and responseSchema, the output is a clean JSON string.
        // No need to manually clean markdown code fences.
        const result = JSON.parse(response.text);
        return result as GeneratedRpp;

    } catch (error: any) {
        console.error("Error generating RPP with Gemini:", error);
        // FIX: Check for SyntaxError for more reliable JSON parsing error detection.
        if (error instanceof SyntaxError) {
             throw new Error("Gagal mem-parsing respons dari AI. Coba lagi.");
        }
        throw new Error(`Gagal menghasilkan RPP: ${error.message}`);
    }
};
