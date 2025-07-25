import { useState } from 'react';
import CreateNoteModal from './CreateNoteModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ContentSidebar from './ContentSidebar';
import NoteCard from './NoteCard';
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
      <>
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
      </>
    );
  }

  return (
    <>
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
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-800">Notes</h1>
                <span className="text-sm text-gray-500">
                  {filteredContent.length} {filteredContent.length === 1 ? 'note' : 'notes'}
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Note</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="flex-1 overflow-auto p-6">
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
    </>
  );
}
