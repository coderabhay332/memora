import React from 'react';
import { Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Create Note</h2>
        <textarea
          className="w-full border rounded p-2 mb-4"
          rows={4}
          placeholder="Enter note content..."
          value={newContent}
          onChange={e => onContentChange(e.target.value)}
          autoFocus
        />
        {createError && (
          <div className="text-red-500 text-sm mb-2">Error creating note. Please try again.</div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onCancel}
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={onCreate}
            disabled={isCreating || !newContent.trim()}
          >
            {isCreating ? 'Creating...' : 'Create'}
            {isCreating && <Loader2 className="ml-2 animate-spin" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNoteModal;
