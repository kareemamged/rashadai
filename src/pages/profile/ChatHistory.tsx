import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Trash2, Calendar, Download, Filter, Upload, AlertCircle, Check, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useChatHistoryStore, ChatSession } from '../../store/chatHistoryStore';
import ChatHeader from '../../components/ChatHeader';

const ChatHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { chatSessions, deleteChat, exportChats, importChats } = useChatHistoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChatClick = (chatId: string) => {
    // Navigate to the chat page with the selected chat
    navigate(`/chat?id=${chatId}`);
  };

  const handleDeleteSelected = () => {
    if (selectedChats.length === 0) return;

    // Show confirmation popup
    const confirmPopup = document.createElement('div');
    confirmPopup.className = 'fixed inset-0 flex items-center justify-center z-50';
    confirmPopup.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50" id="popup-overlay"></div>
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative z-10">
        <div class="flex items-center text-red-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <h3 class="text-lg font-semibold">Delete Conversations</h3>
        </div>
        <p class="text-gray-600 mb-6">Are you sure you want to delete ${selectedChats.length} selected conversation${selectedChats.length > 1 ? 's' : ''}? This action cannot be undone.</p>
        <div class="flex justify-end space-x-3">
          <button id="cancel-delete" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button id="confirm-delete" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(confirmPopup);

    // Add event listeners
    document.getElementById('popup-overlay')?.addEventListener('click', () => {
      document.body.removeChild(confirmPopup);
    });

    document.getElementById('cancel-delete')?.addEventListener('click', () => {
      document.body.removeChild(confirmPopup);
    });

    document.getElementById('confirm-delete')?.addEventListener('click', () => {
      // Delete the selected chats
      selectedChats.forEach(chatId => {
        deleteChat(chatId);
      });

      setSelectedChats([]);
      document.body.removeChild(confirmPopup);

      // Show success notification
      showNotification('Conversations deleted successfully', 'success');
    });
  };

  const handleExportChats = (chatIds: string[]) => {
    if (chatIds.length === 0) return;

    // Use the store's export function
    exportChats(chatIds);

    // Show success notification
    showNotification('Conversations exported successfully', 'success');
  };

  // Helper function to show notifications
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Create notification element
    const notification = document.createElement('div');

    // Set appropriate colors based on type
    let bgColor, iconHtml;
    if (type === 'success') {
      bgColor = 'bg-green-600';
      iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>`;
    } else if (type === 'error') {
      bgColor = 'bg-red-600';
      iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>`;
    } else {
      bgColor = 'bg-blue-600';
      iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>`;
    }

    notification.className = `fixed top-20 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center`;
    notification.innerHTML = `
      <div class="mr-2">
        ${iconHtml}
      </div>
      <span>${message}</span>
      <button class="ml-3 text-white hover:text-blue-100" id="close-notification">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    document.body.appendChild(notification);

    // Add animation
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    setTimeout(() => { notification.style.opacity = '1'; }, 10);

    // Add close button functionality
    const closeButton = notification.querySelector('#close-notification');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        notification.style.opacity = '0';
        setTimeout(() => { document.body.removeChild(notification); }, 300);
      });
    }

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  };

  // Import functionality
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportChats = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Use the store's import function
        const success = importChats(importedData);

        if (success) {
          // Show success notification
          showNotification('Conversations imported successfully', 'success');

          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          setImportError('Invalid file format: Missing chat data');
        }
      } catch (error) {
        console.error('Error importing chats:', error);
        setImportError('Failed to import: Invalid file format');
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read the file');
    };

    reader.readAsText(file);
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChats(prev => {
      if (prev.includes(chatId)) {
        return prev.filter(id => id !== chatId);
      } else {
        return [...prev, chatId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedChats.length === filteredChats.length) {
      setSelectedChats([]);
    } else {
      setSelectedChats(filteredChats.map(chat => chat.id));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      calendar: 'gregory'
    });
  };

  // تصفية المحادثات حسب البحث والفلتر
  const filteredChats = chatSessions.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.preview.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'recent') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return matchesSearch && chat.date >= oneMonthAgo;
    }
    if (selectedFilter === 'older') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return matchesSearch && chat.date < oneMonthAgo;
    }

    return matchesSearch;
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ChatHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>

            <div className="flex space-x-2">
              <button
                onClick={handleDeleteSelected}
                disabled={selectedChats.length === 0}
                className="flex items-center px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => handleExportChats(selectedChats.length > 0 ? selectedChats : filteredChats.map(chat => chat.id))}
                className="flex items-center px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              <button
                onClick={handleImportClick}
                className="flex items-center px-3 py-1.5 text-sm text-green-600 border border-green-200 rounded-md hover:bg-green-50"
              >
                <Upload className="h-4 w-4 mr-1" />
                Import
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportChats}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {importError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Import Error</p>
                <p className="text-sm">{importError}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Search and filter */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search in conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="appearance-none block pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Conversations</option>
                    <option value="recent">Last Month</option>
                    <option value="older">Older than a Month</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Chat list */}
            {filteredChats.length > 0 ? (
              <div>
                <div className="border-b border-gray-200 px-4 py-3 flex items-center bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedChats.length === filteredChats.length && filteredChats.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedChats.length > 0 ? `${selectedChats.length} selected` : 'Select All'}
                  </span>
                </div>

                <ul className="divide-y divide-gray-200">
                  {filteredChats.map((chat) => (
                    <li key={chat.id} className="hover:bg-gray-50">
                      <div className="flex items-center px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedChats.includes(chat.id)}
                          onChange={() => handleSelectChat(chat.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-4"
                        />

                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleChatClick(chat.id)}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{chat.title}</h3>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(chat.date)}
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 truncate">{chat.preview}</p>
                          <div className="mt-1 flex items-center">
                            <MessageSquare className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-400">{chat.messageCount} messages</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="py-12 px-4 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Conversations</h3>
                <p className="text-gray-500 mb-4">No conversations found matching your search criteria</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
