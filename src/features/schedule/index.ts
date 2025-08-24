// Public API модуля schedule
export { default as scheduleSlice } from './model/scheduleSlice';
export { 
  fetchSchedules, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule,
  clearError 
} from './model/scheduleSlice';
export { scheduleService } from './api/scheduleService';
