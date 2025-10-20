import React from 'react';

// FIX: Removed View type as it's no longer needed for a static sidebar.

// FIX: Removed props from interface as sidebar is now static.
interface SidebarProps {}

const RppIcon: React.FC = () => (
  <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// FIX: Removed SettingsIcon as it is no longer used.

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick?: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive 
            ? 'bg-teal-500 text-white' 
            : 'hover:bg-slate-700 text-gray-300'
        }`}
        aria-current={isActive ? 'page' : undefined}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

// FIX: Removed activeView and setActiveView props. The sidebar is now static.
const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col space-y-4 flex-shrink-0">
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold tracking-wider">EL-RPP</h2>
      </div>
      <nav className="flex flex-col space-y-2">
         <NavItem 
            icon={<RppIcon />} 
            label="RPP Generation" 
            isActive={true}
        />
        {/* FIX: Removed Settings NavItem to comply with API key guidelines. */}
      </nav>
    </aside>
  );
};

export default Sidebar;
