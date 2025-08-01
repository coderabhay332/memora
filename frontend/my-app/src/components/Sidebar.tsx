import React, { useState } from 'react';
import { Search, Plus, FileText, Folder, Tag, Clock, TrendingUp, Star, Settings, LogOut, Bell, ChevronDown, Sparkles } from 'lucide-react';

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
  const [showLibraryDropdown, setShowLibraryDropdown] = useState(false);

  const recentNotes = contentData.slice(0, 5);
  const totalNotes = contentData.length;

  return (
    <div className="w-80 bg-white/90 backdrop-blur-xl border-r border-white/60 flex flex-col shadow-xl">
      {/* Enhanced Header */}
      <div className="p-8 border-b border-white/40">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 group">
              <span className="text-white text-xl font-bold">M</span>
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl group-hover:from-white/40 transition-all duration-300"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              memora
            </span>
            <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Smart Knowledge Base</span>
            </span>
          </div>
        </div>

        {/* Enhanced User Profile */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-white/60">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/50">
                <span className="text-white text-lg font-semibold">
                  {userData?.data.name?.charAt(0) || userData?.data.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-3 border-white shadow-sm">
                <div className="w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{userData?.data.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{userData?.data.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 font-medium">Online</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <span className="text-xs text-slate-400">{totalNotes} notes</span>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-xl transition-all duration-200">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="p-6 border-b border-white/40">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
          </div>
          <input
            type="text"
            placeholder="Search your universe..."
            className="w-full pl-12 pr-4 py-4 text-sm bg-white/70 border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all duration-200 shadow-sm hover:shadow-md placeholder-slate-400 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <kbd className="px-2 py-1 text-xs text-slate-400 bg-slate-100 rounded border">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="p-6 border-b border-white/40">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
          <TrendingUp className="w-3 h-3 mr-2" />
          Content Filter
        </h3>
        <div className="flex space-x-1 bg-gradient-to-r from-slate-100/70 to-slate-50/70 p-2 rounded-2xl backdrop-blur-sm border border-white/40">
          <button
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/60 scale-105 border border-white/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            onClick={() => onTabChange('all')}
          >
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>All</span>
            </div>
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
              activeTab === 'recent'
                ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/60 scale-105 border border-white/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            onClick={() => onTabChange('recent')}
          >
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Recent</span>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
          <Sparkles className="w-3 h-3 mr-2" />
          Quick Actions
        </h3>
        
        <button 
          onClick={onCreateNote}
          className="w-full group flex items-center space-x-4 px-6 py-4 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transform-gpu"
        >
          <div className="p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-12">
            <Plus className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold">Create New Note</div>
            <div className="text-xs text-white/70">Capture your thoughts</div>
          </div>
          <div className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>

        {/* Additional Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group border border-blue-200/50">
            <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Folder className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-700">Collections</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl transition-all duration-200 group border border-emerald-200/50">
            <div className="p-2 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-emerald-700">Tags</span>
          </button>
        </div>
      </div>

      {/* Enhanced Recent Notes */}
      <div className="px-6 pb-6 flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
            <Clock className="w-3 h-3 mr-2" />
            Recent Notes
          </h3>
          <button className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-2 overflow-y-auto max-h-64">
          {recentNotes.map((item, index) => (
            <div
              key={item._id}
              className="group p-3 bg-white/60 hover:bg-white/80 rounded-xl transition-all duration-200 border border-white/40 hover:border-indigo-200/60 hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center group-hover:from-indigo-100 group-hover:to-purple-100 transition-all duration-200">
                    <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-900">
                    {item.content.substring(0, 40)}
                    {item.content.length > 40 ? '...' : ''}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-slate-300 rounded-full group-hover:bg-indigo-400 transition-colors duration-200"></div>
                </div>
              </div>
            </div>
          ))}
          
          {recentNotes.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">No notes yet</p>
              <p className="text-xs text-slate-400 mt-1">Create your first note to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="p-6 border-t border-white/40 bg-gradient-to-r from-slate-50/50 to-white/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-xl transition-all duration-200">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-xl transition-all duration-200">
              <Star className="w-4 h-4" />
            </button>
          </div>
          <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group">
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse"></div>
          <span className="font-medium">Powered by Memora AI</span>
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}