import { useState } from 'react';
import CreateNoteModal from './CreateNoteModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ContentSidebar from './ContentSidebar';
import NoteCard from './NoteCard';
import Chat from './Chat';
import ViewContentModal from './ViewContentModal';
import { LoadingSpinner, ErrorState, EmptyContentState, EmptySearchState } from './LoadingStates';
import { useCreateContentMutation, useDeleteContentMutation, useUpdateContentMutation, useLogoutMutation } from '../services/api';
import { useGetAllContentQuery } from '../services/api';
import { ContentItem } from '../types';
import { useMeQuery } from '../services/api';
import { Search, Plus, Grid3X3, List, Filter, SortDesc, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetTokens } from '../store/reducers/authReducer';

export default function Content() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  const [createContent, { isLoading: isCreating, error: createError }] = useCreateContentMutation();
  const [deleteContent, { isLoading: isDeleting }] = useDeleteContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const { data, isLoading, error } = useGetAllContentQuery();
  const [activeTab, setActiveTab] = useState('all');
  const { data: userData } = useMeQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'notes' | 'chat'>('notes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'oldest'>('recent');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Loading states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState />;
  if (!data || !data.data) return <EmptyContentState onCreateNote={() => setShowCreateModal(true)} />;

  const contentData = (data && Array.isArray(data.data)) ? data.data : [];  
  const filteredContent = contentData.filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort content based on selected criteria
  const sortedContent = [...filteredContent].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'alphabetical':
        return a.content.localeCompare(b.content);
      default:
        return 0;
    }
  });

  // Handler functions
  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleDelete = (id: string) => {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };

  const handleView = (item: ContentItem) => {
    setViewingItem(item);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Failed to logout:', err);
    } finally {
      dispatch(resetTokens());
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    }
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

  const handleViewSave = async (id: string, content: string) => {
    try {
      await updateContent({ id, content: { content } }).unwrap();
      setViewingItem((prev) => (prev && prev._id === id ? { ...prev, content } : prev));
    } catch (error) {
      console.error('Failed to update content from modal:', error);
      throw error;
    }
  };

  const handleViewClose = () => {
    setViewingItem(null);
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
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white">
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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white">
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
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="px-8 py-6">
            {/* Top Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-8">
                {/* Enhanced Tab Navigation */}
                <div className="flex space-x-2 bg-gradient-to-r from-gray-100 to-gray-50 p-1.5 rounded-2xl shadow-inner">
                  <button
                    onClick={() => setActiveView('notes')}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activeView === 'notes'
                        ? 'bg-white text-black shadow-lg shadow-gray-500/20 scale-105'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded-lg ${activeView === 'notes' ? 'bg-gray-100' : 'bg-transparent'}`}>
                        <Grid3X3 className="w-4 h-4" />
                      </div>
                      <span>Notes</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveView('chat')}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activeView === 'chat'
                        ? 'bg-white text-black shadow-lg shadow-gray-500/20 scale-105'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded-lg ${activeView === 'chat' ? 'bg-gray-100' : 'bg-transparent'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span>AI Chat</span>
                    </div>
                  </button>
                </div>
                
                {/* View-specific info */}
                {activeView === 'notes' && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {sortedContent.length} {sortedContent.length === 1 ? 'note' : 'notes'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="flex items-center space-x-3">
                {activeView === 'notes' && (
                  <>
                    {/* Search Bar */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search notes..."
                        className="w-64 pl-11 pr-4 py-2.5 text-sm bg-white/70 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-black transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all duration-200 ${
                          viewMode === 'grid' 
                            ? 'bg-white shadow-sm text-black' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all duration-200 ${
                          viewMode === 'list' 
                            ? 'bg-white shadow-sm text-black' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="appearance-none bg-white/70 border border-gray-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-black transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest First</option>
                        <option value="alphabetical">A-Z</option>
                      </select>
                      <SortDesc className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Create Note Button */}
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2 group"
                    >
                      <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                      <span>New Note</span>
                    </button>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:text-black hover:border-black transition-all duration-200 disabled:opacity-60"
                >
                  {isLoggingOut ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                  )}
                  <span>{isLoggingOut ? 'Logging out' : 'Logout'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'notes' ? (
            /* Enhanced Notes Grid */
            <div className="h-full overflow-auto p-8">
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-4'
              }`}>
                {sortedContent.map((item: ContentItem) => (
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
                    onView={handleView}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Enhanced Chat Interface */
            <div className="h-full">
              <Chat />
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modals */}
      <CreateNoteModal
        show={showCreateModal}
        newContent={newContent}
        isCreating={isCreating}
        createError={!!createError}
        onContentChange={setNewContent}
        onCancel={() => { setShowCreateModal(false); setNewContent(''); }}
        onCreate={handleCreateNote}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <ViewContentModal
        show={!!viewingItem}
        item={viewingItem}
        onClose={handleViewClose}
        onSave={handleViewSave}
        isSaving={isUpdating}
      />
    </div>
  );
}