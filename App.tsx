
import React, { useState, useCallback, useEffect } from 'react';
import RppForm from './components/RppForm';
import RppDisplay from './components/RppDisplay';
import Header from './components/Header';
import { generateRpp } from './services/geminiService';
import type { RppFormData, GeneratedRpp, EducationUnitType, PedagogyModel, GraduateProfileDimension } from './types';
import { PEDAGOGY_MODELS } from './constants';

const App: React.FC = () => {
  const [formData, setFormData] = useState<RppFormData>({
    educationUnitType: 'Umum' as EducationUnitType,
    phaseClass: '',
    subject: '',
    topicTheme: '',
    learningOutcomes: '',
    classProfile: '',
    graduateProfileDimensions: [],
    pedagogyModel: PEDAGOGY_MODELS[0] as PedagogyModel,
    learningContext: '',
    timeAllocation: '',
    meetings: '',
    slbCategory: '',
    iepTargets: '',
    sensoryProfile: '',
    communicationMode: '',
    assistiveTools: '',
    assistantRole: '',
  });

  const [generatedRpp, setGeneratedRpp] = useState<GeneratedRpp | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // FIX: Adhere to guidelines by exclusively using process.env.API_KEY.
  // Removed custom API key logic, settings page, and related state.
  useEffect(() => {
    if (!process.env.API_KEY) {
        setError("Kunci API tidak dikonfigurasi. Harap atur variabel lingkungan API_KEY.");
    }
  }, []);

  const handleFormChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCheckboxChange = useCallback((dimension: GraduateProfileDimension) => {
    setFormData(prev => {
      const newDimensions = prev.graduateProfileDimensions.includes(dimension)
        ? prev.graduateProfileDimensions.filter(d => d !== dimension)
        : [...prev.graduateProfileDimensions, dimension];
      return { ...prev, graduateProfileDimensions: newDimensions };
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!process.env.API_KEY) {
        setError('Kunci API tidak tersedia. Mohon konfigurasikan variabel lingkungan API_KEY.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedRpp(null);

    try {
      const result = await generateRpp(formData);
      setGeneratedRpp(result);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);
  
  const isSubmitDisabled = isLoading || !process.env.API_KEY;

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
        <Header />
        <main className="flex-grow container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-2 lg:gap-8 min-h-0">
          <RppForm
            formData={formData}
            onFormChange={handleFormChange}
            onCheckboxChange={handleCheckboxChange}
            onSubmit={handleSubmit}
            isLoading={isSubmitDisabled}
          />
          <RppDisplay
            rpp={generatedRpp}
            isLoading={isLoading}
            error={error}
          />
        </main>
        <footer className="text-center p-4 text-sm text-gray-500 flex-shrink-0">
          <p>&copy; 2024 EL-RPP. Ditenagai oleh Google Gemini.</p>
        </footer>
    </div>
  );
};

export default App;
