import React from 'react';
import { Navbar } from '../shared';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage, onPageChange }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onPageChange={onPageChange} />
      <main>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
