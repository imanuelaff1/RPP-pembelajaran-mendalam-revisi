import React from 'react';
import type { GeneratedRpp, RppSectionItem } from '../types';
import Spinner from './Spinner';

// Import libraries for download functionality
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';

interface RppDisplayProps {
  rpp: GeneratedRpp | null;
  isLoading: boolean;
  error: string | null;
}

// Improved renderer to handle bold and numbered lists cleanly into proper HTML
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const elements: React.ReactNode[] = [];
  let currentListItems: string[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ol key={`list-${elements.length}`} className="list-decimal pl-6 space-y-1 my-2">
          {currentListItems.map((item, idx) => <li key={idx}>{item}</li>)}
        </ol>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line) => {
    const isBold = /^\*\*(.*)\*\*$/.test(line);
    const cleanLine = line.replace(/\*\*/g, '');
    const listItemMatch = cleanLine.match(/^\d+\.\s(.*)$/);

    if (isBold) {
      flushList();
      elements.push(<p key={elements.length} className="font-semibold text-gray-800 mt-2 mb-1">{cleanLine}</p>);
    } else if (listItemMatch) {
      currentListItems.push(listItemMatch[1]);
    } else {
      flushList();
      elements.push(<p key={elements.length}>{cleanLine}</p>);
    }
  });

  flushList();

  return <div className="prose prose-sm max-w-none text-gray-700">{elements}</div>;
};


const RppSection: React.FC<{ title: string; items: RppSectionItem[] | string[] }> = ({ title, items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6 last:mb-0 break-words">
      <h3 className="text-lg font-bold text-teal-700 mb-3 border-b border-teal-200 pb-2">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => {
          if (typeof item === 'string') {
            return <p key={index} className="text-gray-700 ml-4">{`- ${item}`}</p>;
          }
          return (
            <div key={index} className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-semibold text-gray-800">{item.konteks}</h4>
              <MarkdownRenderer content={item.deskripsi} />
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

  const handleDownloadDocx = () => {
    if (!rpp) return;
  
    const formatDeskripsiForDocx = (deskripsi: string) => {
        const paragraphs: Paragraph[] = [];
        const lines = deskripsi.split('\n').filter(line => line.trim() !== '');

        lines.forEach(line => {
            const isBold = /^\*\*(.*)\*\*$/.test(line);
            const cleanLine = line.replace(/\*\*/g, '');
            const listItemMatch = cleanLine.match(/^\d+\.\s(.*)$/);

            if (listItemMatch) {
                paragraphs.push(new Paragraph({
                    text: listItemMatch[1],
                    numbering: { reference: "default-numbering", level: 0 },
                    style: "ListParagraph",
                }));
            } else {
                paragraphs.push(new Paragraph({
                    children: [new TextRun({ text: cleanLine, bold: isBold })],
                    spacing: { after: 100 },
                }));
            }
        });
        return paragraphs;
    };

    const children = Object.entries(rpp).flatMap(([key, value]) => {
      const sectionContent: Paragraph[] = [
        new Paragraph({ text: SECTION_TITLES[key] || key, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
      ];
      
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'string') {
             sectionContent.push(new Paragraph({ text: item, bullet: { level: 0 } }));
          } else {
            sectionContent.push(new Paragraph({
              children: [new TextRun({ text: item.konteks, bold: true })],
              spacing: { after: 100 },
            }));
            sectionContent.push(...formatDeskripsiForDocx(item.deskripsi));
            sectionContent.push(new Paragraph({ text: "" })); // Spacer
          }
        });
      }
      return sectionContent;
    });

    const doc = new Document({
      creator: "EL-RPP",
      title: "Rencana Pelaksanaan Pembelajaran",
      styles: {
          paragraphStyles: [{
              id: "ListParagraph",
              name: "List Paragraph",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: { size: 22 }, // 11pt font size
          }]
      },
      numbering: {
          config: [{
              reference: "default-numbering",
              levels: [{
                  level: 0,
                  format: "decimal",
                  text: "%1.",
                  alignment: AlignmentType.START,
                  style: { paragraph: { indent: { left: 720, hanging: 360 } } },
              }],
          }],
      },
      sections: [{ children }],
    });
  
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "RPP_Generated.docx");
    });
  };

  const handleDownloadPdf = () => {
    if (!rpp) return;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;

    const checkPageBreak = (heightNeeded: number) => {
        if (y + heightNeeded > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }
    };

    Object.entries(rpp).forEach(([key, value]) => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(SECTION_TITLES[key] || key, margin, y);
        y += 10;
        if (Array.isArray(value)) {
            value.forEach(item => {
                const isStringItem = typeof item === 'string';
                const itemKonteks = isStringItem ? `- ${item}` : item.konteks;
                const deskripsi = isStringItem ? '' : item.deskripsi;

                checkPageBreak(8);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text(itemKonteks, margin, y);
                y += 6;

                if (deskripsi) {
                    const lines = deskripsi.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        const isBold = /^\*\*(.*)\*\*$/.test(line);
                        const cleanLine = line.replace(/\*\*/g, '');
                        const indent = cleanLine.match(/^\d+\.\s/) ? 5 : 0;
                        const textToRender = cleanLine.replace(/^\d+\.\s/, '');
                        
                        const splitText = doc.splitTextToSize(textToRender, pageWidth - margin * 2 - indent);
                        checkPageBreak(splitText.length * 5);
                        
                        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                        doc.setFontSize(10);
                        doc.text(splitText, margin + indent, y);
                        y += splitText.length * 5;
                    });
                }
                y += 4;
            });
        }
    });
    doc.save('RPP_Generated.pdf');
  };

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
           <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-teal-600">Hasil RPP yang Dihasilkan</h2>
              <div className="flex space-x-2 flex-shrink-0">
                  <button onClick={handleDownloadPdf} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200">Download PDF</button>
                  <button onClick={handleDownloadDocx} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200">Download DOCX</button>
              </div>
          </div>
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