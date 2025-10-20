import React from 'react';

const RppIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col space-y-4 flex-shrink-0">
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold tracking-wider">EL-RPP</h2>
      </div>
      <nav className="flex flex-col space-y-2">
        {/* Replaced NavItem with a simple div since it's the only, non-interactive item */}
        <div
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-teal-500 text-white"
          aria-current="page"
        >
          <RppIcon />
          <span className="font-medium">RPP Generation</span>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;