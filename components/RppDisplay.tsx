import React from 'react';
import type { GeneratedRpp, RppSectionItem, KktpItem } from '../types';
import Spinner from './Spinner';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RppDisplayProps {
  rpp: GeneratedRpp | null;
  isLoading: boolean;
  error: string | null;
  kkm: string;
}

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
      elements.push(<p key={elements.length} className="font-semibold text-gray-800 dark:text-gray-200 mt-2 mb-1">{cleanLine}</p>);
    } else if (listItemMatch) {
      currentListItems.push(listItemMatch[1]);
    } else {
      flushList();
      elements.push(<p key={elements.length}>{cleanLine}</p>);
    }
  });

  flushList();

  return <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">{elements}</div>;
};

const KktpDisplay: React.FC<{ items: KktpItem[]; kkm: string }> = ({ items, kkm }) => {
  const kkmValue = parseInt(kkm, 10);
  const tercapaiMin = !isNaN(kkmValue) && kkmValue > 0 ? kkmValue : 75;
  const hampirTercapaiMax = tercapaiMin - 1;
  const hampirTercapaiMin = Math.max(0, tercapaiMin - 10);
  const belumTercapaiMax = hampirTercapaiMin - 1;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400 mb-3 border-b border-teal-200 dark:border-teal-700 pb-2">B. Capaian dan Tujuan Pembelajaran (KKTP)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border-collapse">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-slate-700 dark:text-gray-300">
            <tr>
              <th scope="col" className="px-4 py-3 border border-gray-200 dark:border-slate-600">Tujuan Pembelajaran</th>
              <th scope="col" className="px-4 py-3 border border-gray-200 dark:border-slate-600">Kriteria Ketercapaian</th>
              <th scope="col" className="px-4 py-3 border border-gray-200 dark:border-slate-600">Skala Penilaian</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-4 py-3 border border-gray-200 dark:border-slate-600 font-medium text-gray-900 dark:text-white">{item.tujuan}</td>
                <td className="px-4 py-3 border border-gray-200 dark:border-slate-600">{item.kriteria}</td>
                <td className="px-4 py-3 border border-gray-200 dark:border-slate-600">
                  <ul className="list-disc pl-5">
                    <li><span className="font-semibold">Tercapai:</span> {tercapaiMin}-100</li>
                    {hampirTercapaiMin <= hampirTercapaiMax && (
                       <li><span className="font-semibold">Hampir Tercapai:</span> {hampirTercapaiMin}-{hampirTercapaiMax}</li>
                    )}
                    { belumTercapaiMax >= 0 && <li><span className="font-semibold">Belum Tercapai:</span> 0-{belumTercapaiMax}</li> }
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <div className="mt-4 p-4 bg-teal-50 border-l-4 border-teal-500 dark:bg-slate-700 dark:border-teal-400">
          <p className="text-sm text-teal-800 dark:text-teal-200"><span className="font-bold">Kesimpulan Ketercapaian:</span> Siswa dianggap tuntas jika mencapai skor minimal {tercapaiMin}. Siswa yang belum mencapai kriteria akan mendapatkan program remedial atau menjadi peserta tutor sebaya.</p>
      </div>
    </div>
  );
}
  
