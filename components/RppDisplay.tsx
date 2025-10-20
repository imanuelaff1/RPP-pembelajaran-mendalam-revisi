
import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// FIX: Added NumberFormat to imports for use in docx generation.
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, Numbering, VerticalAlign, NumberFormat } from 'docx';
import saveAs from 'file-saver';
import type { GeneratedRpp, RppSectionItem } from '../types';
import Spinner from './Spinner';

interface RppDisplayProps {
  rpp: GeneratedRpp | null;
  isLoading: boolean;
  error: string | null;
}

const SECTION_TITLES: { [key in keyof Omit<GeneratedRpp, 'M_daftarRujukanInternal'>]: string } = {
    A_identitasKonteks: 'A. Identitas & Konteks',
    B_capaianTujuanPembelajaran: 'B. Capaian & Tujuan Pembelajaran',
    C_dimensiProfilLulusan: 'C. Dimensi Profil Lulusan',
    D_lintasDisiplinTopik: 'D. Lintas Disiplin & Topik',
    E_praktikPedagogisUtama: 'E. Praktik Pedagogis Utama',
    F_lingkunganPembelajaran: 'F. Lingkungan Pembelajaran',
    G_pemanfaatanDigital: 'G. Pemanfaatan Digital',
    H_kemitraanPembelajaran: 'H. Kemitraan Pembelajaran',
    I_langkahLangkahPembelajaran: 'I. Langkah-Langkah Pembelajaran',
    J_asesmenInstrumen: 'J. Asesmen & Instrumen',
    K_diferensiasiAkomodasi: 'K. Diferensiasi & Akomodasi',
    L_tindakLanjutRefleksi: 'L. Tindak Lanjut & Refleksi',
};

const renderMarkdown = (text: string) => {
    // FIX: Switched to parseSync to avoid promise return type which is incompatible with DOMPurify.sanitize and dangerouslySetInnerHTML.
    const rawMarkup = marked.parseSync(text, { breaks: true });
    const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: sanitizedMarkup };
};

