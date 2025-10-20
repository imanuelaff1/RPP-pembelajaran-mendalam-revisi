import React from 'react';

type View = 'rpp' | 'settings';

const RppIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SunIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        disabled={!onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
            isActive 
            ? 'bg-teal-500 text-white' 
            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
        }`}
        aria-current={isActive ? 'page' : undefined}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, theme, toggleTheme }) => {
  return (
    <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col flex-shrink-0">
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold tracking-wider">EL-RPP</h2>
      </div>
      <nav className="flex flex-col space-y-2 flex-grow">
         <NavItem 
            icon={<RppIcon />} 
            label="RPP Generation" 
            isActive={activeView === 'rpp'} 
            onClick={() => setActiveView('rpp')} 
        />
        <NavItem 
            icon={<SettingsIcon />} 
            label="Pengaturan" 
            isActive={activeView === 'settings'} 
            onClick={() => setActiveView('settings')} 
        />
      </nav>
      <div className="mt-auto">
          <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left text-gray-300 hover:bg-slate-700 hover:text-white"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              <span className="font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;