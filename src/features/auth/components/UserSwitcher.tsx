import React from 'react';
import { useAppDispatch, useAuth } from '../../../app/hooks';
import { loginUser } from '../model/authSlice';

const UserSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const authState = useAuth();

  const users = [
    { email: 'admin@company.com', name: 'Адміністратор' },
    { email: 'manager@company.com', name: 'Менеджер ІТ' },
    { email: 'duty@company.com', name: 'Черговий' },
  ];

  const switchUser = (email: string) => {
    // Очищаем localStorage
    localStorage.clear();
    // Логинимся как новый пользователь
    dispatch(loginUser({ email, password: 'password' }));
  };

  console.log('UserSwitcher - Auth State:', authState);

  return (
    <div className="fixed top-4 right-4 bg-white border rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-sm font-semibold mb-2">Переключити користувача:</h3>
      <div className="text-xs mb-2 p-2 bg-gray-100 rounded">
        <strong>Користувач:</strong> {authState.user?.name || 'Не авторизовано'}<br/>
        <strong>Права:</strong> {authState.permissions?.canViewDepartments?.length || 0} відділів
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <button
            key={user.email}
            onClick={() => switchUser(user.email)}
            className="block w-full text-left px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded transition-colors"
          >
            {user.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSwitcher;
