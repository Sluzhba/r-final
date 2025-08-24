import React, { useState } from 'react';
import { useAppDispatch, useAuth } from '../../../app/hooks';
import { loginUser, clearError } from '../model/authSlice';
import { LoginForm } from '../../../shared/types';

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAuth();

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(loginUser(formData));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const loginAsDemo = (email: string) => {
    setFormData({ email, password: 'password' });
    dispatch(loginUser({ email, password: 'password' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Система чергувань
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Увійдіть в систему для продовження
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              Демо-акаунти
            </button>
          </div>

          {showDemo && (
            <div className="mt-4 space-y-2">
              <div className="text-sm text-gray-600 text-center mb-2">
                Для демо акаунти використовуйте будь-який з акаунтів (пароль: password):
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => loginAsDemo('admin@company.com')}
                  className="text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  <strong>Адміністратор:</strong> admin@company.com
                  <br />
                  <span className="text-gray-500">Повні права доступу</span>
                </button>
                <button
                  type="button"
                  onClick={() => loginAsDemo('manager@company.com')}
                  className="text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  <strong>Менеджер:</strong> manager@company.com
                  <br />
                  <span className="text-gray-500">Управління департаментом</span>
                </button>
                <button
                  type="button"
                  onClick={() => loginAsDemo('duty@company.com')}
                  className="text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  <strong>Черговий:</strong> duty@company.com
                  <br />
                  <span className="text-gray-500">Перегляд графіків чергувань</span>
                </button>
                <button
                  type="button"
                  onClick={() => loginAsDemo('employee@company.com')}
                  className="text-left px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  <strong>Співробітник:</strong> employee@company.com
                  <br />
                  <span className="text-gray-500">Тільки перегляд свого підрозділу</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
