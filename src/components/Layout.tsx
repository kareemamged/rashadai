import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatHistoryIcon from './ChatHistoryIcon';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ChatHistoryIcon />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;