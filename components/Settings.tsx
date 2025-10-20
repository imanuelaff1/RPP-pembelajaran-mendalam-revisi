import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

interface SettingsProps {
  currentMode: 'default' | 'custom';
  currentKey: string;
  onSave: (mode: 'default' | 'custom', key: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentMode, currentKey, onSave }) => {
  const [mode, setMode] = useState<'default' | 'custom'>(currentMode);
  const [key, setKey] = useState(currentKey);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setMode(currentMode);
    setKey(currentKey);
  }, [currentMode, currentKey]);

  const handleSave = () => {
    setIsSaving(true);
    onSave(mode, key);
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Pengaturan berhasil disimpan!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 500);
  };
  
  const canSave = (mode === 'custom' && key) || mode === 'default';

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
          <p className="text-gray-600 dark:text-gray-400 mb-6">Kelola kunci API Anda untuk mengakses model AI.</p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="api-mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mode API
              </label>
              <select
                id="api-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'default' | 'custom')}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="default">Gunakan Kunci Bawaan</option>
                <option value="custom">Gunakan Kunci API Pribadi</option>
              </select>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg dark:bg-yellow-900/20 dark:border-yellow-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <span className="font-bold">Catatan:</span> Kunci bawaan adalah kunci bersama dan mungkin memiliki batasan. Untuk pengalaman terbaik, kami sangat merekomendasikan menggunakan kunci API Anda sendiri.
                  </p>
                </div>
              </div>
            </div>

            {mode === 'custom' && (
              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kunci API Gemini
                </label>
                <input
                  type="password"
                  id="api-key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Masukkan kunci API Anda di sini"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !canSave}
                    className="flex justify-center items-center gap-2 bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSaving ? <><Spinner/> Menyimpan...</> : 'Simpan Pengaturan API'}
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