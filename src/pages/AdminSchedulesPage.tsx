import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAuth, useSchedules } from '../app/hooks';
import { fetchSchedules, createSchedule, updateSchedule, deleteSchedule } from '../features/schedule/model/scheduleSlice';
import { Schedule, ScheduleType, CreateScheduleForm, UserRole } from '../shared/types';

const AdminSchedulesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { schedules, isLoading, error } = useSchedules();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<CreateScheduleForm>({
    name: '',
    startTime: '',
    endTime: '',
    color: '#3B82F6',
    type: ScheduleType.WORK,
  });

  useEffect(() => {
    dispatch(fetchSchedules());
  }, [dispatch]);

  const handleOpenModal = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        name: schedule.name,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        color: schedule.color,
        type: schedule.type,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        name: '',
        startTime: '',
        endTime: '',
        color: '#3B82F6',
        type: ScheduleType.WORK,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSchedule) {
        await dispatch(updateSchedule({ id: editingSchedule.id, data: formData }));
      } else {
        await dispatch(createSchedule(formData));
      }
      handleCloseModal();
    } catch (error) {
      console.error('Помилка при збереженні графіка:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей графік?')) {
      try {
        await dispatch(deleteSchedule(id));
      } catch (error) {
        console.error('Помилка при видаленні графіка:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getScheduleTypeLabel = (type: ScheduleType): string => {
    switch (type) {
      case ScheduleType.WORK:
        return 'Робочий';
      case ScheduleType.VACATION:
        return 'Відпустка';
      case ScheduleType.SICK_LEAVE:
        return 'Лікарняний';
      case ScheduleType.DAY_OFF:
        return 'Вихідний';
      default:
        return 'Невідомо';
    }
  };

  const formatTime = (startTime: string, endTime: string, type: ScheduleType): string => {
    if (type === ScheduleType.VACATION || type === ScheduleType.SICK_LEAVE || type === ScheduleType.DAY_OFF) {
      return 'Весь день';
    }
    
    if (startTime === endTime) {
      return 'Доба';
    }
    
    return `${startTime} - ${endTime}`;
  };

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Доступ заборонено</h2>
            <p className="text-gray-600">
              Тільки адміністратори можуть керувати графіками.
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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Управління графіками</h1>
            <p className="mt-2 text-gray-600">
              Створення та редагування типів графіків чергувань
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Додати графік
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* Schedules List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <li key={schedule.id}>
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-6 h-6 rounded-full mr-4"
                        style={{ backgroundColor: schedule.color }}
                      ></div>
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {schedule.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getScheduleTypeLabel(schedule.type)} • {formatTime(schedule.startTime, schedule.endTime, schedule.type)}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(schedule)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingSchedule ? 'Редагувати графік' : 'Додати графік'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Назва
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Наприклад: 8:00 - 20:00"
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Тип графіка
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={ScheduleType.WORK}>Робочий</option>
                      <option value={ScheduleType.VACATION}>Відпустка</option>
                      <option value={ScheduleType.SICK_LEAVE}>Лікарняний</option>
                      <option value={ScheduleType.DAY_OFF}>Вихідний</option>
                    </select>
                  </div>

                  {formData.type === ScheduleType.WORK && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Час початку
                          </label>
                          <input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Час закінчення
                          </label>
                          <input
                            type="time"
                            id="endTime"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        * Якщо час початку і закінчення однакове, графік буде вважатися добовим
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                        Колір
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="h-10 w-16 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Скасувати
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {editingSchedule ? 'Зберегти' : 'Створити'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSchedulesPage;
