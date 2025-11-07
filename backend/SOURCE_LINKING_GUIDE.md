# Source Linking Guide for RAG Responses

## Overview
This guide explains how the enhanced RAG system now returns source information with every response, allowing users to directly navigate to the source content.

## New Features

### 1. Enhanced RAG Response Format
The RAG endpoint now returns comprehensive source information:

```json
{
  "success": true,
  "data": {
    "answer": "The answer based on context...",
    "contentId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "chatId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "sourceInfo": {
      "contentId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "My Document Title",
      "sourceUrl": "/content/64f8a1b2c3d4e5f6a7b8c9d0",
      "sourceType": "content",
      "metadata": {
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "contentLength": 1500
      },
      "preview": "This is a preview of the content that was used to generate the answer..."
    },
    "attribution": "Source: My Document Title",
    "contextStats": {
      "originalLength": 2000,
      "optimizedLength": 1500,
      "relevantChunks": 3,
      "queryIntent": "question",
      "queryComplexity": "medium"
    }
  },
  "message": "Enhanced RAG response generated successfully"
}
```

### 2. Source Information Service
New service (`source-info.service.ts`) provides:
- **Content validation** and access control
- **Source metadata** extraction
- **Content previews** for better context
- **Attribution text** generation
- **Multi-source support** for complex queries

### 3. New API Endpoints

#### Get RAG Source Information
```
GET /api/content/source/:contentId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sourceInfo": {
      "contentId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Document Title",
      "sourceUrl": "/content/64f8a1b2c3d4e5f6a7b8c9d0",
      "sourceType": "content",
      "metadata": { ... }
    },
    "fullContent": { ... },
    "navigationUrl": "/content/64f8a1b2c3d4e5f6a7b8c9d0",
    "canEdit": true,
    "canDelete": true
  }
}
```

## Frontend Integration

### 1. Display Source Information
```typescript
interface RAGResponse {
  answer: string;
  contentId: string;
  chatId: string;
  sourceInfo: {
    contentId: string;
    title: string;
    sourceUrl: string;
    sourceType: string;
    metadata: Record<string, any>;
    preview: string;
  } | null;
  attribution: string | null;
  contextStats: {
    originalLength: number;
    optimizedLength: number;
    relevantChunks: number;
    queryIntent: string;
    queryComplexity: string;
  };
}
```

### 2. Source Navigation Component
```typescript
const SourceLink = ({ sourceInfo }: { sourceInfo: SourceInfo }) => {
  const handleSourceClick = () => {
    // Navigate to the source content
    window.location.href = sourceInfo.sourceUrl;
    // Or use React Router: navigate(sourceInfo.sourceUrl);
  };

  return (
    <div className="source-link">
      <p className="attribution">{sourceInfo.title}</p>
      <button onClick={handleSourceClick}>
        View Source Content
      </button>
      {sourceInfo.preview && (
        <div className="preview">
          {sourceInfo.preview}
        </div>
      )}
    </div>
  );
};
```

### 3. Enhanced Chat Interface
```typescript
const ChatMessage = ({ message }: { message: RAGResponse }) => {
  return (
    <div className="chat-message">
      <div className="answer">{message.answer}</div>
      
      {message.sourceInfo && (
        <div className="source-info">
          <SourceLink sourceInfo={message.sourceInfo} />
          <div className="context-stats">
            <small>
              Based on {message.contextStats.relevantChunks} relevant sections
              from {message.sourceInfo.title}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};
```

## API Usage Examples

### 1. Basic RAG Query with Source
```typescript
const response = await fetch('/api/content/rag/chatId', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'What is machine learning?' })
});

const data = await response.json();
// data.data.sourceInfo contains source information
// data.data.contentId for direct navigation
```

### 2. Get Source Details
```typescript
const getSourceDetails = async (contentId: string) => {
  const response = await fetch(`/api/content/source/${contentId}`);
  const data = await response.json();
  return data.data;
};
```

### 3. Navigate to Source
```typescript
const navigateToSource = (contentId: string) => {
  // Option 1: Direct navigation
  window.location.href = `/content/${contentId}`;
  
  // Option 2: React Router
  navigate(`/content/${contentId}`);
  
  // Option 3: Open in new tab
  window.open(`/content/${contentId}`, '_blank');
};
```

## Security Features

### 1. Access Control
- Users can only access their own content
- Source information is validated before return
- Content access is checked for each request

### 2. Content Validation
```typescript
// The system automatically validates:
// - Content exists
// - User has access to content
// - Content is not deleted
// - Content belongs to the requesting user
```

## Performance Optimizations

### 1. Efficient Source Loading
- Source information is fetched in parallel with RAG processing
- Content previews are limited to 300 characters
- Metadata is cached for repeated requests

### 2. Context Optimization
- Only relevant content chunks are processed
- Source information is included only when available
- Attribution text is generated efficiently

## Error Handling

### 1. Missing Source
```json
{
  "success": true,
  "data": {
    "answer": "Answer text...",
    "sourceInfo": null,
    "attribution": null
  }
}
```

### 2. Access Denied
```json
{
  "success": false,
  "message": "Content not found or access denied"
}
```

## Migration Notes

### 1. Backward Compatibility
- Existing RAG endpoints continue to work
- New fields are optional and don't break existing code
- Source information is added without changing core functionality

### 2. Frontend Updates
- Update chat components to display source information
- Add navigation handlers for source links
- Implement source preview functionality

## Best Practices

### 1. Source Display
- Always show source attribution
- Provide clear navigation to source content
- Display content preview when available
- Handle cases where source is unavailable

### 2. User Experience
- Make source links prominent but not intrusive
- Provide context about why the source is relevant
- Allow users to easily navigate back to chat
- Show source metadata (date, length, etc.)

### 3. Performance
- Cache source information when possible
- Lazy load full content details
- Optimize source preview generation
- Handle large content gracefully

## Future Enhancements

1. **Multi-source support** for complex queries
2. **Source relevance scoring** for better ranking
3. **Source highlighting** to show relevant sections
4. **Source comparison** for multiple documents
5. **Source bookmarking** for important references

