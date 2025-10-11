import React, { useState, useCallback, useEffect, useMemo } from 'react';
import RppForm from './components/RppForm';
import RppDisplay from './components/RppDisplay';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import { generateRpp } from './services/geminiService';
import type { RppFormData, GeneratedRpp, EducationUnitType, PedagogyModel, GraduateProfileDimension } from './types';
import { PEDAGOGY_MODELS, GRADUATE_PROFILE_DIMENSIONS } from './constants';


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'rpp' | 'settings'>('rpp');

  const [apiMode, setApiMode] = useState<'default' | 'custom'>('default');
  const [customApiKey, setCustomApiKey] = useState('');

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('apiSettings');
      if (savedSettings) {
        const { mode, key } = JSON.parse(savedSettings);
        if ((mode === 'default' || mode === 'custom') && typeof key === 'string') {
          setApiMode(mode);
          setCustomApiKey(key);
        }
      }
    } catch (e) {
      console.error("Gagal memuat pengaturan API dari localStorage", e);
      localStorage.removeItem('apiSettings');
    }
  }, []);

  const effectiveApiKey = useMemo(() => {
    if (apiMode === 'custom' && customApiKey) {
      return customApiKey;
    }
    return process.env.API_KEY || '';
  }, [apiMode, customApiKey]);

  const handleSaveSettings = (mode: 'default' | 'custom', key: string) => {
    try {
      localStorage.setItem('apiSettings', JSON.stringify({ mode, key }));
      setApiMode(mode);
      setCustomApiKey(key);
    } catch (e) {
      console.error("Gagal menyimpan pengaturan API ke localStorage", e);
    }
  };

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
    setIsLoading(true);
    setError(null);
    setGeneratedRpp(null);

    if (!effectiveApiKey) {
      setError("API Key tidak dikonfigurasi. Silakan atur di halaman Pengaturan.");
      setIsLoading(false);
      setActiveView('settings');
      return;
    }

    try {
      const result = await generateRpp(formData, effectiveApiKey);
      setGeneratedRpp(result);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, effectiveApiKey]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {activeView === 'rpp' ? (
          <>
            <Header />
            <main className="flex-grow container mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-2 lg:gap-8 min-h-0">
              <RppForm
                formData={formData}
                onFormChange={handleFormChange}
                onCheckboxChange={handleCheckboxChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
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