import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchDepartments } from '../features/departments';
import { User, UserRole } from '../shared/types';
import { OrganizationTree } from '../features/departments/components/OrganizationTree';
import { mockUsers } from '../shared/lib/mockData';
import { createDepartmentOptionsData } from '../shared/lib/departmentHierarchy';

// Схема валидации для формы пользователя
const userValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Ім\'я повинно містити мінімум 2 символа')
    .max(100, 'Ім\'я не повинно перевищувати 100 символів')
    .matches(/^[а-яё\s]+$/i, 'Ім\'я повинно містити тільки українські букви і пробіли')
    .required('ПІБ обов\'язково для заповнення'),

  email: Yup.string()
    .email('Некоректний формат email')
    .required('Email обов\'язковий для заповнення'),

  position: Yup.string()
    .min(2, 'Посада повинна містити мінімум 2 символа')
    .max(100, 'Посада не повинна перевищувати 100 символів')
    .required('Посада обов\'язкова для заповнення'),

  departmentId: Yup.string()
    .required('Підрозділ обов\'язковий для вибору'),

  role: Yup.string()
    .oneOf(Object.values(UserRole), 'Оберіть коректну роль')
    .required('Роль обов\'язкова для вибору')
});

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector(state => state.auth);
  const { departments } = useAppSelector(state => state.departments);
  
  const [users, setUsers] = useState<User[]>(mockUsers);
  
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [groupByDepartment, setGroupByDepartment] = useState(true);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);

  const ROLE_LABELS = {
    [UserRole.ADMIN]: 'Адміністратор',
    [UserRole.MANAGER]: 'Менеджер',
    [UserRole.DUTY_OFFICER]: 'Черговий',
    [UserRole.EMPLOYEE]: 'Співробітник'
  };

  const ROLE_COLORS = {
    [UserRole.ADMIN]: 'bg-red-100 text-red-800',
    [UserRole.MANAGER]: 'bg-yellow-100 text-yellow-800',
    [UserRole.DUTY_OFFICER]: 'bg-blue-100 text-blue-800',
    [UserRole.EMPLOYEE]: 'bg-green-100 text-green-800'
  };

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(user => user.departmentId === departmentFilter);
    }
    setFilteredUsers(filtered);
  }, [users, searchTerm, departmentFilter]);

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Невідомо';
  };

  const groupUsersByDepartment = () => {
    const grouped: { [key: string]: User[] } = {};
    filteredUsers.forEach(user => {
      const deptName = getDepartmentName(user.departmentId);
      if (!grouped[deptName]) {
        grouped[deptName] = [];
      }
      grouped[deptName].push(user);
    });
    return grouped;
  };

  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Доступ заборонено</h2>
            <p className="mt-2 text-gray-600">
              У вас немає прав для управління користувачами.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Управління користувачами
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Додати користувача
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Пошук
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ім'я, email або посада"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Підрозділ
                </label>
                <select
                  id="department"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="all">Всі підрозділи</option>
                  {createDepartmentOptionsData(departments).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {viewMode === 'list' && (
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={groupByDepartment}
                      onChange={(e) => setGroupByDepartment(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Групувати за підрозділами</span>
                  </label>
                </div>
              )}
            </div>

            {/* Перемикач режимів перегляду */}
            <div className="mb-4 flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Режим перегляду:</span>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-4 py-2 text-sm font-medium border rounded-l-md ${
                    viewMode === 'tree'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🌳 Дерево
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium border border-l-0 rounded-r-md ${
                    viewMode === 'list'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📋 Список
                </button>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('all');
              }}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Скинути фільтри
            </button>
          </div>
        </div>

        {/* Відображення даних */}
        {viewMode === 'tree' ? (
          // Древовидне відображення
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OrganizationTree
                departments={departments}
                users={filteredUsers}
                onUserSelect={(user) => setSelectedUserId(user.id)}
                selectedUserId={selectedUserId}
              />
            </div>
            {selectedUserId && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Інформація про співробітника</h3>
                {(() => {
                  const user = filteredUsers.find(u => u.id === selectedUserId) || users.find(u => u.id === selectedUserId);
                  if (!user) return null;
                  return (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Имя</label>
                        <p className="text-sm text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Посада</label>
                        <p className="text-sm text-gray-900">{user.position}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Роль</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </div>
                      <div className="pt-3 flex space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Редагувати
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
                              setUsers(users.filter(u => u.id !== user.id));
                              setSelectedUserId(undefined);
                            }
                          }}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Видалити
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          // Спискове відображення
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {groupByDepartment ? (
            // Групування за підрозділами
            <div className="divide-y divide-gray-200">
              {Object.entries(groupUsersByDepartment()).map(([deptName, deptUsers]) => (
                <div key={deptName}>
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {deptName} ({deptUsers.length} співробітник{deptUsers.length === 1 ? '' : deptUsers.length < 5 ? 'и' : 'ів'})
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {deptUsers.map((user) => (
                      <li key={user.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name}
                                  </div>
                                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                                    {ROLE_LABELS[user.role]}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.position}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                              >
                                Редагувати
                              </button>
                              {user.id !== currentUser.id && (
                                <button
                                  onClick={() => {
                                    if (confirm('Ви впевнені, що хочете видалити цього користувача?')) {
                                      setUsers(users.filter(u => u.id !== user.id));
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                                >
                                  Видалити
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            // Обычный список
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li key={user.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                              {ROLE_LABELS[user.role]}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.position} • {getDepartmentName(user.departmentId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Редагувати
                        </button>
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => {
                              if (confirm('Ви впевнені, що хочете видалити цього користувача?')) {
                                setUsers(users.filter(u => u.id !== user.id));
                              }
                            }}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Користувачі не знайдені</p>
            </div>
          )}
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || editingUser) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingUser ? 'Редагувати користувача' : 'Додати нового користувача'}
                </h3>
                
                <Formik
                  initialValues={{
                    name: editingUser?.name || '',
                    email: editingUser?.email || '',
                    position: editingUser?.position || '',
                    departmentId: editingUser?.departmentId || '',
                    role: editingUser?.role || UserRole.EMPLOYEE
                  }}
                  validationSchema={userValidationSchema}
                  onSubmit={(values, { setSubmitting }) => {
                    if (editingUser) {
                      // Редагування існуючого користувача
                      const updatedUsers = users.map(user =>
                        user.id === editingUser.id
                          ? { ...user, ...values }
                          : user
                      );
                      setUsers(updatedUsers);
                    } else {
                      // Створення нового користувача
                      const newUser: User = {
                        id: Date.now().toString(),
                        ...values
                      };
                      setUsers([...users, newUser]);
                    }

                    // Закрываем модальное окно
                    setShowAddModal(false);
                    setEditingUser(null);
                    setSubmitting(false);
                  }}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          ПІБ
                        </label>
                        <Field
                          name="name"
                          type="text"
                          placeholder="Введіть повне ім'я"
                          className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                            errors.name && touched.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <Field
                          name="email"
                          type="email"
                          placeholder="user@company.com"
                          className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                            errors.email && touched.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Посада
                        </label>
                        <Field
                          name="position"
                          type="text"
                          placeholder="Наприклад: Програміст"
                          className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                            errors.position && touched.position ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <ErrorMessage name="position" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Підрозділ
                        </label>
                        <Field
                          as="select"
                          name="departmentId"
                          className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                            errors.departmentId && touched.departmentId ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Виберіть підрозділ</option>
                          {createDepartmentOptionsData(departments).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="departmentId" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Роль
                        </label>
                        <Field
                          as="select"
                          name="role"
                          className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                            errors.role && touched.role ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value={UserRole.EMPLOYEE}>Співробітник</option>
                          <option value={UserRole.DUTY_OFFICER}>Черговий</option>
                          <option value={UserRole.MANAGER}>Менеджер</option>
                          <option value={UserRole.ADMIN}>Адміністратор</option>
                        </Field>
                        <ErrorMessage name="role" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddModal(false);
                            setEditingUser(null);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Скасувати
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Збереження...' : (editingUser ? 'Зберегти' : 'Додати')}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}