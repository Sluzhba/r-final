import { Schedule, ScheduleType, CreateScheduleForm } from '../../../shared/types';

// Mock data
const mockSchedules: Schedule[] = [
  {
    id: '1',
    name: '8:00 - 20:00',
    startTime: '08:00',
    endTime: '20:00',
    color: '#4CAF50',
    type: ScheduleType.WORK,
    isActive: true,
  },
  {
    id: '2',
    name: '8:00 - 8:00 (доба)',
    startTime: '08:00',
    endTime: '08:00',
    color: '#2196F3',
    type: ScheduleType.WORK,
    isActive: true,
  },
  {
    id: '3',
    name: '20:00 - 8:00 (ніч)',
    startTime: '20:00',
    endTime: '08:00',
    color: '#3F51B5',
    type: ScheduleType.WORK,
    isActive: true,
  },
  {
    id: '4',
    name: 'Вихідний',
    startTime: '00:00',
    endTime: '00:00',
    color: '#9E9E9E',
    type: ScheduleType.DAY_OFF,
    isActive: true,
  },
  {
    id: '5',
    name: 'Відпустка',
    startTime: '00:00',
    endTime: '00:00',
    color: '#FF9800',
    type: ScheduleType.VACATION,
    isActive: true,
  },
  {
    id: '6',
    name: 'Лікарняний',
    startTime: '00:00',
    endTime: '00:00',
    color: '#F44336',
    type: ScheduleType.SICK_LEAVE,
    isActive: true,
  },
];

class ScheduleService {
  private schedules: Schedule[] = JSON.parse(JSON.stringify(mockSchedules));

  async getSchedules(): Promise<Schedule[]> {
    // Имитация запроса к серверу
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(JSON.stringify(this.schedules.filter(s => s.isActive)));
  }

  async getScheduleById(id: string): Promise<Schedule | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const schedule = this.schedules.find(s => s.id === id);
    return schedule ? JSON.parse(JSON.stringify(schedule)) : null;
  }

  async createSchedule(scheduleData: CreateScheduleForm): Promise<Schedule> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      ...scheduleData,
      isActive: true,
    };

    this.schedules.push(newSchedule);
    return newSchedule;
  }

  async updateSchedule(id: string, data: Partial<Schedule>): Promise<Schedule> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const scheduleIndex = this.schedules.findIndex(s => s.id === id);
    if (scheduleIndex === -1) {
      throw new Error('Графік не знайдено');
    }

    this.schedules[scheduleIndex] = { ...this.schedules[scheduleIndex], ...data };
    return JSON.parse(JSON.stringify(this.schedules[scheduleIndex]));
  }

  async deleteSchedule(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const scheduleIndex = this.schedules.findIndex(s => s.id === id);
    if (scheduleIndex === -1) {
      throw new Error('Графік не знайдено');
    }

    // Мягкое удаление - просто помечаем как неактивный
    this.schedules[scheduleIndex].isActive = false;
  }

  async getWorkSchedules(): Promise<Schedule[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.schedules.filter(s => s.type === ScheduleType.WORK && s.isActive);
  }

  async getNonWorkSchedules(): Promise<Schedule[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.schedules.filter(s => s.type !== ScheduleType.WORK && s.isActive);
  }
}

export const scheduleService = new ScheduleService();