const RppSection: React.FC<{ title: string; items: RppSectionItem[] | string[] }> = ({ title, items }) => {
  if (!items || items.length === 0) return null;
  const isStringArray = typeof items[0] === 'string';

  return (
    <div className="mb-6 break-inside-avoid">
      <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400 mb-3 border-b border-teal-200 dark:border-teal-700 pb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border-collapse">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-slate-700 dark:text-gray-300">
                <tr>
                    {!isStringArray && <th scope="col" className="px-4 py-3 border border-gray-200 dark:border-slate-600 w-1/3">Konteks</th>}
                    <th scope="col" className="px-4 py-3 border border-gray-200 dark:border-slate-600">{isStringArray ? "Deskripsi" : "Deskripsi"}</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, index) => (
                    <tr key={index} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700">
                        {typeof item === 'string' ? (
                            <td className="px-4 py-3 border border-gray-200 dark:border-slate-600" colSpan={isStringArray ? undefined : 2}>{item}</td>
                        ) : (
                            <>
                                <td className="px-4 py-3 border border-gray-200 dark:border-slate-600 font-medium text-gray-900 dark:text-white">{item.konteks}</td>
                                <td className="px-4 py-3 border border-gray-200 dark:border-slate-600"><MarkdownRenderer content={item.deskripsi} /></td>
                            </>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
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

const RppDisplay: React.FC<RppDisplayProps> = ({ rpp, isLoading, error, kkm }) => {

  const parseDescriptionToParagraphs = (desc: string): Paragraph[] => {
      if (!desc) return [new Paragraph("")];
      const paragraphs: Paragraph[] = [];
      const lines = desc.split('\n').filter(line => line.trim() !== '');

      lines.forEach(line => {
          if (line.startsWith('**') && line.endsWith('**')) {
              paragraphs.push(new Paragraph({
                  children: [new TextRun({ text: line.substring(2, line.length - 2), bold: true })],
                  spacing: { before: 100 }
              }));
          } else if (line.match(/^\d+\.\s/)) {
              paragraphs.push(new Paragraph({
                  text: line.replace(/^\d+\.\s/, ''),
                  numbering: { reference: "default-numbering", level: 0 },
              }));
          } else {
              paragraphs.push(new Paragraph(line));
          }
      });
      return paragraphs.length > 0 ? paragraphs : [new Paragraph("")];
  };

  const handleDownloadDocx = () => {
      if (!rpp) return;
      const sections: (Paragraph | Table)[] = [];

      sections.push(new Paragraph({ text: "Rencana Pelaksanaan Pembelajaran (RPP)", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));

      Object.entries(rpp).forEach(([key, value]) => {
          if (!value || !Array.isArray(value) || value.length === 0) return;
          const title = SECTION_TITLES[key] || key;
          sections.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } }));

          let table;
          if (key === 'B_capaianTujuanPembelajaran') {
              const kktpItems = value as KktpItem[];
              const kkmValue = parseInt(kkm, 10);
              const tercapaiMin = !isNaN(kkmValue) && kkmValue > 0 ? kkmValue : 75;
              const hampirTercapaiMax = tercapaiMin - 1;
              const hampirTercapaiMin = Math.max(0, tercapaiMin - 10);
              const belumTercapaiMax = hampirTercapaiMin - 1;

              let skalaPenilaianText = `Tercapai: ${tercapaiMin}-100`;
              if (hampirTercapaiMin <= hampirTercapaiMax) {
                skalaPenilaianText += `\nHampir Tercapai: ${hampirTercapaiMin}-${hampirTercapaiMax}`;
              }
              if (belumTercapaiMax >= 0) {
                skalaPenilaianText += `\nBelum Tercapai: 0-${belumTercapaiMax}`;
              }

              table = new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                      new TableRow({
                          children: [
                              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tujuan Pembelajaran", bold: true })] })] }),
                              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Kriteria Ketercapaian", bold: true })] })] }),
                              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Skala Penilaian", bold: true })] })] }),
                          ],
                          tableHeader: true,
                      }),
                      ...kktpItems.map(item => new TableRow({
                          children: [
                              new TableCell({ children: [new Paragraph(item.tujuan)] }),
                              new TableCell({ children: [new Paragraph(item.kriteria)] }),
                              new TableCell({ children: skalaPenilaianText.split('\n').map(t => new Paragraph(t)) }),
                          ]
                      }))
                  ]
              });
              sections.push(table);
              sections.push(new Paragraph({ text: `Kesimpulan Ketercapaian: Siswa dianggap tuntas jika mencapai skor minimal ${tercapaiMin}. Siswa yang belum mencapai kriteria akan mendapatkan program remedial atau menjadi peserta tutor sebaya.`, spacing: { before: 100 } }));

          } else if (typeof value[0] === 'string') {
              table = new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                      new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Deskripsi", bold: true })] })] })], tableHeader: true }),
                      ...(value as string[]).map(item => new TableRow({ children: [new TableCell({ children: [new Paragraph(item)] })] }))
                  ]
              });
              sections.push(table);
          } else {
              const rppItems = value as RppSectionItem[];
              table = new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  columnWidths: [3000, 6500],
                  rows: [
                      new TableRow({
                          children: [
                              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Konteks", bold: true })] })] }),
                              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Deskripsi", bold: true })] })] }),
                          ],
                          tableHeader: true,
                      }),
                      ...rppItems.map(item => new TableRow({
                          children: [
                              new TableCell({ children: [new Paragraph(item.konteks)] }),
                              new TableCell({ children: parseDescriptionToParagraphs(item.deskripsi) }),
                          ]
                      }))
                  ]
              });
              sections.push(table);
          }
      });

      const doc = new Document({
          numbering: { config: [{ reference: "default-numbering", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START }] }] },
          sections: [{ children: sections }],
      });

      Packer.toBlob(doc).then(blob => saveAs(blob, "RPP_Generated.docx"));
  };

  const handleDownloadPdf = () => {
    if (!rpp) return;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    doc.setFontSize(18);
    doc.text("Rencana Pelaksanaan Pembelajaran (RPP)", 14, 22);
    
    let finalY = 30;

    Object.entries(rpp).forEach(([key, value]) => {
      if (!value || !Array.isArray(value) || value.length === 0) return;

      const title = SECTION_TITLES[key] || key;
      const head: any[] = [];
      const body: any[] = [];
      let columnStyles = {};
      
      if (key === 'B_capaianTujuanPembelajaran') {
        const kkmValue = parseInt(kkm, 10);
        const tercapaiMin = !isNaN(kkmValue) && kkmValue > 0 ? kkmValue : 75;
        const hampirTercapaiMax = tercapaiMin - 1;
        const hampirTercapaiMin = Math.max(0, tercapaiMin - 10);
        const belumTercapaiMax = hampirTercapaiMin - 1;

        let skalaPenilaianText = `Tercapai: ${tercapaiMin}-100`;
        if (hampirTercapaiMin <= hampirTercapaiMax) {
          skalaPenilaianText += `\nHampir Tercapai: ${hampirTercapaiMin}-${hampirTercapaiMax}`;
        }
        if (belumTercapaiMax >= 0) {
          skalaPenilaianText += `\nBelum Tercapai: 0-${belumTercapaiMax}`;
        }
          
        head.push(['Tujuan Pembelajaran', 'Kriteria Ketercapaian', 'Skala Penilaian']);
        (value as KktpItem[]).forEach(item => {
           body.push([item.tujuan, item.kriteria, skalaPenilaianText]);
        });
        columnStyles = { 0: { cellWidth: 60 }, 1: { cellWidth: 70 }, 2: { cellWidth: 45 } };
      } else if (typeof value[0] === 'string') {
        head.push(['Deskripsi']);
        (value as string[]).forEach(item => body.push([item]));
      } else {
        head.push(['Konteks', 'Deskripsi']);
        (value as RppSectionItem[]).forEach(item => {
          const deskripsiText = item.deskripsi.replace(/\*\*/g, '').replace(/(\d+\.)/g, '\n$1');
          body.push([item.konteks, deskripsiText]);
        });
        columnStyles = { 0: { cellWidth: 50 }, 1: { cellWidth: 'auto' } };
      }

      autoTable(doc, {
        startY: finalY,
        head: [[{ content: title, styles: { fontStyle: 'bold', fontSize: 12, textColor: '#0d9488' } }]],
        theme: 'plain',
      });
      finalY = (doc as any).lastAutoTable.finalY;

      autoTable(doc, {
        startY: finalY,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: '#f1f5f9', textColor: '#1e293b', fontStyle: 'bold' },
        styles: { cellPadding: 2, fontSize: 9, overflow: 'linebreak' },
        columnStyles: columnStyles,
      });
      finalY = (doc as any).lastAutoTable.finalY + 5;

      if (key === 'B_capaianTujuanPembelajaran') {
        const kkmValue = parseInt(kkm, 10);
        const tercapaiMin = !isNaN(kkmValue) && kkmValue > 0 ? kkmValue : 75;
        autoTable(doc, {
            startY: finalY - 5,
            body: [[{ content: `Kesimpulan Ketercapaian: Siswa dianggap tuntas jika mencapai skor minimal ${tercapaiMin}. Siswa yang belum mencapai kriteria akan mendapatkan program remedial atau menjadi peserta tutor sebaya.`, styles: { fillColor: '#f0fdfa', textColor: '#0f766e', fontSize: 8 } }]],
            theme: 'plain'
        });
        finalY = (doc as any).lastAutoTable.finalY + 5;
      }
    });

    doc.save('RPP_Generated.pdf');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
          <Spinner />
          <p className="mt-4 text-lg font-semibold">Menghasilkan RPP...</p>
          <p className="mt-2 text-sm">Proses ini mungkin memakan waktu sejenak. Mohon tunggu.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-6 rounded-lg">
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
           <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400">Hasil RPP yang Dihasilkan</h2>
              <div className="flex space-x-2 flex-shrink-0">
                  <button onClick={handleDownloadPdf} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200">Download PDF</button>
                  <button onClick={handleDownloadDocx} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors duration-200">Download DOCX</button>
              </div>
          </div>
          {Object.entries(rpp).map(([key, value]) => {
            if (key === 'B_capaianTujuanPembelajaran') {
                return <KktpDisplay key={key} items={value as KktpItem[]} kkm={kkm} />;
            }
            return <RppSection key={key} title={SECTION_TITLES[key] || key} items={value as RppSectionItem[] | string[]} />
          })}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-4 text-lg font-semibold">Hasil RPP Akan Ditampilkan di Sini</p>
        <p className="mt-2 text-sm">Isi formulir di sebelah kiri dan klik "Hasilkan RPP" untuk memulai.</p>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg overflow-y-auto h-full">
      {renderContent()}
    </div>
  );
};

export default RppDisplay;