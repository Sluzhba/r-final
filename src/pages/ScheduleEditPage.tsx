import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAuth, useDepartments, useSchedules, useDuty } from '../app/hooks';
import { fetchDepartments } from '../features/departments';
import { fetchSchedules } from '../features/schedule';
import { fetchDutyCalendar, bulkUpdateDutyAssignments, deleteDutyAssignment } from '../features/duty';
import { Department, Schedule, CalendarDay, DutyAssignment } from '../shared/types';
import { getUserName, getUsersByDepartment, mockDepartments } from '../shared/lib/mockData';
import { useToast } from '../shared/lib/ToastContext';
import { createDepartmentOptionsData } from '../shared/lib/departmentHierarchy';

const ScheduleEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { permissions } = useAuth();
  const { departments: _departments } = useDepartments(); // Не используется пока
  const { schedules } = useSchedules();
  const { calendar, isLoading } = useDuty();
  const { showToast } = useToast();

  // States
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [lastClickedDate, setLastClickedDate] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchSchedules());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDepartment) {
      dispatch(fetchDutyCalendar({
        year: viewDate.getFullYear(),
        month: viewDate.getMonth() + 1,
        departmentId: selectedDepartment,
      }));
    }
  }, [dispatch, viewDate, selectedDepartment]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const getEditableDepartments = (): Department[] => {
    if (!permissions?.canEditDepartments) return [];

    // Используем плоский список из mockDepartments, фильтруя по редактируемым
    return mockDepartments.filter(dept => 
      permissions.canEditDepartments.includes(dept.id)
    );
  };

  const getUsersInDepartment = () => {
    if (!selectedDepartment) return [];
    return getUsersByDepartment(selectedDepartment);
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
    
    for (let i = 0; i < 42; i++) {
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

  const handleDateClick = (date: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;

    if (isShiftPressed && lastClickedDate) {
      // Выбор диапазона дат (Shift+Click)
      const startDate = new Date(lastClickedDate);
      const endDate = new Date(date);
      const dates: string[] = [];
      
      const currentDate = new Date(Math.min(startDate.getTime(), endDate.getTime()));
      const finalDate = new Date(Math.max(startDate.getTime(), endDate.getTime()));
      
      while (currentDate <= finalDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setSelectedDates(prevDates => {
        const newDates = [...prevDates];
        dates.forEach(d => {
          if (!newDates.includes(d)) {
            newDates.push(d);
          }
        });
        return newDates;
      });
    } else if (isCtrlPressed) {
      // Множественный выбор (Ctrl+Click)
      setSelectedDates(prevDates => {
        if (prevDates.includes(date)) {
          return prevDates.filter(d => d !== date);
        } else {
          return [...prevDates, date];
        }
      });
      setLastClickedDate(date);
    } else {
      // Обычный выбор даты - заменяет предыдущий выбор
      setSelectedDates([date]);
      setLastClickedDate(date);
    }
  };

  const handleAssignmentClick = (assignment: DutyAssignment, event: React.MouseEvent) => {
    event.stopPropagation(); // Предотвращаем срабатывание handleDateClick
    
    // Заполняем форму данными из существующего назначения
    setSelectedUser(assignment.userId);
    setSelectedSchedule(assignment.scheduleId);
    setSelectedDepartment(assignment.departmentId);
    setSelectedDates([assignment.date]);
    setLastClickedDate(assignment.date);
  };

  const handleDeleteAssignment = async (assignment: DutyAssignment, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Заменяем confirm на более красивое уведомление с возможностью отмены
    if (window.confirm(`Видалити призначення ${getUserName(assignment.userId)} на ${new Date(assignment.date).toLocaleDateString()}?`)) {
      try {
        console.log('Видаляємо призначення:', assignment);

        // Видаляємо призначення через Redux
        const result = await dispatch(deleteDutyAssignment(assignment.id));
        
        if (deleteDutyAssignment.fulfilled.match(result)) {
          console.log('Призначення видалено, перезавантажуємо календар');

          // Перезагружаем календарь для отображения изменений
          await dispatch(fetchDutyCalendar({
            year: viewDate.getFullYear(),
            month: viewDate.getMonth() + 1,
            departmentId: selectedDepartment,
          }));
          console.log('Календар перезавантажено');
          showToast({
            type: 'success',
            title: 'Призначення видалено',
            message: `${getUserName(assignment.userId)} більше не чергує ${new Date(assignment.date).toLocaleDateString()}`
          });
        } else {
          console.error('Помилка при видаленні:', result);
          throw new Error('Не вдалося видалити призначення');
        }
      } catch (error) {
        console.error('Помилка при видаленні призначення:', error);
        showToast({
          type: 'error',
          title: 'Помилка видалення',
          message: 'Не вдалося видалити призначення чергування'
        });
      }
    }
  };

  const handleApplySchedule = async () => {
    if (!selectedUser || !selectedSchedule || selectedDates.length === 0 || !selectedDepartment) {
      showToast({
        type: 'warning',
        title: 'Заповніть всі поля',
        message: 'Будь ласка, виберіть користувача, графік і дати'
      });
      return;
    }

    try {
      await dispatch(bulkUpdateDutyAssignments({
        dates: selectedDates,
        userId: selectedUser,
        scheduleId: selectedSchedule,
        departmentId: selectedDepartment,
      }));

      // Перезагружаем календарь для отображения изменений
      await dispatch(fetchDutyCalendar({
        year: viewDate.getFullYear(),
        month: viewDate.getMonth() + 1,
        departmentId: selectedDepartment,
      }));

      // Очищаем выбор после применения
      setSelectedDates([]);
      setSelectedUser('');
      setSelectedSchedule('');
      
      showToast({
        type: 'success',
        title: 'Графік оновлено!',
        message: `Призначено чергувань: ${selectedDates.length}`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Помилка оновлення',
        message: 'Не вдалося оновити графік чергувань'
      });
    }
  };

  const clearSelection = () => {
    setSelectedDates([]);
    setLastClickedDate(null);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewDate(newDate);
    clearSelection();
  };

  const getSchedule = (scheduleId: string): Schedule | undefined => {
    return schedules.find(s => s.id === scheduleId);
  };

  const editableDepartments = getEditableDepartments();
  const calendarDays = generateCalendarDays();
  const departmentUsers = getUsersInDepartment();

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const dayNames = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  if (editableDepartments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">немає доступу для редагування</h2>
            <p className="text-gray-600">
              У вас немає прав для редагування графіків чергувань.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Редагування графіків чергувань</h1>
          <p className="mt-2 text-gray-600">
            Виберіть підрозділ, користувача, графік і дати для призначення чергувань
          </p>
          <div className="mt-3 text-sm text-gray-500">
            <p><strong>Управління календарем:</strong></p>
            <ul className="mt-1 space-y-1">
              <li>• <kbd className="px-1 py-0.5 bg-gray-100 rounded">Click</kbd> - обрати одну дату</li>
              <li>• <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+Click</kbd> - додати/прибрати дату з виділення</li>
              <li>• <kbd className="px-1 py-0.5 bg-gray-100 rounded">Shift+Click</kbd> - вибрати діапазон дат</li>
              <li>• Клікніть на призначення чергового для редагування</li>
              <li>• Наведіть на призначення і натисніть <kbd className="px-1 py-0.5 bg-gray-100 rounded">×</kbd> для видалення</li>
            </ul>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Department Selector */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Подразделение:
              </label>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedUser('');
                  clearSelection();
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Виберіть підрозділ</option>
                {createDepartmentOptionsData(editableDepartments).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Selector */}
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                Співробітник:
                {selectedDepartment && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({departmentUsers.length} співробітник{departmentUsers.length === 1 ? '' : departmentUsers.length < 5 ? 'а' : 'ів'} доступно)
                  </span>
                )}
              </label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={!selectedDepartment}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              >
                <option value="">
                  {selectedDepartment ? 'Виберіть співробітника' : 'Спочатку виберіть підрозділ'}
                </option>
                {departmentUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.position}
                  </option>
                ))}
              </select>
              {selectedDepartment && departmentUsers.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  В обраному підрозділі немає співробітників
                </p>
              )}
            </div>

            {/* Schedule Selector */}
            <div>
              <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-2">
                Графік:
              </label>
              <select
                id="schedule"
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Виберіть графік</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleApplySchedule}
                disabled={!selectedUser || !selectedSchedule || selectedDates.length === 0}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Застосувати графік
              </button>
              <button
                onClick={clearSelection}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Очистити вибір
              </button>
            </div>
          </div>

          {/* Selection Info */}
          {selectedDates.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Вибрано дат: <strong>{selectedDates.length}</strong>
                {isShiftPressed && (
                  <span className="ml-2 text-blue-600">
                    (Shift зажат - режим вибору діапазону)
                  </span>
                )}
                {isCtrlPressed && (
                  <span className="ml-2 text-blue-600">
                    (Ctrl зажат - режим множинного вибору)
                  </span>
                )}
              </p>
              <div className="mt-1 text-xs text-blue-600">
                Даты: {selectedDates.map(date => new Date(date).toLocaleDateString()).join(', ')}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Інструкція:</strong> Клікніть по датам для вибору.
              Зажміть Shift і клікніть на іншу дату для вибору діапазону.
            </p>
          </div>
        </div>

        {/* Calendar */}
        {selectedDepartment ? (
          <div className="bg-white shadow rounded-lg">
            {/* Calendar Header */}
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
                    Сьогодні
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
              {isLoading ? (
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
                  {calendarDays.map((day, index) => {
                    const isSelected = selectedDates.includes(day.date);
                    const dayDate = new Date(day.date + 'T00:00:00'); // Добавляем время для корректного парсинга
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    dayDate.setHours(0, 0, 0, 0);
                    const isPast = dayDate < today;
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
                        className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors ${
                          !day.isCurrentMonth 
                            ? 'bg-gray-50 cursor-not-allowed' 
                            : isSelected
                            ? 'bg-indigo-100 border-indigo-300'
                            : isPast
                            ? 'bg-gray-100 hover:bg-gray-200'
                            : 'bg-white hover:bg-gray-50'
                        } ${day.isToday ? 'ring-2 ring-indigo-500' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          !day.isCurrentMonth ? 'text-gray-400' : 
                          day.isToday ? 'text-indigo-600' : 
                          isPast ? 'text-gray-500' :
                          'text-gray-900'
                        }`}>
                          {new Date(day.date + 'T00:00:00').getDate()}
                          {isSelected && (
                            <span className="ml-1 text-indigo-600">●</span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {day.assignments.map((assignment) => {
                            const schedule = getSchedule(assignment.scheduleId);
                            return (
                              <div
                                key={assignment.id}
                                className="text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 flex items-center justify-between group"
                                style={{ backgroundColor: schedule?.color || '#gray' }}
                                title={`${getUserName(assignment.userId)} - ${schedule?.name}. Клікніть для редагування`}
                                onClick={(e) => handleAssignmentClick(assignment, e)}
                              >
                                <span className="truncate">
                                  {getUserName(assignment.userId)}
                                </span>
                                <button
                                  onClick={(e) => handleDeleteAssignment(assignment, e)}
                                  className="ml-1 opacity-0 group-hover:opacity-100 text-white hover:text-red-200 transition-opacity"
                                  title="Видалити призначення"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              Виберіть підрозділ для початку редагування графіків
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleEditPage;
