import React from 'react';

interface ContentSidebarProps {
  userData: any;
  contentData: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateNote: () => void;
}

export default function ContentSidebar({
  userData,
  contentData,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onCreateNote,
}: ContentSidebarProps) {
  return (
    <div className="w-72 bg-gradient-to-b from-gray-50 to-white border-r border-slate-200/60 flex flex-col shadow-sm">
      {/* Header with enhanced logo */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
            <span className="text-white text-lg font-bold">M</span>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-xl tracking-tight">memora</span>
            <span className="text-xs text-slate-500 font-medium">Knowledge Base</span>
          </div>
        </div>
      </div>

      {/* Enhanced search with better styling */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
            <svg className="h-5 w-5 text-slate-400 group-focus-within:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search your notes..."
            className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-black transition-all duration-200 shadow-sm hover:shadow-md placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Enhanced user profile */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
              <span className="text-white text-lg font-semibold">
                {userData?.data.name?.charAt(0) || userData?.data.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-3 border-white shadow-sm animate-pulse"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{userData?.data.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{userData?.data.email}</p>
            <p className="text-xs text-emerald-500 font-medium mt-0.5">● Online</p>
          </div>
        </div>
      </div>

      {/* Enhanced navigation tabs */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex space-x-1 bg-slate-100/70 p-1.5 rounded-xl backdrop-blur-sm">
          <button
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50 scale-105'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            onClick={() => onTabChange('all')}
          >
            All Notes
          </button>
          <button
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'recent'
                ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50 scale-105'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            onClick={() => onTabChange('recent')}
          >
            Recent
          </button>
        </div>
      </div>

      {/* Enhanced quick actions */}
      <div className="p-6 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Quick Actions
        </h3>
        <button 
          onClick={onCreateNote}
          className="w-full group flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span>Create New Note</span>
          <div className="ml-auto opacity-70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Enhanced library section */}
      <div className="px-6 pb-6 flex-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          Library
        </h3>
        <div className="space-y-2">
          <button className="w-full group flex items-center space-x-4 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 rounded-xl transition-all duration-200 hover:shadow-sm">
            <div className="p-2 bg-gray-50 group-hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="flex-1 text-left">All Notes</span>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full"></span>
          </button>
          
          <button className="w-full group flex items-center space-x-4 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 rounded-xl transition-all duration-200 hover:shadow-sm">
            <div className="p-2 bg-gray-50 group-hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="flex-1 text-left">Collections</span>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">8</span>
          </button>
          
          <button className="w-full group flex items-center space-x-4 px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 rounded-xl transition-all duration-200 hover:shadow-sm">
            <div className="p-2 bg-emerald-50 group-hover:bg-emerald-100 rounded-lg transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <span className="flex-1 text-left">Tags</span>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">15</span>
          </button>
        </div>
      </div>

      {/* Footer with subtle branding */}
      <div className="p-6 border-t border-slate-200/60">
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
          <span>Powered by Memora</span>
          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}