import { use, useState } from 'react';
import { useUpdateContentMutation } from '../services/api'; // Adjust import to your API

interface SidebarProps {
  userData: any;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  contentData: any[];
}

export default function Sidebar({ userData, searchQuery, setSearchQuery, contentData }: SidebarProps) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header with logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-semibold">M</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">memora</span>
        </div>
      </div>
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {/* User profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userData?.data.name?.charAt(0) || userData?.data.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{userData?.data.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{userData?.data.email}</p>
          </div>
        </div>
      </div>
      {/* Navigation, Quick Actions, Library, Recent, Tags */}
      <SidebarNav
        contentData={contentData}
        showAll={showAll}
        setShowAll={setShowAll}
      />
    </div>
  );
}

// You can further split SidebarNav, RecentNotesSidebar, and TagsSidebar if desired.
function SidebarNav({
  contentData,
  showAll,
  setShowAll,
}: {
  contentData: any[];
  showAll: boolean;
  setShowAll: (v: boolean) => void;
}) {
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleNoteClick = (note: any) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const [updateContent] = useUpdateContentMutation();

  const handleClose = async () => {
    if (editingNote && editContent !== editingNote.content) {
      await updateContent({ id: editingNote._id, content: { content: editContent } });
      // Optionally, refresh notes here
    }
    setEditingNote(null);
    setEditContent('');
  };

  const displayedContent = showAll ? contentData : contentData.slice(0, 5);

  return (
    <div>
      {/* Quick actions */}
      <div>
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>New Note</span>
        </button>
      </div>
      {/* Library section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Library</h3>
        <div className="space-y-1">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>All Notes</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span>Collections</span>
          </button>
        </div>
      </div>
      {/* Recent notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</h3>
          <button
            className="text-xs text-blue-500 hover:text-blue-600"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show less" : "See all"}
          </button>
        </div>
        <div className="space-y-1">
          {displayedContent.map((item) => (
            <button
              key={item._id}
              onClick={() => handleNoteClick(item)}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <span className="truncate">{item.content.substring(0, 24)}{item.content.length > 24 ? '...' : ''}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Edit Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit Note</h2>
            <textarea
              className="w-full border rounded p-2 mb-4"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setEditingNote(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleClose}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}