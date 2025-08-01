import React, { useState } from 'react';
import { ContentItem } from '../types';
import { Edit3, Trash2, Save, X, MoreHorizontal, Calendar, User, Clock } from 'lucide-react';

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
  viewMode?: 'grid' | 'list';
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
  viewMode = 'grid',
}: NoteCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPreview = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`group bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-200/60 hover:-translate-y-1 ${
          isHovered ? 'shadow-lg shadow-blue-500/10 border-blue-200/60' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => onEditContentChange(e.target.value)}
                    className="w-full min-h-[100px] p-4 border-2 border-blue-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm leading-relaxed transition-all duration-200"
                    placeholder="Edit your note..."
                    autoFocus
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onSave(item._id, editContent)}
                      disabled={isUpdating}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={onCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:bg-gray-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-800 leading-relaxed text-sm mb-3">
                    {item.content}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>You</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {!isEditing && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(item._id, item.content)}
                  className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-200/60 hover:-translate-y-2 hover:rotate-1 ${
        isHovered ? 'shadow-xl shadow-blue-500/20 border-blue-200/60 -translate-y-2' : 'shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {formatDate(item.createdAt)}
            </div>
          </div>
          
          {!isEditing && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                  <button
                    onClick={() => {
                      onEdit(item._id, item.content);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4 text-blue-500" />
                    <span>Edit note</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(item._id);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Delete note</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                className="w-full min-h-[120px] p-4 border-2 border-blue-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-sm leading-relaxed transition-all duration-200"
                placeholder="Edit your note..."
                autoFocus
              />
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onSave(item._id, editContent)}
                  disabled={isUpdating}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isUpdating ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={onCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
                {getPreview(item.content)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEditing && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100/60">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>Created by You</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{item.content.length} characters</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(item._id, item.content)}
                className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Edit note"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}