const TableDisplay: React.FC<{ title: string; items: RppSectionItem[] }> = ({ title, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <section className="mb-8 break-inside-avoid">
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Konteks
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/3">
                Deskripsi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 align-top text-sm font-medium text-gray-900">{item.konteks}</td>
                <td className="px-6 py-4 align-top text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={renderMarkdown(item.deskripsi)} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const ListDisplay: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
    if (!items || items.length === 0) return null;
    return (
        <section className="mb-8 break-inside-avoid">
            <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        </section>
    );
};

const RppDisplay: React.FC<RppDisplayProps> = ({ rpp, isLoading, error }) => {

    const handleDownloadPdf = () => {
        if (!rpp) return;
        const doc = new jsPDF();
        let yPos = 15;
    
        doc.setFontSize(18);
        doc.text("Rencana Pelaksanaan Pembelajaran (RPP)", 105, yPos, { align: 'center' });
        yPos += 15;
    
        for (const [key, title] of Object.entries(SECTION_TITLES)) {
            const items = rpp[key as keyof typeof SECTION_TITLES];
            if (items && items.length > 0) {
                 autoTable(doc, {
                    head: [[{ content: title, colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#e9ecef', textColor: '#212529' } }]],
                    body: [], // Body will be added in didParseCell
                    startY: yPos,
                    theme: 'grid',
                    headStyles: { fontStyle: 'bold' },
                    columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 'auto' } },
                    didParseCell: (data) => {
                        if (data.section === 'head' && data.column.index === 0) {
                            data.cell.text = ['Konteks'];
                        }
                         if (data.section === 'head' && data.column.index === 1) {
                            data.cell.text = ['Deskripsi'];
                        }
                    },
                    didDrawPage: (data) => {
                        yPos = data.cursor?.y ?? yPos;
                    }
                });
                
                // Add body rows separately to handle multiline text better
                items.forEach(item => {
                    autoTable(doc, {
                        body: [[item.konteks, item.deskripsi.replace(/\*\*/g, '')]],
                        startY: yPos,
                        theme: 'grid',
                        columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 'auto' } },
                        didDrawPage: (data) => {
                             yPos = data.cursor?.y ?? yPos;
                        }
                    })
                    yPos = (doc as any).lastAutoTable.finalY;
                });
                yPos += 10;
            }
        }
    
        const rujukanItems = rpp.M_daftarRujukanInternal;
        if (rujukanItems && rujukanItems.length > 0) {
            autoTable(doc, {
                head: [[{ content: 'M. Daftar Rujukan & Sumber Belajar', styles: { fontStyle: 'bold', fillColor: '#e9ecef', textColor: '#212529' } }]],
                body: rujukanItems.map(item => [item]),
                startY: yPos,
                theme: 'grid',
            });
        }
    
        doc.save('RPP_Generated.pdf');
    };

    const handleDownloadDocx = async () => {
        if (!rpp) return;
    
        const numberingOptions = {
            config: [{
                reference: "default-numbering",
                levels: [{
                    level: 0,
                    // FIX: Used NumberFormat.DECIMAL enum instead of string "decimal" to match docx library's expected type.
                    format: NumberFormat.DECIMAL,
                    text: "%1.",
                    alignment: AlignmentType.START,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                }],
            }],
        };
    
        const parseDescription = (desc: string): Paragraph[] => {
            const paragraphs: Paragraph[] = [];
            const lines = desc.split('\n').filter(line => line.trim() !== '');
    
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: trimmedLine.slice(2, -2), bold: true })],
                        spacing: { after: 100 },
                    }));
                } else if (/^\d+\.\s/.test(trimmedLine)) {
                    paragraphs.push(new Paragraph({
                        text: trimmedLine.replace(/^\d+\.\s/, ''),
                        numbering: { reference: "default-numbering", level: 0 },
                    }));
                } else {
                     paragraphs.push(new Paragraph(trimmedLine));
                }
            });
            return paragraphs;
        };
    
        const docChildren: (Paragraph | Table)[] = [
            new Paragraph({ text: "Rencana Pelaksanaan Pembelajaran (RPP)", heading: "Heading1", alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
        ];
    
        for (const [key, title] of Object.entries(SECTION_TITLES)) {
            const items = rpp[key as keyof typeof SECTION_TITLES];
            if (items && items.length > 0) {
                docChildren.push(new Paragraph({ text: title, heading: "Heading2", spacing: { before: 400, after: 200 } }));
                
                const headerRow = new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: 'Konteks', bold: true })] })],
                            width: { size: 30, type: WidthType.PERCENTAGE },
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: 'Deskripsi', bold: true })] })],
                            width: { size: 70, type: WidthType.PERCENTAGE },
                        }),
                    ],
                    tableHeader: true,
                });

                const dataRows = items.map(item => new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph(item.konteks)],
                            verticalAlign: VerticalAlign.TOP,
                        }),
                        new TableCell({
                            children: parseDescription(item.deskripsi),
                        }),
                    ],
                }));
                
                docChildren.push(new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE }}));
            }
        }
    
        const rujukanItems = rpp.M_daftarRujukanInternal;
        if (rujukanItems && rujukanItems.length > 0) {
            docChildren.push(new Paragraph({ text: 'M. Daftar Rujukan & Sumber Belajar', heading: "Heading2", spacing: { before: 400, after: 200 } }));
            rujukanItems.forEach(item => {
                docChildren.push(new Paragraph({ text: item, bullet: { level: 0 } }));
            });
        }
    
        const doc = new Document({
            numbering: numberingOptions,
            sections: [{ children: docChildren }],
        });
    
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "RPP_Generated.docx");
        });
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <Spinner />
                    <p className="mt-4 text-lg">AI sedang meracik RPP terbaik untuk Anda...</p>
                    <p className="text-sm">Ini mungkin memakan waktu beberapa saat.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-red-700 bg-red-50 p-8 rounded-lg border border-red-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold">Terjadi Kesalahan</h3>
                    <p className="mt-2 max-w-md">{error}</p>
                </div>
            );
        }

        if (!rpp) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <div className="text-5xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold">Hasil RPP Anda Akan Tampil di Sini</h3>
                    <p className="mt-2">Isi formulir di samping dan klik "Hasilkan RPP dengan AI" untuk memulai.</p>
                </div>
            );
        }
        
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-cyan-700">Hasil RPP Pembelajaran Mendalam</h2>
                    <div className="flex space-x-2">
                        <button onClick={handleDownloadPdf} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition">
                            Unduh PDF
                        </button>
                        <button onClick={handleDownloadDocx} className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                            Unduh DOCX
                        </button>
                    </div>
                </div>

                {Object.entries(SECTION_TITLES).map(([key, title]) => (
                    <TableDisplay key={key} title={title} items={rpp[key as keyof typeof SECTION_TITLES] as RppSectionItem[]} />
                ))}

                <ListDisplay title="M. Daftar Rujukan & Sumber Belajar" items={rpp.M_daftarRujukanInternal} />
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
            {renderContent()}
        </div>
    );
};

export default RppDisplay;
