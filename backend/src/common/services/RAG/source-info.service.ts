/**
 * Source Information Service
 * Handles source content details and linking for RAG responses
 */

import Content from '../../../content/content.schema';

export interface SourceInfo {
  contentId: string;
  title?: string;
  sourceUrl: string;
  sourceType: 'content' | 'document' | 'url';
  metadata?: Record<string, any>;
  relevanceScore?: number;
}

export interface MultiSourceInfo {
  primarySource: SourceInfo;
  additionalSources: SourceInfo[];
  totalSources: number;
}

export class SourceInfoService {
  /**
   * Get detailed source information for a content ID
   */
  static async getSourceInfo(contentId: string, userId: string): Promise<SourceInfo | null> {
    try {
      const content = await Content.findOne({ 
        _id: contentId, 
        userId 
      }).select('content createdAt updatedAt');

      if (!content) {
        return null;
      }

      return {
        contentId: content._id.toString(),
        title: 'Content',
        sourceUrl: `/content/${content._id}`,
        sourceType: 'content',
        metadata: {
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
          contentLength: (content as any).content?.length || 0
        }
      };
    } catch (error) {
      console.error('Error fetching source info:', error);
      return null;
    }
  }

  /**
   * Get source information for multiple content IDs
   */
  static async getMultiSourceInfo(
    contentIds: string[], 
    userId: string
  ): Promise<MultiSourceInfo | null> {
    try {
      const sources = await Promise.all(
        contentIds.map(id => this.getSourceInfo(id, userId))
      );

      const validSources = sources.filter(source => source !== null) as SourceInfo[];
      
      if (validSources.length === 0) {
        return null;
      }

      return {
        primarySource: validSources[0],
        additionalSources: validSources.slice(1),
        totalSources: validSources.length
      };
    } catch (error) {
      console.error('Error fetching multi-source info:', error);
      return null;
    }
  }

  /**
   * Generate source links for frontend
   */
  static generateSourceLinks(sources: SourceInfo[]): Array<{
    id: string;
    title: string;
    url: string;
    type: string;
    metadata?: Record<string, any>;
  }> {
    return sources.map(source => ({
      id: source.contentId,
      title: source.title || 'Untitled',
      url: source.sourceUrl,
      type: source.sourceType,
      metadata: source.metadata
    }));
  }

  /**
   * Create source attribution text
   */
  static createAttributionText(sources: SourceInfo[]): string {
    if (sources.length === 0) return '';
    
    if (sources.length === 1) {
      return `Source: ${sources[0].title || 'Content'}`;
    }
    
    const primarySource = sources[0];
    const additionalCount = sources.length - 1;
    
    return `Primary source: ${primarySource.title || 'Content'}${additionalCount > 0 ? ` (+${additionalCount} additional sources)` : ''}`;
  }

  /**
   * Validate content access for user
   */
  static async validateContentAccess(contentId: string, userId: string): Promise<boolean> {
    try {
      const content = await Content.findOne({ 
        _id: contentId, 
        userId 
      }).select('_id');
      
      return content !== null;
    } catch (error) {
      console.error('Error validating content access:', error);
      return false;
    }
  }

  /**
   * Get content preview for source linking
   */
  static async getContentPreview(contentId: string, userId: string, maxLength: number = 200): Promise<string | null> {
    try {
      const content = await Content.findOne({ 
        _id: contentId, 
        userId 
      }).select('content');

      if (!content || !content.content) {
        return null;
      }

      const preview = content.content.length > maxLength 
        ? content.content.slice(0, maxLength) + '...'
        : content.content;

      return preview;
    } catch (error) {
      console.error('Error fetching content preview:', error);
      return null;
    }
  }
}

