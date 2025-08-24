import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAuth, useDepartments, useSchedules } from '../app/hooks';
import { fetchDepartments } from '../features/departments';
import { fetchSchedules } from '../features/schedule';
import { DutyAssignment, Department, UserRole } from '../shared/types';
import { dutyService } from '../features/duty/api/dutyService';
import { getUserName } from '../shared/lib/mockData';
import { useToast } from '../shared/lib/ToastContext';
import { useTranslation } from '../shared/lib/useTranslation';

const Dashboard: React.FC<{ onPageChange?: (page: string) => void }> = ({ onPageChange }) => {
  const dispatch = useAppDispatch();
  const { permissions, user: currentUser } = useAuth();
  const { departments, isLoading: departmentsLoading } = useDepartments();
  const { schedules, isLoading: schedulesLoading } = useSchedules();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [currentDutyOfficers, setCurrentDutyOfficers] = useState<DutyAssignment[]>([]);
  const [isLoadingDuty, setIsLoadingDuty] = useState(false);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchSchedules());
    loadCurrentDutyOfficers();
  }, [dispatch, currentUser]);

  const loadCurrentDutyOfficers = async () => {
    setIsLoadingDuty(true);
    try {
      // Админы и дежурные видят всех дежурных (без фильтра)
      // Менеджеры и сотрудники видят дежурных своего департамента и дочерних
      const isAdmin = currentUser?.role === UserRole.ADMIN;
      const isDutyOfficer = currentUser?.role === UserRole.DUTY_OFFICER;
      const departmentFilter = (isAdmin || isDutyOfficer) ? undefined : currentUser?.departmentId;
      
      const officers = await dutyService.getCurrentDutyOfficers(departmentFilter);
      setCurrentDutyOfficers(officers);
    } catch (error) {
      console.error('Помилка завантаження чергових:', error);
      showToast({
        type: 'error',
        title: 'Помилка завантаження',
        message: 'Не вдалося завантажити список чергових'
      });
    } finally {
      setIsLoadingDuty(false);
    }
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

  const getScheduleName = (scheduleId: string): { name: string; color: string } => {
    const schedule = schedules.find(s => s.id === scheduleId);
    return {
      name: schedule?.name || 'Невідомий графік',
      color: schedule?.color || '#gray',
    };
  };

  const getAccessibleDepartments = (): Department[] => {
    if (!permissions?.canViewDepartments) return [];

    const findAccessibleDepartments = (deps: Department[]): Department[] => {
      const result: Department[] = [];
      for (const dept of deps) {
        if (permissions.canViewDepartments.includes(dept.id)) {
          result.push(dept);
        }
        if (dept.children) {
          result.push(...findAccessibleDepartments(dept.children));
        }
      }
      return result;
    };

    return findAccessibleDepartments(departments);
  };

  const getFilteredDutyOfficers = () => {
    console.log('Filtering duty officers:');
    console.log('- permissions:', permissions);
    console.log('- currentDutyOfficers:', currentDutyOfficers);
    
    if (!permissions?.canViewDepartments) {
      console.log('No canViewDepartments permission');
      return [];
    }

    const filtered = currentDutyOfficers.filter(officer => {
      const canView = permissions.canViewDepartments.includes(officer.departmentId);
      console.log(`Officer ${officer.userId} in dept ${officer.departmentId}: canView=${canView}`);
      return canView;
    });
    
    console.log('Filtered officers result:', filtered);
    return filtered;
  };

  const today = new Date().toLocaleDateString('uk-UA', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric',
  });

  if (departmentsLoading || schedulesLoading || isLoadingDuty) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const filteredOfficers = getFilteredDutyOfficers();
  const accessibleDepartments = getAccessibleDepartments();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="mt-2 text-gray-600">{t('dashboard.today')}: {today}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Чергових сьогодні
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
                      Доступних підрозділів
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {accessibleDepartments.length}
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
                      Типів графіків
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {schedules.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Duty Officers */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Поточні чергові
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Список чергових на сьогодні по всім доступним підрозділам
            </p>
          </div>
          
          {filteredOfficers.length === 0 ? (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              На сьогодні чергові не призначені
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredOfficers.map((officer) => {
                const schedule = getScheduleName(officer.scheduleId);
                return (
                  <li key={officer.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {getUserName(officer.userId).split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getUserName(officer.userId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getDepartmentName(officer.departmentId)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: schedule.color }}
                        >
                          {schedule.name}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Швидкі дії
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => onPageChange?.('calendar')}
              className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="text-sm font-medium text-gray-900">Календар чергувань</div>
              </div>
            </button>
            
            {permissions?.canEditDepartments && permissions.canEditDepartments.length > 0 && (
              <button 
                onClick={() => onPageChange?.('schedule-edit')}
                className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">✏️</div>
                  <div className="text-sm font-medium text-gray-900">Редагувати графік</div>
                </div>
              </button>
            )}
            
            <button 
              onClick={() => onPageChange?.('current-duty')}
              className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-sm font-medium text-gray-900">Поточні чергові</div>
              </div>
            </button>
            
            {permissions?.canManageSchedules && (
              <button 
                onClick={() => onPageChange?.('admin-schedules')}
                className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">⏰</div>
                  <div className="text-sm font-medium text-gray-900">Управління графіками</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
