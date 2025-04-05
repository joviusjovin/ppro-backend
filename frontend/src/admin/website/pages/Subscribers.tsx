import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoMail, IoTrash, IoSend } from 'react-icons/io5';
import config from '../../../config/config';

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
}

const Subscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Log the request details
      console.log('Making request to:', `${config.apiUrl}${config.adminEndpoints.subscribers.base}`);
      console.log('With token:', token);

      const response = await fetch(`${config.apiUrl}${config.adminEndpoints.subscribers.base}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Log the response status and headers
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get the raw text first
      const text = await response.text();
      console.log('Raw response:', text);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch subscribers');
      }

      setSubscribers(data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.apiUrl}${config.adminEndpoints.subscribers.delete(id)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSubscribers(subscribers.filter(sub => sub._id !== id));
        setSuccess('Subscriber deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to delete subscriber');
      }
    } catch (error) {
      setError('Failed to delete subscriber');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSendMessage = async () => {
    try {
      setSending(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.apiUrl}${config.adminEndpoints.subscribers.sendMessage}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        setSuccess('Message sent successfully to all subscribers');
        setShowMessageModal(false);
        setMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Subscribers</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowMessageModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <IoMail className="w-5 h-5" />
          Send Mass Email
        </motion.button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchSubscribers} 
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          {success}
        </div>
      )}

      {/* Subscribers Table */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          {subscribers.length === 0 && !loading && !error && (
            <div className="text-center py-4 text-gray-500">
              No subscribers found
            </div>
          )}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(subscriber._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <IoTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
          >
            <h2 className="text-xl font-semibold mb-4">Send Message to All Subscribers</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className="w-full h-40 p-4 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? 'Sending...' : (
                  <>
                    <IoSend className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Subscribers; 