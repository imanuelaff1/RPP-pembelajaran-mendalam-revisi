import React from 'react';
import type { RppFormData, EducationUnitType, PedagogyModel, GraduateProfileDimension } from '../types';
import { PEDAGOGY_MODELS, GRADUATE_PROFILE_DIMENSIONS } from '../constants';
import Spinner from './Spinner';

interface RppFormProps {
  formData: RppFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCheckboxChange: (dimension: GraduateProfileDimension) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-gray-700 border-b-2 border-teal-400 pb-2 mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required=true }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition" />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} rows={3} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition" />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition" />
);


const RppForm: React.FC<RppFormProps> = ({ formData, onFormChange, onCheckboxChange, onSubmit, isLoading }) => {
  const isSlb = formData.educationUnitType === 'SLB/ABK';

  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
      <h2 className="text-2xl font-bold text-teal-600 mb-6">Input Data RPP</h2>
      
      <FormSection title="1. Identitas & Konteks">
        <FormField label="Tipe Satuan Pendidikan">
          <Select name="educationUnitType" value={formData.educationUnitType} onChange={onFormChange}>
            <option value={'Umum' as EducationUnitType}>Umum</option>
            <option value={'SLB/ABK' as EducationUnitType}>SLB/ABK</option>
          </Select>
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Fase/Kelas"><Input type="text" name="phaseClass" value={formData.phaseClass} onChange={onFormChange} placeholder="Contoh: Fase D / Kelas 7" /></FormField>
            <FormField label="Mata Pelajaran"><Input type="text" name="subject" value={formData.subject} onChange={onFormChange} placeholder="Contoh: Ilmu Pengetahuan Alam" /></FormField>
        </div>
        <FormField label="Topik/Tema"><Input type="text" name="topicTheme" value={formData.topicTheme} onChange={onFormChange} placeholder="Contoh: Ekosistem dan Keseimbangannya" /></FormField>
        <FormField label="Capaian Pembelajaran (CP) Ringkas"><Textarea name="learningOutcomes" value={formData.learningOutcomes} onChange={onFormChange} placeholder="Contoh: Peserta didik dapat mendeskripsikan interaksi antar komponen biotik dan abiotik dalam suatu ekosistem." /></FormField>
        <FormField label="Profil Kelas"><Textarea name="classProfile" value={formData.classProfile} onChange={onFormChange} placeholder="Contoh: 28 siswa, mayoritas memiliki pemahaman dasar tentang makhluk hidup, beberapa siswa aktif secara kinestetik. Minat tinggi pada isu lingkungan." /></FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Alokasi Waktu"><Input type="text" name="timeAllocation" value={formData.timeAllocation} onChange={onFormChange} placeholder="Contoh: 4 Jam Pelajaran" /></FormField>
            <FormField label="Jumlah Pertemuan"><Input type="text" name="meetings" value={formData.meetings} onChange={onFormChange} placeholder="Contoh: 2" /></FormField>
        </div>
        <FormField label="Konteks & Sumber Daya"><Textarea name="learningContext" value={formData.learningContext} onChange={onFormChange} placeholder="Contoh: Sekolah memiliki akses ke taman/sungai kecil. Laboratorium IPA standar. Sebagian besar siswa memiliki smartphone. LMS sekolah menggunakan Google Classroom." /></FormField>
      </FormSection>

      <FormSection title="2. Kerangka Pembelajaran Mendalam">
        <FormField label="Dimensi Profil Lulusan (pilih ≥ 2)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {GRADUATE_PROFILE_DIMENSIONS.map(dim => (
              <label key={dim} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                <input
                  type="checkbox"
                  checked={formData.graduateProfileDimensions.includes(dim)}
                  onChange={() => onCheckboxChange(dim)}
                  className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm">{dim}</span>
              </label>
            ))}
          </div>
        </FormField>
         <FormField label="Model/Strategi Utama">
          <Select name="pedagogyModel" value={formData.pedagogyModel} onChange={onFormChange}>
            {PEDAGOGY_MODELS.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </Select>
        </FormField>
      </FormSection>

      {isSlb && (
        <FormSection title="3. Data Khusus SLB/ABK">
          <FormField label="Kategori Kebutuhan" required={isSlb}><Input type="text" name="slbCategory" value={formData.slbCategory} onChange={onFormChange} placeholder="Contoh: Autisme Spektrum Ringan" /></FormField>
          <FormField label="IEP/Target Individual" required={isSlb}><Textarea name="iepTargets" value={formData.iepTargets} onChange={onFormChange} placeholder="Contoh: Meningkatkan interaksi sosial selama kerja kelompok" /></FormField>
          <FormField label="Profil Sensorik & Kesehatan" required={isSlb}><Textarea name="sensoryProfile" value={formData.sensoryProfile} onChange={onFormChange} placeholder="Contoh: Sensitif terhadap suara keras" /></FormField>
          <FormField label="Mode Komunikasi" required={isSlb}><Input type="text" name="communicationMode" value={formData.communicationMode} onChange={onFormChange} placeholder="Contoh: Verbal dan menggunakan gambar" /></FormField>
          <FormField label="Alat Bantu" required={isSlb}><Textarea name="assistiveTools" value={formData.assistiveTools} onChange={onFormChange} placeholder="Contoh: Headphone peredam bising, tablet untuk komunikasi" /></FormField>
          <FormField label="Peran Pendamping/Terapis/Orang Tua" required={isSlb}><Textarea name="assistantRole" value={formData.assistantRole} onChange={onFormChange} placeholder="Contoh: Membantu siswa fokus pada tugas" /></FormField>
        </FormSection>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? <><Spinner /> Menghasilkan RPP...</> : '✨ Hasilkan RPP dengan AI'}
      </button>
    </form>
  );
};

export default RppForm;