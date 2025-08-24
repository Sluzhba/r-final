import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAuth, useDepartments, useSchedules } from '../app/hooks';
import { fetchDepartments } from '../features/departments';
import { fetchSchedules } from '../features/schedule';
import { Department, Schedule, DutyAssignment } from '../shared/types';
import { dutyService } from '../features/duty/api/dutyService';
import { getUserWithContactById, mockDepartments } from '../shared/lib/mockData';
import { useToast } from '../shared/lib/ToastContext';
import { createDepartmentOptionsData } from '../shared/lib/departmentHierarchy';

const CurrentDutyPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { permissions, isLoading: authLoading } = useAuth();
  const { departments, isLoading: departmentsLoading } = useDepartments();
  const { schedules } = useSchedules();
  const { showToast } = useToast();

  const [currentDutyOfficers, setCurrentDutyOfficers] = useState<DutyAssignment[]>([]);
  const [isLoadingDuty, setIsLoadingDuty] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  // const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null); // Отключено пока

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchSchedules());
    loadCurrentDutyOfficers();

    // Автообновление каждые 5 минут (отключено пока)
    // const interval = setInterval(loadCurrentDutyOfficers, 5 * 60 * 1000);
    // setRefreshInterval(interval);

    // return () => {
    //   if (interval) clearInterval(interval);
    // };
  }, [dispatch]);

  const loadCurrentDutyOfficers = async () => {
    setIsLoadingDuty(true);
    try {
      const officers = await dutyService.getCurrentDutyOfficers();
      setCurrentDutyOfficers(officers);
    } catch (error) {
      console.error('Помилка завантаження чергових:', error);
      showToast({
        type: 'error',
        title: 'Помилка завантаження',
        message: 'Не вдалося завантажити список поточних чергових'
      });
    } finally {
      setIsLoadingDuty(false);
    }
  };

  const getAccessibleDepartments = (): Department[] => {
    if (!permissions?.canViewDepartments) {
      return [];
    }

    // Используем плоский список из mockDepartments, фильтруя по доступным
    const accessible = mockDepartments.filter(dept => 
      permissions.canViewDepartments.includes(dept.id)
    );
    
    return accessible;
  };

  const getDepartmentName = (departmentId: string): string => {
    const findDepartment = (deps: Department[]): Department | null => {
      for (const dept of deps) {
        if (dept.id === departmentId) return dept;
        if (dept.children) {
          const found = findDepartment(dept.children);
          if (found) return found;
        }
      }
      return null;
    };

    const department = findDepartment(departments);
    return department?.name || 'Невідомий підрозділ';
  };

  const getUserInfo = (userId: string) => {
    return getUserWithContactById(userId);
  };

  const getSchedule = (scheduleId: string): Schedule | undefined => {
    return schedules.find(s => s.id === scheduleId);
  };

  // Функция для проверки, является ли департамент дочерним (включая рекурсивно)
  const isDepartmentChild = (childDeptId: string, parentDeptId: string): boolean => {
    if (childDeptId === parentDeptId) return true;
    
    const childDept = mockDepartments.find(d => d.id === childDeptId);
    if (!childDept || !childDept.parentId) return false;
    
    // Рекурсивно проверяем родительские департаменты
    return isDepartmentChild(childDept.parentId, parentDeptId);
  };

  const getFilteredDutyOfficers = () => {
    if (!permissions?.canViewDepartments) return [];

    let filtered = currentDutyOfficers.filter(officer => 
      permissions.canViewDepartments.includes(officer.departmentId)
    );

    if (selectedDepartment !== 'all') {
      // Фільтруємо по вибраному підрозділу І всім його дочірнім підрозділам
      filtered = filtered.filter(officer => 
        isDepartmentChild(officer.departmentId, selectedDepartment)
      );
    }

    return filtered;
  };

  const groupByDepartment = (officers: DutyAssignment[]) => {
    const groups: { [departmentId: string]: DutyAssignment[] } = {};
    
    officers.forEach(officer => {
      if (!groups[officer.departmentId]) {
        groups[officer.departmentId] = [];
      }
      groups[officer.departmentId].push(officer);
    });

    return groups;
  };

  const accessibleDepartments = getAccessibleDepartments();
  const filteredOfficers = getFilteredDutyOfficers();
  const groupedOfficers = groupByDepartment(filteredOfficers);

  const currentTime = new Date().toLocaleString('uk-UA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (authLoading || departmentsLoading || isLoadingDuty) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Поточні чергові</h1>
              <p className="mt-2 text-gray-600">
                {currentTime}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={loadCurrentDutyOfficers}
                disabled={isLoadingDuty}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingDuty ? 'Оновлення...' : 'Оновити'}
              </button>
            </div>
          </div>
        </div>

        {/* Department Filter */}
        <div className="mb-6">
          <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Фильтр по подразделению:
          </label>
          <select
            id="department-filter"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Всі підрозділи</option>
            {createDepartmentOptionsData(accessibleDepartments).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Всього чергових
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {filteredOfficers.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🏢</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Застосованих відділів
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Object.keys(groupedOfficers).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">⏰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Останнє оновлення
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {new Date().toLocaleTimeString('uk-UA', {
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Duty Officers by Department */}
        {Object.keys(groupedOfficers).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              На сьогодні чергові не призначені
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOfficers).map(([departmentId, officers]) => (
              <div key={departmentId} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {getDepartmentName(departmentId)}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Чергових: {officers.length}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {officers.map((officer) => {
                    const user = getUserInfo(officer.userId);
                    const schedule = getSchedule(officer.scheduleId);
                    
                    return (
                      <div key={officer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {user.position}
                              </p>
                            </div>
                          </div>
                          <div
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: schedule?.color || '#gray' }}
                          >
                            {schedule?.name || 'Невідомий графік'}
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">📧</span>
                            <a href={`mailto:${user.email}`} className="hover:text-indigo-600">
                              {user.email}
                            </a>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">📞</span>
                            <a href={`tel:${user.phone}`} className="hover:text-indigo-600">
                              {user.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Auto-refresh notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Інформація автоматично оновлюється кожні 5 хвилин
        </div>
      </div>
    </div>
  );
};

export default CurrentDutyPage;
