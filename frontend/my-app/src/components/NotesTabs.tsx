interface NotesTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function NotesTabs({ activeTab, setActiveTab }: NotesTabsProps) {
  return (
    <div className="mt-4 flex space-x-8 border-b border-gray-200">
      <button
        onClick={() => setActiveTab('all')}
        className={`pb-3 px-1 text-sm font-medium border-b-2 ${
          activeTab === 'all'
            ? 'text-blue-500 border-blue-500'
            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
        } transition-colors`}
      >
        All Notes
      </button>
      <button
        onClick={() => setActiveTab('created')}
        className={`pb-3 px-1 text-sm font-medium border-b-2 ${
          activeTab === 'created'
            ? 'text-blue-500 border-blue-500'
            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
        } transition-colors`}
      >
        Created by me
      </button>
      <button
        onClick={() => setActiveTab('shared')}
        className={`pb-3 px-1 text-sm font-medium border-b-2 ${
          activeTab === 'shared'
            ? 'text-blue-500 border-blue-500'
            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
        } transition-colors`}
      >
        Shared with me
      </button>
    </div>
  );
}