import { User, Department, UserRole, DepartmentLevel } from '../types';

// Централизованные mock данные департментов
export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Компанія "Технології"',
    managerId: '1',
    level: DepartmentLevel.COMPANY,
  },
  {
    id: '2',
    name: 'ІТ Департамент',
    parentId: '1',
    managerId: '2',
    level: DepartmentLevel.DEPARTMENT,
  },
  {
    id: '3',
    name: 'Відділ розробки',
    parentId: '2',
    managerId: '3',
    level: DepartmentLevel.DIVISION,
  },
  {
    id: '4',
    name: 'Група Backend',
    parentId: '3',
    managerId: '11',
    level: DepartmentLevel.GROUP,
  },
  {
    id: '5',
    name: 'Група Frontend',
    parentId: '3',
    managerId: '14',
    level: DepartmentLevel.GROUP,
  },
  {
    id: '6',
    name: 'Відділ тестування',
    parentId: '2',
    managerId: '6',
    level: DepartmentLevel.DIVISION,
  },
  {
    id: '7',
    name: 'Група технічної підтримки',
    parentId: '6',
    managerId: '16',
    level: DepartmentLevel.GROUP,
  },
];

// Централизованные mock данные пользователей
export const mockUsers: User[] = [
  // Группа Backend (departmentId: '4')
  { 
    id: '11', 
    name: 'Александров Сергій Петрович', 
    email: 'alexandrov@company.com', 
    position: 'Senior Backend розробник', 
    departmentId: '4', 
    role: UserRole.EMPLOYEE 
  },
  { 
    id: '12', 
    name: 'Борисова Тетяна Миколаївна', 
    email: 'borisova@company.com', 
    position: 'Backend розробник', 
    departmentId: '4', 
    role: UserRole.EMPLOYEE 
  },
  {
    id: '13',
    name: 'Василів Андрій Михайлович',
    email: 'vasiliev@company.com',
    position: 'Backend розробник',
    departmentId: '4',
    role: UserRole.EMPLOYEE 
  },
  // Группа Frontend (departmentId: '5')
  { 
    id: '14', 
    name: 'Григорова Ольга Володимирівна', 
    email: 'grigorieva@company.com', 
    position: 'Senior Frontend розробник', 
    departmentId: '5', 
    role: UserRole.EMPLOYEE 
  },
  { 
    id: '15', 
    name: 'Денисов Максим Сергійович',
    email: 'denisov@company.com', 
    position: 'Frontend розробник', 
    departmentId: '5', 
    role: UserRole.EMPLOYEE 
  },
  // Группа технічної підтримки (departmentId: '7')
  { 
    id: '16', 
    name: 'Єгорова Анастасія Дмитрівна',
    email: 'egorova@company.com',
    position: 'Спеціаліст технічної підтримки',
    departmentId: '7',
    role: UserRole.EMPLOYEE
  },
  { 
    id: '17', 
    name: 'Федоров Ігор Олексійович', 
    email: 'fedorov@company.com', 
    position: 'Провідний спеціаліст підтримки', 
    departmentId: '7', 
    role: UserRole.EMPLOYEE 
  },
  // Інші підрозділи
  { 
    id: '1',
    name: 'Іванов Іван Іванович',
    email: 'ivan@company.com',
    position: 'Backend розробник',
    departmentId: '1',
    role: UserRole.EMPLOYEE
  },
  {
    id: '2',
    name: 'Петров Петро Петрович',
    email: 'manager@company.com',
    position: 'Керівник відділу ІТ',
    departmentId: '1',
    role: UserRole.MANAGER 
  },
  { 
    id: '3', 
    name: 'Сидорова Ганна Михайлівна', 
    email: 'user@company.com', 
    position: 'Інженер-програміст', 
    departmentId: '1', 
    role: UserRole.EMPLOYEE 
  },
  { 
    id: '4', 
    name: 'Козлов Михаїл Олександрович', 
    email: 'kozlov@company.com', 
    position: 'DevOps інженер', 
    departmentId: '1', 
    role: UserRole.EMPLOYEE 
  },
  { 
    id: '5', 
    name: 'Миколаєва Олена Сергіївна', 
    email: 'nikolaeva@company.com', 
    position: 'Менеджер проєктів', 
    departmentId: '2', 
    role: UserRole.MANAGER 
  },
  { 
    id: '6', 
    name: 'Смирнов Олексій Петрович', 
    email: 'smirnov@company.com', 
    position: 'Бізнес-аналітик', 
    departmentId: '2', 
    role: UserRole.EMPLOYEE 
  },
  { 
    id: '7', 
    name: 'Волкова Марія Дмитрівна', 
    email: 'volkova@company.com', 
    position: 'UI/UX дизайнер', 
    departmentId: '2', 
    role: UserRole.EMPLOYEE 
  },
  { 
    id: '8', 
    name: 'Тимофєєв Андрій Миколайович', 
    email: 'timofeev@company.com', 
    position: 'Frontend розробник', 
    departmentId: '3', 
    role: UserRole.EMPLOYEE 
  },
  {
    id: '9',
    name: 'Орлова Ксенія Сергіївна',
    email: 'orlova@company.com',
    position: 'Backend розробник',
    departmentId: '3',
    role: UserRole.EMPLOYEE 
  },
  { 
    id: '10',
    name: 'Морозов Дмитро Володимирович',
    email: 'morozov@company.com',
    position: 'Тестувальник',
    departmentId: '3',
    role: UserRole.EMPLOYEE
  },
];

