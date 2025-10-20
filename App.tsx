import React, { useState, useCallback, useEffect } from 'react';
import RppForm from './components/RppForm';
import RppDisplay from './components/RppDisplay';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { generateRpp } from './services/geminiService';
import type { RppFormData, GeneratedRpp, EducationUnitType, PedagogyModel, GraduateProfileDimension } from './types';
import { PEDAGOGY_MODELS, GRADUATE_PROFILE_DIMENSIONS } from './constants';


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
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
        setIsApiKeyMissing(true);
        setError("Kunci API tidak dikonfigurasi. Aplikasi ini memerlukan Kunci API untuk berfungsi. Silakan hubungi administrator.");
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
    if (isApiKeyMissing) return;

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
  }, [formData, isApiKeyMissing]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
          <>
            <Header />
            <main className="flex-grow container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-2 lg:gap-8 min-h-0">
              <RppForm
                formData={formData}
                onFormChange={handleFormChange}
                onCheckboxChange={handleCheckboxChange}
                onSubmit={handleSubmit}
                isLoading={isLoading || isApiKeyMissing}
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
          </>
      </div>
    </div>
  );
};

export default App;