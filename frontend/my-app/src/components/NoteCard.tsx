import React from 'react';
import { ContentItem } from '../types';

interface NoteCardProps {
  item: ContentItem;
  isEditing: boolean;
  editContent: string;
  isUpdating: boolean;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onSave: (id: string, content: string) => void;
  onCancel: () => void;
  onEditContentChange: (content: string) => void;
}

export default function NoteCard({
  item,
  isEditing,
  editContent,
  isUpdating,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditContentChange,
}: NoteCardProps) {
  return (
    <div
      key={item._id}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="mb-2">
                <textarea
                  value={editContent}
                  onChange={(e) => onEditContentChange(e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Edit your note..."
                  autoFocus
                />
              </div>
            ) : (
              <div className="mb-2">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                  {item.content}
                </p>
              </div>
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
          <button 
            className="p-1 text-blue-400 hover:text-blue-600 rounded-full transition-colors"
            onClick={() => onEdit(item._id, item.content)}
            disabled={isUpdating}
            title="Edit note"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            className="p-1 text-red-400 hover:text-red-600 rounded-full transition-colors"
            onClick={() => onDelete(item._id)}
            disabled={false}
            title="Delete note"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button 
                className="text-xs text-green-600 hover:text-green-700 px-2 py-1 rounded transition-colors"
                onClick={() => onSave(item._id, editContent)}
                disabled={isUpdating}
              >
                Save
              </button>
              <button 
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors"
                onClick={onCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
              <span>More</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