// Расширенные данные пользователей с контактной информацией для страницы текущих дежурных
export const mockUsersWithContacts = mockUsers.map(user => ({
  ...user,
  phone: getPhoneForUser(user.id),
}));

function getPhoneForUser(userId: string): string {
  const phoneMap: Record<string, string> = {
    '11': '+38 (050) 111-11-11',
    '12': '+38 (050) 222-22-22',
    '13': '+38 (050) 333-33-33',
    '14': '+38 (050) 444-44-44',
    '15': '+38 (050) 555-55-55',
    '16': '+38 (050) 666-66-66',
    '17': '+38 (050) 777-77-77',
    '1': '+38 (050) 123-45-67',
    '2': '+38 (050) 234-56-78',
    '3': '+38 (050) 345-67-89',
    '4': '+38 (050) 456-78-90',
    '5': '+38 (050) 567-89-01',
    '6': '+38 (050) 678-90-12',
    '7': '+38 (050) 789-01-23',
    '8': '+38 (050) 890-12-34',
    '9': '+38 (050) 901-23-45',
    '10': '+38 (050) 012-34-56',
  };
  return phoneMap[userId] || '+38 (050) 000-00-00';
}

// Утилитные функции для работы с пользователями
export const getUserById = (userId: string): User | undefined => {
  return mockUsers.find(user => user.id === userId);
};

export const getUserName = (userId: string): string => {
  const user = getUserById(userId);
  return user?.name || 'Невідомий користувач';
};

export const getUsersByDepartment = (departmentId: string): User[] => {
  return mockUsers.filter(user => user.departmentId === departmentId);
};

export const getUserWithContactById = (userId: string) => {
  const user = getUserById(userId);
  if (!user) {
    return {
      id: userId,
      name: 'Невідомий користувач',
      position: '',
      departmentId: '',
      phone: '+38 (050) 000-00-00',
      email: '',
    };
  }
  
  return {
    ...user,
    phone: getPhoneForUser(userId),
  };
};

// Mock данные пользователей для dutyService (упрощенная версия)
export const mockUsersForDutyService = mockUsers.map(user => ({
  id: user.id,
  name: user.name,
  departmentId: user.departmentId,
}));

// Утилитные функции для работы с департментами
export const getDepartmentById = (departmentId: string): Department | undefined => {
  return mockDepartments.find(dept => dept.id === departmentId);
};

export const getDepartmentName = (departmentId: string): string => {
  const department = getDepartmentById(departmentId);
  return department?.name || 'Невідомий підрозділ';
};
