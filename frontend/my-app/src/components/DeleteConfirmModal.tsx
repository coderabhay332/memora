import React from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({ 
  show, 
  onConfirm, 
  onCancel, 
  isDeleting 
}: DeleteConfirmModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Enhanced Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-in slide-in-from-bottom-4 zoom-in-95">
        {/* Gradient Border Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl opacity-20 blur"></div>
        
        {/* Main Modal Content */}
        <div className="relative bg-white rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Delete Note</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Are you absolutely sure?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                This will permanently delete your note and remove all of its content. 
                This action cannot be reversed.
              </p>
            </div>

            {/* Warning Box */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    This action is permanent
                  </h4>
                  <p className="text-sm text-red-700">
                    Once deleted, your note will be gone forever and cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 hover:from-red-600 hover:to-pink-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-h-[48px]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Forever</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}