// FIX: Removed unused imports for Sidebar and Settings, and related state management,
// to comply with the guideline of not having a UI for API key management.
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
  
  // FIX: Removed all state related to API key management (activeView, apiMode, customApiKey, activeApiKey)
  // The API key must be exclusively handled by process.env.API_KEY.
  const [isApiKeyAvailable, setIsApiKeyAvailable] = useState<boolean>(false);

  useEffect(() => {
    // FIX: Check for process.env.API_KEY as per the guidelines, which resolves the original TypeScript error.
    // This replaces the complex logic of handling default/custom keys from localStorage.
    // The original error regarding 'import.meta.env' is fixed by removing its usage.
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      setIsApiKeyAvailable(true);
      setError(null);
    } else {
      setIsApiKeyAvailable(false);
      // FIX: Provide a clear error message if the API key is not configured.
      setError('Kunci API tidak dikonfigurasi. Pastikan variabel lingkungan API_KEY sudah diatur.');
    }
  }, []);

  // FIX: handleSaveSettings is removed as settings UI is removed.

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
    
    // FIX: Simplified check. The API key is now managed by the service.
    if (!isApiKeyAvailable) {
        setError('Kunci API tidak tersedia. Pastikan variabel lingkungan API_KEY sudah diatur.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedRpp(null);

    try {
      // FIX: Call generateRpp without passing the API key.
      const result = await generateRpp(formData);
      setGeneratedRpp(result);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, isApiKeyAvailable]);
  
  // FIX: Submit button is disabled if API key is not available or if it is loading.
  const isSubmitDisabled = isLoading || !isApiKeyAvailable;

  return (
    // FIX: Simplified layout, removed Sidebar and conditional view rendering.
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
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
      </div>
    </div>
  );
};

export default App;
