import React, { useState, useCallback, useEffect } from 'react';
import RppForm from './components/RppForm';
import RppDisplay from './components/RppDisplay';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings'; // Import Settings component
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
  
  // Restore state for multi-view and API key management
  const [activeView, setActiveView] = useState<'rpp' | 'settings'>('rpp');
  const [apiMode, setApiMode] = useState<'default' | 'custom'>('default');
  const [customApiKey, setCustomApiKey] = useState<string>('');

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedMode = localStorage.getItem('apiMode') as 'default' | 'custom' | null;
    const savedKey = localStorage.getItem('customApiKey');
    if (savedMode) {
      setApiMode(savedMode);
    }
    if (savedKey) {
      setCustomApiKey(savedKey);
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

  // Handle saving settings from the Settings page
  const handleSaveSettings = useCallback((mode: 'default' | 'custom', key: string) => {
    setApiMode(mode);
    setCustomApiKey(key);
    localStorage.setItem('apiMode', mode);
    localStorage.setItem('customApiKey', key);
  }, []);

  // Update handleSubmit to use the selected API key
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine which API key to use
    // @ts-ignore - VITE_API_KEY is injected by the build tool
    const defaultApiKey = import.meta.env.VITE_API_KEY;
    const apiKey = apiMode === 'custom' ? customApiKey : defaultApiKey;

    if (!apiKey) {
      setError("Kunci API tidak dikonfigurasi. Harap atur di halaman Pengaturan atau konfigurasikan variabel lingkungan VITE_API_KEY.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedRpp(null);

    try {
      // Pass the selected API key to the service
      const result = await generateRpp(formData, apiKey);
      setGeneratedRpp(result);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, apiMode, customApiKey]);
  
  const isSubmitDisabled = isLoading;

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'rpp' ? (
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
        ) : (
            <Settings 
                currentMode={apiMode}
                currentKey={customApiKey}
                onSave={handleSaveSettings}
            />
        )}
      </div>
    </div>
  );
};

export default App;