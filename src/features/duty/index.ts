// Public API модуля duty
export { default as dutySlice } from './model/dutySlice';
export { 
  fetchDutyCalendar, 
  createDutyAssignment, 
  updateDutyAssignment, 
  deleteDutyAssignment, 
  bulkUpdateDutyAssignments,
  clearError, 
  setCurrentDate, 
  setSelectedDate, 
  setViewMode, 
  setSelectedDepartment 
} from './model/dutySlice';
export { dutyService } from './api/dutyService';
