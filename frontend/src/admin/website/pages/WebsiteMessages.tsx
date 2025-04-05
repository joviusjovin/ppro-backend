import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, Search, X, RefreshCw, ChevronLeft, ChevronRight, Archive, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../../../config/config';
import { showPermissionDenied } from '../../../components/PermissionDeniedToast';
import { RIGHTS, checkUserRights } from '../../../utils/rights';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  status: 'inbox' | 'trash' | 'spam' | 'archive';
}

// First, define an interface for the API response
interface MessageResponse {
  messages: {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    status?: 'inbox' | 'trash' | 'spam' | 'archive';
  }[];
  total: number;
  currentPage: number;
  totalPages: number;
}

const WebsiteMessages: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage] = useState(50);
  const [totalMessages, setTotalMessages] = useState(0);
  const [currentView, setCurrentView] = useState<'inbox' | 'trash' | 'spam' | 'archive'>('inbox');

  useEffect(() => {
    if (!checkUserRights(RIGHTS.MANAGE_WEBSITE)) {
      navigate('/admin/selection');
      showPermissionDenied('Website Management');
    }
  }, [navigate]);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return false;
    }
    return token;
  }, [navigate]);

  const fetchMessages = useCallback(async (page: number) => {
    const token = checkAuth();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching messages for page:', page);
      console.log('Items per page:', itemsPerPage);

      const response = await fetch(
        `${config.apiUrl}/api/admin/messages?page=${page}&limit=${itemsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MessageResponse = await response.json();
      console.log('Received data:', data);
      
      if (data.messages) {
        const messagesWithStatus = data.messages.map((msg) => ({
          ...msg,
          status: msg.status || 'inbox'
        }));
        setMessages(messagesWithStatus);
        setTotalMessages(data.total);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
        console.log('Total pages:', Math.ceil(data.total / itemsPerPage));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [navigate, checkAuth, itemsPerPage]);

  useEffect(() => {
    const token = checkAuth();
    if (token) {
      fetchMessages(currentPage);
      
      const interval = setInterval(() => {
        fetchMessages(currentPage);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentPage, fetchMessages, checkAuth]);

  const handleMarkAsRead = async (id: string) => {
    const token = checkAuth();
    if (!token) return;

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/messages/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, isRead: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
      setError('Failed to mark message as read');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'trash' | 'spam' | 'archive') => {
    const token = checkAuth();
    if (!token) return;

    try {
      // Update the message status locally first for better UX
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, status: newStatus } : msg
      ));
      if (selectedMessage?._id === id) setSelectedMessage(null);

      // Then send the request to the server
      const response = await fetch(`${config.apiUrl}/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to update message status to ${newStatus}`);
      }

    } catch (error) {
      console.error(`Error updating message status to ${newStatus}:`, error);
      setError(error instanceof Error ? error.message : `Failed to update message status to ${newStatus}`);
      // Revert the local change if the server request failed
      await fetchMessages(currentPage);
    }
  };

  const handleMoveToTrash = (id: string) => handleStatusChange(id, 'trash');
  const handleMarkAsSpam = (id: string) => handleStatusChange(id, 'spam');
  const handleArchive = (id: string) => handleStatusChange(id, 'archive');

  const handleRefresh = () => {
    fetchMessages(currentPage);
  };

  const handleDelete = async (id: string) => {
    const token = checkAuth();
    if (!token) return;

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(messages.filter(msg => msg._id !== id));
      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(msg =>
    (currentView === 'inbox' ? (!msg.status || msg.status === 'inbox') : msg.status === currentView) &&
    (msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
     msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     msg.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  console.log('Current view:', currentView);
  console.log('All messages:', messages);
  console.log('Filtered messages:', filteredMessages);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Website Messages
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {totalMessages} messages • {messages.filter(m => !m.isRead).length} unread
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 
                  dark:hover:text-white rounded-full hover:bg-gray-100 
                  dark:hover:bg-gray-700 transition-colors"
                title="Refresh messages"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentView('inbox')}
                className={`px-4 py-2 -mb-px ${
                  currentView === 'inbox'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Inbox
              </button>
              <button
                onClick={() => setCurrentView('archive')}
                className={`px-4 py-2 -mb-px ${
                  currentView === 'archive'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Archive
              </button>
              <button
                onClick={() => setCurrentView('spam')}
                className={`px-4 py-2 -mb-px ${
                  currentView === 'spam'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Spam
              </button>
              <button
                onClick={() => setCurrentView('trash')}
                className={`px-4 py-2 -mb-px ${
                  currentView === 'trash'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Trash
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <X className="w-5 h-5 mr-2" />
                  {error}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg 
                    dark:border-gray-700 dark:bg-gray-700 dark:text-white
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 border-r dark:border-gray-700">
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                  {loading && messages.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 
                        border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No messages found</p>
                    </div>
                  ) : (
                    filteredMessages.map((msg) => (
                      <div
                        key={msg._id}
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (!msg.isRead) handleMarkAsRead(msg._id);
                        }}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 
                          transform hover:scale-[1.02] ${
                          selectedMessage?._id === msg._id
                            ? 'bg-blue-50 dark:bg-blue-900 shadow-md'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          } ${!msg.isRead ? 'border-l-4 border-blue-500' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {msg.name}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {msg.subject}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-6 space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 
                        dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 
                        dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 p-4">
                {selectedMessage ? (
                  <div className="animate-fadeIn">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {selectedMessage.subject}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          From: {selectedMessage.name} ({selectedMessage.email})
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {currentView === 'trash' ? (
                          <button
                            onClick={() => handleDelete(selectedMessage._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full 
                              dark:hover:bg-red-900 transition-colors"
                            title="Permanently Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleMoveToTrash(selectedMessage._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-full 
                                dark:hover:bg-red-900 transition-colors"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            {currentView === 'inbox' && (
                              <>
                                <button
                                  onClick={() => handleArchive(selectedMessage._id)}
                                  className="p-2 text-gray-500 hover:bg-gray-50 rounded-full 
                                    dark:hover:bg-gray-700 transition-colors"
                                  title="Archive"
                                >
                                  <Archive className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleMarkAsSpam(selectedMessage._id)}
                                  className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full 
                                    dark:hover:bg-yellow-900 transition-colors"
                                  title="Mark as Spam"
                                >
                                  <AlertTriangle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap 
                        bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full 
                    text-gray-500 dark:text-gray-400">
                    <Mail className="w-16 h-16 mb-4" />
                    <p className="text-lg">Select a message to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteMessages; 