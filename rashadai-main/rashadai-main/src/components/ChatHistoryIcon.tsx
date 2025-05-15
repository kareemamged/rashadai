import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ChatHistoryIcon: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Only show the icon if the user is logged in and on the chat page
  if (!user || !location.pathname.includes('/chat')) return null;

  return (
    <div className="relative">
      <Link
        to="/chat-history"
        className="fixed left-4 top-16 z-40 bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        aria-label="Chat History"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="sr-only">Chat History</span>
      </Link>
    </div>
  );
};

export default ChatHistoryIcon;
