import React, { useState, useCallback } from 'react';
import RppForm from './components/RppForm';
import RppDisplay from './components/RppDisplay';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
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
  
  // FIX: Removed all state and logic related to API key management (activeView, apiMode, customApiKey, activeApiKey, useEffect, handleSaveSettings) to comply with the guideline of using a pre-configured environment variable for the API key.
  // This also resolves the `import.meta.env` errors.

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

  // FIX: Updated handleSubmit to remove API key handling logic. It now calls `generateRpp` without passing an API key.
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
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
  
  // FIX: Simplified submit button's disabled state logic as it no longer depends on an API key.
  const isSubmitDisabled = isLoading;

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* FIX: Sidebar no longer requires props as the settings view has been removed. */}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* FIX: Removed view-switching logic and inlined main content for simplicity. */}
        <>
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
        </>
      </div>
    </div>
  );
};

export default App;
