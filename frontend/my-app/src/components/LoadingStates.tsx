import React from 'react';

interface LoadingStatesProps {
  onCreateNote: () => void;
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600 font-medium">Loading your content...</span>
      </div>
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6 bg-white rounded-xl shadow-sm max-w-md">
        <div className="text-red-500 mb-4 text-lg font-medium">Error loading content</div>
        <p className="text-gray-600 mb-4">We couldn't load your content. Please check your connection and try again.</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function EmptyContentState({ onCreateNote }: LoadingStatesProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6 bg-white rounded-xl shadow-sm max-w-md">
        <div className="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No content available</h3>
        <p className="text-gray-500 mb-4">Create your first note to get started</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors" 
          onClick={onCreateNote}
        >
          Create Note
        </button>
      </div>
    </div>
  );
}

export function EmptySearchState({ onCreateNote }: LoadingStatesProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">No notes found</h3>
      <p className="text-gray-500 mb-4">Try adjusting your search or create a new note</p>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" 
        onClick={onCreateNote}
      >
        Create New Note
      </button>
    </div>
  );
}
