import React from 'react';
import { RefreshCw, AlertCircle, FileText, Search, Plus, Sparkles, Coffee } from 'lucide-react';

interface LoadingStatesProps {
  onCreateNote: () => void;
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="flex flex-col items-center space-y-6 max-w-sm mx-auto text-center">
        {/* Enhanced Loading Animation */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-300 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-black rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-black animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
            Loading your workspace
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Preparing your personalized knowledge base...
          </p>
        </div>
        
        {/* Loading Steps */}
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
            <span>Initializing workspace</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <span>Loading your notes</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span>Setting up AI features</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-pink-50/50">
      <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 max-w-md mx-auto">
        {/* Error Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">!</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 leading-relaxed">
            We couldn't load your content. Please check your connection and try again.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
            <h4 className="text-sm font-semibold text-red-800 mb-2">What you can try:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Refresh the page</li>
              <li>• Clear your browser cache</li>
            </ul>
          </div>
          
          <button 
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function EmptyContentState({ onCreateNote }: LoadingStatesProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 max-w-lg mx-auto">
        {/* Welcome Illustration */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-black rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-gray-500/30">
            <FileText className="w-12 h-12 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
              Welcome to Memora!
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Your personal knowledge base is ready. Create your first note to begin capturing ideas and insights.
            </p>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <FileText className="w-6 h-6 text-black mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 text-sm">Smart Notes</h4>
              <p className="text-gray-700 text-xs mt-1">Organize thoughts effortlessly</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <Sparkles className="w-6 h-6 text-black mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 text-sm">AI Powered</h4>
              <p className="text-gray-700 text-xs mt-1">Get intelligent assistance</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <Search className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800 text-sm">Quick Search</h4>
              <p className="text-green-600 text-xs mt-1">Find anything instantly</p>
            </div>
          </div>
          
          <button 
            className="w-full px-8 py-4 bg-gradient-to-r from-black to-gray-800 text-white rounded-2xl font-bold hover:from-gray-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-3 text-lg"
            onClick={onCreateNote}
          >
            <Plus className="w-6 h-6" />
            <span>Create Your First Note</span>
          </button>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Coffee className="w-4 h-4" />
              <span>Get started in seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptySearchState({ onCreateNote }: LoadingStatesProps) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center bg-white/80 backdrop-blur-sm border border-white/60 rounded-3xl p-8 max-w-md mx-auto shadow-xl">
        {/* Search Illustration */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">0</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">No results found</h3>
          <p className="text-gray-600 leading-relaxed">
            We couldn't find any notes matching your search. Try adjusting your keywords or create a new note.
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Search tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Try different keywords</li>
              <li>• Check for typos</li>
              <li>• Use shorter search terms</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
              onClick={() => window.location.reload()}
            >
              Clear Search
            </button>
            <button 
              className="flex-1 px-4 py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl font-medium hover:from-gray-900 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              onClick={onCreateNote}
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}