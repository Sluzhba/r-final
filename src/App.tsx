import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { useAppDispatch, useAuth } from './app/hooks';
import { checkAuth } from './features/auth/model/authSlice';
import { ToastProvider } from './shared/lib/ToastContext';
import ToastContainer from './shared/ui/ToastContainer';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import ScheduleEditPage from './pages/ScheduleEditPage';
import AdminSchedulesPage from './pages/AdminSchedulesPage';
import CurrentDutyPage from './pages/CurrentDutyPage';
import UsersPage from './pages/UsersPage';
import DepartmentsPage from './pages/DepartmentsPage';
import './shared/styles/App.css';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'current-duty':
        return <CurrentDutyPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'admin-schedules':
        return <AdminSchedulesPage />;
      case 'schedule-edit':
        return <ScheduleEditPage />;
      case 'users':
        return <UsersPage />;
      case 'departments':
        return <DepartmentsPage />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <MainLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppContent />
        <ToastContainer />
      </ToastProvider>
    </Provider>
  );
};

export default App;
