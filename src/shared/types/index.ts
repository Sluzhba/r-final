// Базовые типы для системы дежурств

export interface User {
  id: string;
  email: string;
  name: string;
  position: string;
  departmentId: string;
  role: UserRole;
  avatar?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager', 
  DUTY_OFFICER = 'duty_officer',
  EMPLOYEE = 'employee'
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
  managerId: string;
  level: DepartmentLevel;
  children?: Department[];
}

export enum DepartmentLevel {
  COMPANY = 'company',
  DEPARTMENT = 'department',
  DIVISION = 'division',
  GROUP = 'group'
}

export interface Schedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  type: ScheduleType;
  isActive: boolean;
}

export enum ScheduleType {
  WORK = 'work',
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave',
  DAY_OFF = 'day_off'
}

export interface DutyAssignment {
  id: string;
  userId: string;
  departmentId: string;
  date: string;
  scheduleId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DutyCalendar {
  year: number;
  month: number;
  assignments: DutyAssignment[];
}

export interface UserPermissions {
  canViewDepartments: string[]; // ID департаментов, которые может просматривать
  canEditDepartments: string[]; // ID департаментов, которые может редактировать
  canManageUsers: boolean;
  canManageSchedules: boolean;
  canManageDepartments: boolean;
}

export interface AuthState {
  user: User | null;
  permissions: UserPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  reminderDaysBefore: number;
  isEnabled: boolean;
  departmentIds: string[];
}

export interface DutyNotification {
  id: string;
  recipientId: string;
  departmentId: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export enum NotificationType {
  SCHEDULE_REMINDER = 'schedule_reminder',
  DUTY_ASSIGNMENT = 'duty_assignment',
  SCHEDULE_CHANGE = 'schedule_change'
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  position: string;
  departmentId: string;
  role: UserRole;
}

export interface CreateDepartmentForm {
  name: string;
  parentId?: string;
  managerId: string;
  level: DepartmentLevel;
}

export interface CreateScheduleForm {
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  type: ScheduleType;
}

// Calendar types
export interface CalendarDay {
  date: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  assignments: DutyAssignment[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

// UI State types
export interface CalendarState {
  currentDate: string; // ISO date string instead of Date object
  selectedDate: string | null; // ISO date string instead of Date object
  viewMode: 'month' | 'year';
  selectedDepartment: string | null;
}

export interface ScheduleEditState {
  selectedDays: string[];
  selectedSchedule: string | null;
  isMultiSelect: boolean;
}
