import React, { useState, useCallback, useEffect } from 'react';
import RppForm from './components/RppForm';
import RppDisplay from './components/RppDisplay';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import { generateRpp } from './services/geminiService';
import type { RppFormData, GeneratedRpp, EducationUnitType, PedagogyModel, GraduateProfileDimension } from './types';
import { PEDAGOGY_MODELS } from './constants';

type View = 'rpp' | 'settings';

const App: React.FC = () => {
  const [formData, setFormData] = useState<RppFormData>({
    schoolName: '',
    teacherName: '',
    nip: '',
    city: '',
    academicYear: '',
    educationUnitType: 'Umum' as EducationUnitType,
    class: '',
    phase: '',
    semester: '',
    subject: '',
    topicTheme: '',
    learningOutcomes: '',
    kktp: '75',
    facilities: '',
    studentCharacteristics: '',
    learningInterests: '',
    learningMotivation: '',
    learningAchievement: '',
    schoolEnvironment: '',
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
  const [activeView, setActiveView] = useState<View>('rpp');
  
  const [apiKey, setApiKey] = useState<string>('');
  const [apiMode, setApiMode] = useState<'default' | 'custom'>('default');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // Effect for handling theme changes and persistence
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Effect for loading API settings from localStorage
  useEffect(() => {
      const savedMode = localStorage.getItem('apiMode') as 'default' | 'custom' || 'default';
      const savedKey = localStorage.getItem('apiKey') || '';
      setApiMode(savedMode);
      setApiKey(savedKey);
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
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

  const handleSaveSettings = useCallback((mode: 'default' | 'custom', key: string) => {
      setApiMode(mode);
      setApiKey(key);
      localStorage.setItem('apiMode', mode);
      localStorage.setItem('apiKey', key);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const keyToUse = apiMode === 'custom' ? apiKey : (process.env.API_KEY || '');
    if (!keyToUse) {
        setError('API Key tidak valid. Mohon periksa Pengaturan API Anda.');
        setActiveView('settings');
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedRpp(null);
    setActiveView('rpp');

    try {
      const result = await generateRpp(formData, keyToUse);
      setGeneratedRpp(result);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, apiMode, apiKey]);
  
  const isSubmitDisabled = isLoading;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 font-sans text-gray-800 dark:text-gray-200">
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        theme={theme}
        toggleTheme={handleToggleTheme} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'settings' ? (
           <Settings 
             currentMode={apiMode}
             currentKey={apiKey}
             onSave={handleSaveSettings}
           />
        ) : (
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
                        formData={formData}
                    />
                </main>
                <footer className="text-center p-4 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                    <p>&copy; 2024 EL-RPP. Ditenagai oleh Google Gemini.</p>
                </footer>
            </>
        )}
      </div>
    </div>
  );
};

export default App;