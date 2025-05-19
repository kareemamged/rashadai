import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatHistoryIcon from './ChatHistoryIcon';
import DeletionAlert from './DeletionAlert';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ChatHistoryIcon />
      {user && <div className="container mx-auto px-4 mt-4"><DeletionAlert /></div>}
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;