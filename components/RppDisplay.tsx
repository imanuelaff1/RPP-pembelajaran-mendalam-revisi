import React from 'react';
import type { GeneratedRpp, RppSectionItem } from '../types';
import Spinner from './Spinner';

interface RppDisplayProps {
  rpp: GeneratedRpp | null;
  isLoading: boolean;
  error: string | null;
}

// A simple component to render the markdown-like format from Gemini
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const parts = content.split('\n').filter(part => part.trim() !== '');
  
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {parts.map((part, index) => {
        const boldMatch = part.match(/^\*\*(.*)\*\*$/);
        if (boldMatch) {
          return <strong key={index} className="block font-semibold text-gray-800">{boldMatch[1]}</strong>;
        }

        const listItemMatch = part.match(/^\d+\.\s(.*)$/);
        if (listItemMatch) {
          // This simple renderer doesn't group into <ul>/<ol>, it just indents list items.
          return <p key={index} className="ml-4">{part}</p>;
        }

        return <p key={index}>{part}</p>;
      })}
    </div>
  );
};

const RppSection: React.FC<{ title: string; items: RppSectionItem[] | string[] }> = ({ title, items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-lg font-bold text-teal-700 mb-3 border-b border-teal-200 pb-2">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => {
          if (typeof item === 'string') {
            return <p key={index} className="text-gray-700 ml-4">{`- ${item}`}</p>; // For M_daftarRujukanInternal
          }
          return (
            <div key={index} className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-semibold text-gray-800">{item.konteks}</h4>
              <SimpleMarkdownRenderer content={item.deskripsi} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SECTION_TITLES: Record<string, string> = {
    A_identitasKonteks: 'A. Identitas dan Konteks',
    B_capaianTujuanPembelajaran: 'B. Capaian dan Tujuan Pembelajaran',
    C_dimensiProfilLulusan: 'C. Keterkaitan dengan Dimensi Profil Lulusan',
    D_lintasDisiplinTopik: 'D. Keterkaitan Lintas Disiplin Ilmu dengan Topik',
    E_praktikPedagogisUtama: 'E. Praktik Pedagogis Utama yang Digunakan',
    F_lingkunganPembelajaran: 'F. Pengaturan Lingkungan Pembelajaran',
    G_pemanfaatanDigital: 'G. Pemanfaatan Teknologi Digital',
    H_kemitraanPembelajaran: 'H. Kemitraan dengan Orang Tua/Komunitas',
    I_langkahLangkahPembelajaran: 'I. Langkah-langkah Pembelajaran Detail per Pertemuan',
    J_asesmenInstrumen: 'J. Strategi dan Instrumen Asesmen',
    K_diferensiasiAkomodasi: 'K. Strategi Diferensiasi dan Akomodasi',
    L_tindakLanjutRefleksi: 'L. Kegiatan Tindak Lanjut dan Refleksi',
    M_daftarRujukanInternal: 'M. Daftar Rujukan dan Sumber Belajar',
};

const RppDisplay: React.FC<RppDisplayProps> = ({ rpp, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <Spinner />
          <p className="mt-4 text-lg font-semibold">Menghasilkan RPP...</p>
          <p className="mt-2 text-sm">Proses ini mungkin memakan waktu sejenak. Mohon tunggu.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-600 bg-red-50 p-6 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-lg font-bold">Terjadi Kesalahan</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      );
    }

    if (rpp) {
      return (
        <div>
          <h2 className="text-2xl font-bold text-teal-600 mb-6">Hasil RPP yang Dihasilkan</h2>
          {Object.entries(rpp).map(([key, value]) => (
            <RppSection key={key} title={SECTION_TITLES[key] || key} items={value} />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-4 text-lg font-semibold">Hasil RPP Akan Ditampilkan di Sini</p>
        <p className="mt-2 text-sm">Isi formulir di sebelah kiri dan klik "Hasilkan RPP" untuk memulai.</p>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg overflow-y-auto h-full">
      {renderContent()}
    </div>
  );
};

export default RppDisplay;
