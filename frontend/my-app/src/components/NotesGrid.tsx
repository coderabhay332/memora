import { ContentItem } from '../types';

interface NotesGridProps {
  notes: ContentItem[];
  onUpdateNote?: (id: string, newContent: string) => void;
}

import React, { useState } from 'react';

export default function NotesGrid({ notes, onUpdateNote }: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No notes found</h3>
        <p className="text-gray-500 mb-4">Try adjusting your search or create a new note</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Create New Note
        </button>
      </div>
    );
  }

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleNoteClick = (item: ContentItem) => {
    setEditingId(item._id);
    setEditValue(item.content);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  };

  const handleSave = (id: string) => {
    if (onUpdateNote) {
      onUpdateNote(id, editValue);
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((item) => (
        <div
          key={item._id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => editingId !== item._id && handleNoteClick(item)}
        >
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {editingId === item._id ? (
                  <>
                    <textarea
                      className="font-medium text-gray-800 mb-1 truncate w-full border rounded p-2"
                      value={editValue}
                      onChange={handleEditChange}
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        onClick={e => { e.stopPropagation(); handleSave(item._id); }}
                      >
                        Save
                      </button>
                      <button
                        className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-xs"
                        onClick={e => { e.stopPropagation(); handleCancel(); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <h3 className="font-medium text-gray-800 mb-1 truncate">{item.content}</h3>
                )}
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <div className="flex items-center text-xs text-gray-400 space-x-2">
                  <span>Created by You</span>
                  <span>•</span>
                  <span>Last edited 2h ago</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
            <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
              <span>More</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}