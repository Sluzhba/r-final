import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAuth, useDepartments, useSchedules, useDuty } from '../app/hooks';
import { fetchDepartments } from '../features/departments';
import { fetchSchedules } from '../features/schedule';
import { fetchDutyCalendar, setSelectedDepartment } from '../features/duty';
import { Department, Schedule, CalendarDay } from '../shared/types';
import { getUserName, mockDepartments } from '../shared/lib/mockData';
import { createDepartmentOptionsData } from '../shared/lib/departmentHierarchy';

const CalendarPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { permissions } = useAuth();
  const { departments: _departments, isLoading: departmentsLoading } = useDepartments(); // Пока не используется
  const { schedules } = useSchedules();
  const { calendar, calendarState, isLoading: dutyLoading } = useDuty();

  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchSchedules());
  }, [dispatch]);

  useEffect(() => {
    if (calendarState.selectedDepartment) {
      dispatch(fetchDutyCalendar({
        year: viewDate.getFullYear(),
        month: viewDate.getMonth() + 1,
        departmentId: calendarState.selectedDepartment,
      }));
    }
  }, [dispatch, viewDate, calendarState.selectedDepartment]);

  const getAccessibleDepartments = (): Department[] => {
    if (!permissions?.canViewDepartments) return [];

    // Используем плоский список из mockDepartments, фильтруя по доступным
    return mockDepartments.filter(dept => 
      permissions.canViewDepartments.includes(dept.id)
    );
  };

  const getSchedule = (scheduleId: string): Schedule | undefined => {
    return schedules.find(s => s.id === scheduleId);
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // Получаем сегодняшнюю дату в локальном часовом поясе
    const today = new Date();
    const todayDateString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const dateString = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      
      // Сравниваем строки дат вместо объектов Date
      const isToday = dateString === todayDateString;
      
      const dayAssignments = calendar?.assignments.filter(a => a.date === dateString) || [];
      
      days.push({
        date: dateString,
        isToday,
        isCurrentMonth,
        assignments: dayAssignments,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewDate(newDate);
  };

  const accessibleDepartments = getAccessibleDepartments();
  const calendarDays = generateCalendarDays();

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  if (departmentsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Календар чергувань</h1>
          <p className="mt-2 text-gray-600">
            Перегляд і планування чергувань по підрозділах
          </p>
        </div>

        {/* Department Selector */}
        <div className="mb-6">
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Виберіть підрозділ:
          </label>
          <select
            id="department"
            value={calendarState.selectedDepartment || ''}
            onChange={(e) => dispatch(setSelectedDepartment(e.target.value || null))}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Виберіть підрозділ</option>
            {createDepartmentOptionsData(accessibleDepartments).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {!calendarState.selectedDepartment ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              Виберіть підрозділ для перегляду календаря чергувань
            </div>
          </div>
        ) : (
          <>
            {/* Calendar Header */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setViewDate(new Date())}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Сегодня
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {dutyLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {dayNames.map((day) => (
                      <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={`min-h-[120px] p-2 border border-gray-200 ${
                          !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                        } ${day.isToday ? 'ring-2 ring-indigo-500' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          !day.isCurrentMonth ? 'text-gray-400' : 
                          day.isToday ? 'text-indigo-600' : 'text-gray-900'
                        }`}>
                          {new Date(day.date).getDate()}
                        </div>
                        
                        <div className="space-y-1">
                          {day.assignments.map((assignment) => {
                            const schedule = getSchedule(assignment.scheduleId);
                            return (
                              <div
                                key={assignment.id}
                                className="text-xs p-1 rounded text-white truncate"
                                style={{ backgroundColor: schedule?.color || '#gray' }}
                                title={`${getUserName(assignment.userId)} - ${schedule?.name}`}
                              >
                                {getUserName(assignment.userId)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Легенда</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: schedule.color }}
                    ></div>
                    <span className="text-sm text-gray-700">{schedule.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
