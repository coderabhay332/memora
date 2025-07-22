import React from 'react';
import { Loader2, X, FileText } from 'lucide-react';

interface CreateNoteModalProps {
  show: boolean;
  newContent: string;
  isCreating: boolean;
  createError: boolean;
  onContentChange: (value: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  show,
  newContent,
  isCreating,
  createError,
  onContentChange,
  onCancel,
  onCreate,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />
      
      {/* Modal container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 animate-in slide-in-from-bottom-4 zoom-in-95">
        {/* Gradient border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 blur"></div>
        
        {/* Main modal content */}
        <div className="relative bg-white rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Create New Note
                </h2>
                <p className="text-sm text-gray-500">Capture your thoughts and ideas</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
              disabled={isCreating}
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="relative">
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl p-4 pr-12 resize-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none placeholder-gray-400 text-gray-700"
                rows={5}
                placeholder="What's on your mind? Start typing your note here..."
                value={newContent}
                onChange={e => onContentChange(e.target.value)}
                autoFocus
                disabled={isCreating}
              />
              {/* Character indicator */}
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded-md">
                {newContent.length} chars
              </div>
            </div>

            {/* Error message with enhanced styling */}
            {createError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 text-sm font-medium">
                    Unable to create note. Please try again.
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                onClick={onCancel}
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 min-w-[120px] justify-center"
                onClick={onCreate}
                disabled={isCreating || !newContent.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Note</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNoteModal;