import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

type ApiMode = 'default' | 'custom';

interface SettingsProps {
  currentKey: string;
  currentApiMode: ApiMode;
  onSave: (mode: ApiMode, key: string) => void;
  defaultKeyAvailable: boolean;
}

const Settings: React.FC<SettingsProps> = ({ currentKey, currentApiMode, onSave, defaultKeyAvailable }) => {
  const [key, setKey] = useState(currentKey);
  const [mode, setMode] = useState(currentApiMode);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setKey(currentKey);
    setMode(currentApiMode);
  }, [currentKey, currentApiMode]);

  const handleSave = () => {
    setIsSaving(true);
    onSave(mode, key);
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Pengaturan berhasil disimpan!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 500);
  };
  
  const canSave = mode === 'default' || (mode === 'custom' && key.trim() !== '');

  return (
    <div className="bg-gray-100 dark:bg-slate-900 h-full overflow-y-auto">
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto py-6 px-4 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Pengaturan</h1>
        </div>
      </header>
      <main className="container mx-auto p-4 lg:p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Pengaturan API</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Pilih metode autentikasi yang ingin Anda gunakan untuk mengakses Google Gemini.</p>
          
          <div className="space-y-6">

            <fieldset className="space-y-4">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Metode API Key</legend>
                <div className="flex items-center">
                    <input
                        id="api-mode-default"
                        name="api-mode"
                        type="radio"
                        checked={mode === 'default'}
                        onChange={() => setMode('default')}
                        disabled={!defaultKeyAvailable}
                        className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500 disabled:opacity-50"
                    />
                    <label htmlFor="api-mode-default" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50">
                        Gunakan Kunci Bawaan
                        {!defaultKeyAvailable && <span className="text-xs text-red-500"> (Tidak tersedia)</span>}
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                        id="api-mode-custom"
                        name="api-mode"
                        type="radio"
                        checked={mode === 'custom'}
                        onChange={() => setMode('custom')}
                        className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="api-mode-custom" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gunakan Kunci Pribadi
                    </label>
                </div>
            </fieldset>

            {mode === 'custom' && (
              <div>
                <label htmlFor="api-key-input" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Kunci API Gemini Pribadi <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="api-key-input"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Masukkan kunci API pribadi Anda"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
            )}
            
             <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg dark:bg-blue-900/20 dark:border-blue-500">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                        Jika menggunakan kunci pribadi, Anda dapat memperolehnya dari <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-600">Google AI Studio</a>. Kunci Anda disimpan aman di browser Anda dan tidak pernah dibagikan.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !canSave}
                    className="flex justify-center items-center gap-2 bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSaving ? <><Spinner/> Menyimpan...</> : 'Simpan Pengaturan'}
                </button>
                {saveMessage && <p className="text-sm text-green-600 dark:text-green-400">{saveMessage}</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;