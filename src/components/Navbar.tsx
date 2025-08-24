import React, { useState } from 'react';
import { useAppDispatch, useAuth } from '../app/hooks';
import { logoutUser } from '../features/auth/model/authSlice';
import { UserRole } from '../shared/types';
import { useTranslation } from '../shared/lib/useTranslation';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const dispatch = useAppDispatch();
  const { user, permissions } = useAuth();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const getNavItems = () => {
    const items = [
      { key: 'dashboard', label: t('nav.dashboard'), icon: '🏠' },
      { key: 'current-duty', label: t('nav.currentDuty'), icon: '👥' },
    ];

    if (permissions?.canViewDepartments && permissions.canViewDepartments.length > 0) {
      items.push({ key: 'calendar', label: t('nav.calendar'), icon: '📅' });
    }

    if (user?.role === UserRole.ADMIN) {
      items.push(
        { key: 'users', label: t('nav.users'), icon: '👤' },
        { key: 'departments', label: t('nav.departments'), icon: '🏢' },
        { key: 'admin-schedules', label: t('nav.adminSchedules'), icon: '⏰' }
      );
    }

    // Редактирование графиков доступно только администраторам и менеджерам
    if ((user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && 
        permissions?.canEditDepartments && permissions.canEditDepartments.length > 0) {
      items.push({ key: 'schedule-edit', label: t('nav.scheduleEdit'), icon: '✏️' });
    }

    return items;
  };

  const handleMenuItemClick = (page: string) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="relative flex justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center flex-shrink-0">
            <h1 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900">
              Графік чергувань
            </h1>
          </div>

          {/* Center - Desktop Navigation (hidden on mobile) */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:flex-1 lg:px-4">
            <div className="flex space-x-2 xl:space-x-4">
              {getNavItems().map((item) => (
                <button
                  key={item.key}
                  onClick={() => onPageChange(item.key)}
                  className={`inline-flex items-center px-2 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    currentPage === item.key
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title={item.label}
                >
                  <span className="mr-1">{item.icon}</span>
                  <span className="hidden xl:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right side - User info & Mobile menu button */}
          <div className="flex items-center space-x-2">
            {/* Desktop user info (minimal) */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1"
              >
                {t('auth.logout')}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Відкрити головне меню</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {getNavItems().map((item) => (
              <button
                key={item.key}
                onClick={() => handleMenuItemClick(item.key)}
                className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  currentPage === item.key
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
            
            {/* Mobile user info */}
            <div className="lg:hidden pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.position}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Вийти
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
