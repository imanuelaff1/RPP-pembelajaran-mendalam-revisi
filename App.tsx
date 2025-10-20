import React, { useState, useCallback } from 'react';
import RppForm from './components/RppForm';
import RppDisplay from './components/RppDisplay';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
// FIX: Removed unused Settings component import.
import { generateRpp } from './services/geminiService';
import type { RppFormData, GeneratedRpp, EducationUnitType, PedagogyModel, GraduateProfileDimension } from './types';
import { PEDAGOGY_MODELS } from './constants';

// FIX: Removed View type as it's no longer needed.

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
  
  // FIX: Removed state and logic for custom API key management and view switching to comply with Gemini API guidelines.
  // The API key is now handled exclusively by the geminiService, which also resolves the original TypeScript error.

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
    
    // FIX: API key validation is now handled within geminiService.
    
    setIsLoading(true);
    setError(null);
    setGeneratedRpp(null);

    try {
      // FIX: Call generateRpp without passing an API key.
      const result = await generateRpp(formData);
      setGeneratedRpp(result);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);
  
  // FIX: Simplified the disabled condition as API key is no longer managed in the UI.
  const isSubmitDisabled = isLoading;

  // FIX: Removed renderContent function and inlined the main view to simplify the component.
  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* FIX: Sidebar no longer needs props for view management. */}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
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
