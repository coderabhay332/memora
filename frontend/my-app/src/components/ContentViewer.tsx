import React, { useState } from 'react';
import { useGetRAGSourceQuery } from '../services/api';
import { ArrowLeft, ExternalLink, Calendar, Clock, FileText, Edit, Trash2, Copy, Check } from 'lucide-react';

interface ContentViewerProps {
  contentId: string;
  onClose?: () => void;
  onEdit?: (contentId: string) => void;
  onDelete?: (contentId: string) => void;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ 
  contentId, 
  onClose, 
  onEdit, 
  onDelete 
}) => {
  const [copied, setCopied] = useState(false);
  
  const { 
    data: sourceData, 
    isLoading, 
    error 
  } = useGetRAGSourceQuery(contentId);

  const handleCopy = async () => {
    if (sourceData?.data?.fullContent?.content) {
      try {
        await navigator.clipboard.writeText(sourceData.data.fullContent.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy content:', err);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContentLength = (length?: number) => {
    if (!length) return '';
    if (length < 1000) return `${length} characters`;
    return `${(length / 1000).toFixed(1)}k characters`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !sourceData?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Content Not Found</h2>
          <p className="text-gray-600 mb-4">The requested content could not be found or you don't have access to it.</p>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const { sourceInfo, fullContent, navigationUrl, canEdit, canDelete } = sourceData.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {sourceInfo.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {sourceInfo.sourceType} • {formatContentLength(fullContent?.content?.length)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              
              {canEdit && onEdit && (
                <button
                  onClick={() => onEdit(contentId)}
                  className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              )}
              
              {canDelete && onDelete && (
                <button
                  onClick={() => onDelete(contentId)}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Metadata */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-600">
                  {formatDate(sourceInfo.metadata?.createdAt)}
                </p>
              </div>
            </div>
            
            {sourceInfo.metadata?.updatedAt && sourceInfo.metadata?.updatedAt !== sourceInfo.metadata?.createdAt && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Updated</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(sourceInfo.metadata?.updatedAt)}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Length</p>
                <p className="text-sm text-gray-600">
                  {formatContentLength(fullContent?.content?.length)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {fullContent?.content || 'No content available'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Source Information</p>
                <p className="text-sm text-gray-600">
                  This content was used to generate AI responses in your chat
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Content ID: {contentId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentViewer;

