import React, { useState } from 'react';
import { useAppDispatch } from '../app/hooks';
import { loginUser } from '../features/auth/model/authSlice';
import { useTranslation } from '../shared/lib/useTranslation';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // После успешной авторизации Redux обновит состояние и покажет главную страницу
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginUser = async (userEmail: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Используем Redux action для авторизации
      await dispatch(loginUser({ email: userEmail, password: 'password' })).unwrap();
      // После успешной авторизации Redux обновит состояние и покажет главную страницу
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.login')}</h2>
            <p className="text-gray-600">{t('auth.systemTitle')}</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('auth.enterEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('auth.enterPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('loading') : t('auth.loginButton')}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.demoAccounts')}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => quickLoginUser('admin@company.com')}
                disabled={isLoading}
                className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <span>{t('roles.admin')}</span>
                <span className="text-xs text-gray-500">admin@company.com</span>
              </button>
              
              <button
                onClick={() => quickLoginUser('manager@company.com')}
                disabled={isLoading}
                className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <span>Менеджер IT</span>
                <span className="text-xs text-gray-500">manager@company.com</span>
              </button>
              
              <button
                onClick={() => quickLoginUser('duty@company.com')}
                disabled={isLoading}
                className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <span>{t('roles.dutyOfficer')}</span>
                <span className="text-xs text-gray-500">duty@company.com</span>
              </button>
              
              <button
                onClick={() => quickLoginUser('alexandrov@company.com')}
                disabled={isLoading}
                className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <span>{t('roles.employee')}</span>
                <span className="text-xs text-gray-500">alexandrov@company.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
