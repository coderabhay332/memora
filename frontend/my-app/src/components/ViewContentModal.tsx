import React, { useEffect, useState } from 'react';
import { ContentItem } from '../types';
import { X, Edit3, Save, Loader2 } from 'lucide-react';

interface ViewContentModalProps {
  show: boolean;
  item: ContentItem | null;
  error?: string | null;
  onClose: () => void;
  onSave: (id: string, content: string) => Promise<void>;
  isSaving?: boolean;
}

const ViewContentModal: React.FC<ViewContentModalProps> = ({
  show,
  item,
  error,
  onClose,
  onSave,
  isSaving = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setDraft(item.content);
      setIsEditing(false);
      setSaveError(null);
    }
  }, [item]);

  if (!show) {
    return null;
  }

  if (!item) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-3xl aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {error ? 'Error' : 'Loading Content'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              {error ? (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Not Found</h3>
                  <p className="text-sm text-gray-600 mb-4">{error}</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Loading content...</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!item) return;
    setIsSubmitting(true);
    setSaveError(null);
    try {
      await onSave(item._id, draft);
      setIsEditing(false);
    } catch (error) {
      setSaveError('Failed to save changes. Please try again.');
      console.error('ViewContentModal save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">View Content</h2>
            <p className="text-xs text-gray-500">Content ID: {item._id}</p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSubmitting || isSaving}
                className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {isSubmitting || isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSubmitting || isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsEditing(false);
                setDraft(item.content);
                onClose();
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 px-6 py-5 overflow-hidden">
          {saveError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {saveError}
            </div>
          )}
          {isEditing ? (
            <textarea
              className="w-full h-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Edit content..."
            />
          ) : (
            <div className="h-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap overflow-y-auto">
              {item.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewContentModal;


