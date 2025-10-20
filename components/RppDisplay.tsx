import React from 'react';
import type { GeneratedRpp, RppSectionItem, KktpItem, RppFormData } from '../types';
import Spinner from './Spinner';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface RppDisplayProps {
  rpp: GeneratedRpp | null;
  isLoading: boolean;
  error: string | null;
  formData: RppFormData;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  // Use 'marked' for robust markdown parsing and 'dompurify' for security.
  const rawHtml = marked.parse(content, { gfm: true, breaks: true });
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  // Refined prose-like styling with better spacing and contrast for list items and bold text.
  // This ensures complex nested lists are rendered clearly and aesthetically.
  return (
    <div
      className="text-gray-700 dark:text-gray-300 [&_p]:mb-2 last:[&_p]:mb-0 [&_strong]:font-semibold [&_strong]:text-gray-900 dark:[&_strong]:text-white [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol_ol]:list-[lower-alpha] [&_ol_ol_ol]:list-[lower-roman] [&_li]:mb-1.5 [&_li]:pl-1"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
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
                    <tr key={index} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 align-top">
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

const RppDisplay: React.FC<RppDisplayProps> = ({ rpp, isLoading, error, formData }) => {

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
      
      const identityData = [
          { label: 'Nama Sekolah', value: formData.schoolName },
          { label: 'Nama Guru', value: formData.teacherName },
          { label: 'NIP', value: formData.nip || '-' },
          { label: 'Kota', value: formData.city },
          { label: 'Mata Pelajaran', value: formData.subject },
          { label: 'Kelas/Semester', value: `${formData.class} / ${formData.semester}` },
          { label: 'Fase', value: formData.phase },
          { label: 'Topik/Tema', value: formData.topicTheme },
          { label: 'Tahun Pelajaran', value: formData.academicYear },
          { label: 'Alokasi Waktu', value: formData.timeAllocation },
      ];

      const identityTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: [3000, 6500],
          rows: identityData.map(item => new TableRow({
              children: [
                  new TableCell({ 
                      children: [new Paragraph({ children: [new TextRun({ text: item.label, bold: true })]})],
                      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  }),
                  new TableCell({ 
                      children: [new Paragraph(`: ${item.value}`)],
                      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  }),
              ]
          })),
      });

      const sections: (Paragraph | Table)[] = [
        new Paragraph({ text: "RENCANA PELAKSANAAN PEMBELAJARAN (RPP)", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
        identityTable
      ];

      Object.entries(rpp).forEach(([key, value]) => {
          if (!value || !Array.isArray(value) || value.length === 0) return;
          const title = SECTION_TITLES[key] || key;
          sections.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 150 } }));

          let table;
          if (key === 'B_capaianTujuanPembelajaran') {
              const kktpItems = value as KktpItem[];
              const kkmValue = parseInt(formData.kktp, 10);
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
        const margin = { top: 20, right: 15, bottom: 20, left: 15 };
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let finalY = 0;

        const formatPdfText = (text: string): string => {
            if (!text) return '';
            return text.split('\n')
                .map(line => {
                    let processedLine = line.replace(/\*\*/g, ''); 
                    if (processedLine.match(/^\s*\d+\.\s/)) { 
                        processedLine = '  ' + processedLine.trim();
                    }
                    return processedLine;
                })
                .join('\n');
        };

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text("RENCANA PELAKSANAAN PEMBELAJARAN (RPP)", pageWidth / 2, margin.top, { align: 'center' });

        const identityData = [
            ['Nama Sekolah', ':', formData.schoolName],
            ['Nama Guru', ':', formData.teacherName],
            ['NIP', ':', formData.nip || '-'],
            ['Kota', ':', formData.city],
            ['Mata Pelajaran', ':', formData.subject],
            ['Kelas/Semester', ':', `${formData.class} / ${formData.semester}`],
            ['Fase', ':', formData.phase],
            ['Topik/Tema', ':', formData.topicTheme],
            ['Tahun Pelajaran', ':', formData.academicYear],
            ['Alokasi Waktu', ':', formData.timeAllocation],
        ];

        autoTable(doc, {
            startY: margin.top + 10,
            body: identityData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 1, halign: 'left' },
            columnStyles: {
                0: { cellWidth: 40, fontStyle: 'bold' },
                1: { cellWidth: 5 },
                2: { cellWidth: 'auto' },
            },
        });

        finalY = (doc as any).lastAutoTable.finalY + 10;

        Object.entries(rpp).forEach(([key, value]) => {
            if (!value || !Array.isArray(value) || value.length === 0) return;
            
            const title = SECTION_TITLES[key] || key;
            const titleHeight = 12; // Estimated space for title and margin
            if (finalY + titleHeight > pageHeight - margin.bottom) {
                doc.addPage();
                finalY = margin.top;
            }
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(title, margin.left, finalY);
            const tableStartY = finalY + 4; 

            const head: any[] = [];
            const body: any[] = [];
            let columnStyles: { [key: string]: any } = {};
            
            if (key === 'B_capaianTujuanPembelajaran') {
                const kkmValue = parseInt(formData.kktp, 10);
                const tercapaiMin = !isNaN(kkmValue) && kkmValue > 0 ? kkmValue : 75;
                const hampirTercapaiMax = tercapaiMin - 1;
                const hampirTercapaiMin = Math.max(0, tercapaiMin - 15);
                const belumTercapaiMax = hampirTercapaiMin - 1;

                let skalaPenilaianText = `• Tercapai: ${tercapaiMin}-100`;
                if (hampirTercapaiMin <= hampirTercapaiMax) {
                    skalaPenilaianText += `\n• Hampir Tercapai: ${hampirTercapaiMin}-${hampirTercapaiMax}`;
                }
                if (belumTercapaiMax >= 0) {
                    skalaPenilaianText += `\n• Belum Tercapai: 0-${belumTercapaiMax}`;
                }
                
                head.push(['Tujuan Pembelajaran', 'Kriteria Ketercapaian', 'Skala Penilaian']);
                (value as KktpItem[]).forEach(item => {
                    body.push([formatPdfText(item.tujuan), formatPdfText(item.kriteria), skalaPenilaianText]);
                });
                columnStyles = { 0: { cellWidth: 60 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 45 } };
            } else if (typeof value[0] === 'string') {
                head.push(['Deskripsi']);
                (value as string[]).forEach(item => body.push([formatPdfText(item)]));
                 columnStyles = { 0: { cellWidth: 'auto' } };
            } else {
                head.push(['Konteks', 'Deskripsi']);
                (value as RppSectionItem[]).forEach(item => {
                    body.push([item.konteks, formatPdfText(item.deskripsi)]);
                });
                columnStyles = { 0: { cellWidth: 50 }, 1: { cellWidth: 'auto' } };
            }

            autoTable(doc, {
                startY: tableStartY,
                head: head,
                body: body,
                theme: 'grid',
                headStyles: { fillColor: '#e2e8f0', textColor: '#1e293b', fontStyle: 'bold', fontSize: 10 },
                styles: { cellPadding: 2, fontSize: 10, overflow: 'linebreak', valign: 'top' },
                columnStyles: columnStyles,
                margin: { left: margin.left, right: margin.right },
            });
            finalY = (doc as any).lastAutoTable.finalY;

            if (key === 'B_capaianTujuanPembelajaran') {
                const conclusionHeight = 15;
                 if (finalY + conclusionHeight > pageHeight - margin.bottom) {
                    doc.addPage();
                    finalY = margin.top;
                }
                const kkmValue = parseInt(formData.kktp, 10);
                const tercapaiMin = !isNaN(kkmValue) && kkmValue > 0 ? kkmValue : 75;
                const conclusionText = `Kesimpulan Ketercapaian: Siswa dianggap tuntas jika mencapai skor minimal ${tercapaiMin}. Siswa yang belum mencapai kriteria akan mendapatkan program remedial atau menjadi peserta tutor sebaya.`;
                
                autoTable(doc, {
                    startY: finalY + 2,
                    body: [[{ content: conclusionText, styles: { fillColor: '#f0fdfa', textColor: '#0f766e', fontSize: 9 } }]],
                    theme: 'plain',
                    margin: { left: margin.left, right: margin.right }
                });
                finalY = (doc as any).lastAutoTable.finalY;
            }
            
            finalY += 10;
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
                return <KktpDisplay key={key} items={value as KktpItem[]} kkm={formData.kktp} />;
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