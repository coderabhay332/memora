import { useState } from 'react';
import CreateNoteModal from './CreateNoteModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ContentSidebar from './ContentSidebar';
import NoteCard from './NoteCard';
import Chat from './Chat';
import { LoadingSpinner, ErrorState, EmptyContentState, EmptySearchState } from './LoadingStates';
import { useCreateContentMutation, useDeleteContentMutation, useUpdateContentMutation } from '../services/api';
import { useGetAllContentQuery } from '../services/api';
import { ContentItem } from '../types';
import { useMeQuery } from '../services/api';

export default function Content() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [createContent, { isLoading: isCreating, error: createError }] = useCreateContentMutation();
  const [deleteContent, { isLoading: isDeleting }] = useDeleteContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();

  const { data, isLoading, error } = useGetAllContentQuery();
  const [activeTab, setActiveTab] = useState('all');
  const { data: userData } = useMeQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'notes' | 'chat'>('notes');

  // Loading states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState />;
  if (!data || !data.data) return <EmptyContentState onCreateNote={() => setShowCreateModal(true)} />;

  const contentData = (data && Array.isArray(data.data)) ? data.data : [];  
  const filteredContent = contentData.filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler functions
  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleDelete = (id: string) => {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };

  const handleSave = async (id: string, content: string) => {
    try {
      await updateContent({ id, content: { content } }).unwrap();
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleCreateNote = async () => {
    if (!newContent.trim()) return;
    
    try {
      await createContent({ content: newContent }).unwrap();
      setNewContent('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create content:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItemId) return;
    
    try {
      await deleteContent(deleteItemId).unwrap();
      setShowDeleteModal(false);
      setDeleteItemId(null);
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteItemId(null);
  };

  // Show empty search state if no results
  if (searchQuery && filteredContent.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ContentSidebar
          userData={userData}
          contentData={contentData}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCreateNote={() => setShowCreateModal(true)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <EmptySearchState onCreateNote={() => setShowCreateModal(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ContentSidebar
        userData={userData}
        contentData={contentData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateNote={() => setShowCreateModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-6">
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveView('notes')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'notes'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Notes</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveView('chat')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'chat'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Chat</span>
                    </div>
                  </button>
                </div>
                
                {/* View-specific info */}
                {activeView === 'notes' && (
                  <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-semibold text-gray-800">Notes</h1>
                    <span className="text-sm text-gray-500">
                      {filteredContent.length} {filteredContent.length === 1 ? 'note' : 'notes'}
                    </span>
                  </div>
                )}
                {activeView === 'chat' && (
                  <h1 className="text-xl font-semibold text-gray-800">AI Chat</h1>
                )}
              </div>
              
              {/* Action Button */}
              {activeView === 'notes' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Note</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'notes' ? (
            /* Notes Grid */
            <div className="h-full overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredContent.map((item: ContentItem) => (
                  <NoteCard
                    key={item._id}
                    item={item}
                    isEditing={editingId === item._id}
                    editContent={editContent}
                    isUpdating={isUpdating}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onEditContentChange={setEditContent}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="h-full">
              <Chat />
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      <CreateNoteModal
        show={showCreateModal}
        newContent={newContent}
        isCreating={isCreating}
        createError={!!createError}
        onContentChange={setNewContent}
        onCancel={() => { setShowCreateModal(false); setNewContent(''); }}
        onCreate={handleCreateNote}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
