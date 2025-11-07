import React, { useState } from 'react';
import { SourceInfo } from '../types/chat';
import { ExternalLink, FileText, Calendar, Clock, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface SourceLinkProps {
  sourceInfo: SourceInfo;
  onNavigate?: (contentId: string) => void;
  showPreview?: boolean;
  compact?: boolean;
  showContentIdLink?: boolean;
}

const SourceLink: React.FC<SourceLinkProps> = ({ 
  sourceInfo, 
  onNavigate,
  showPreview = true,
  compact = false,
  showContentIdLink = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSourceClick = () => {
    if (onNavigate) {
      onNavigate(sourceInfo.contentId);
    } else {
      // Default navigation - you can customize this based on your routing setup
      window.open(sourceInfo.sourceUrl, '_blank');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatContentLength = (length?: number) => {
    if (!length) return '';
    if (length < 1000) return `${length} chars`;
    return `${(length / 1000).toFixed(1)}k chars`;
  };

  if (compact) {
    return (
      <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1">
        <FileText className="w-3 h-3" />
        <button
          onClick={handleSourceClick}
          className="text-blue-600 hover:text-blue-800 underline font-medium"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {sourceInfo.title}
        </button>
        <ExternalLink className="w-3 h-3 text-gray-400" />
      </div>
    );
  }

  return (
    <div 
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Source Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm">
              {sourceInfo.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Source: {sourceInfo.sourceType}
            </p>
            {showContentIdLink && sourceInfo.contentId && (
              <button
                onClick={() => (onNavigate ? onNavigate(sourceInfo.contentId) : window.open(sourceInfo.sourceUrl, '_blank'))}
                className="mt-1 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                title={sourceInfo.contentId}
              >
                ID: {sourceInfo.contentId}
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={handleSourceClick}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
        >
          <span>View Source</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Source Metadata */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        {sourceInfo.metadata?.createdAt && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(sourceInfo.metadata.createdAt)}</span>
          </div>
        )}
        
        {sourceInfo.metadata?.contentLength && (
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatContentLength(sourceInfo.metadata.contentLength)}</span>
          </div>
        )}
        
        {sourceInfo.metadata?.updatedAt && sourceInfo.metadata?.updatedAt !== sourceInfo.metadata?.createdAt && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-400">•</span>
            <span>Updated {formatDate(sourceInfo.metadata.updatedAt)}</span>
          </div>
        )}
      </div>

      {/* Content Preview */}
      {showPreview && sourceInfo.preview && (
        <div className="mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-xs text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <Eye className="w-3 h-3" />
            <span>{isExpanded ? 'Hide' : 'Show'} Preview</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                {sourceInfo.preview}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Attribution */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-gray-600 italic">
          This answer is based on content from: {sourceInfo.title}
        </p>
      </div>
    </div>
  );
};

export default SourceLink;

