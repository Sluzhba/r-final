import { 
  User, 
  UserPermissions, 
  LoginForm, 
  UserRole
} from '../../../shared/types';
import { mockUsers, mockDepartments } from '../../../shared/lib/mockData';

// Дополнительные пользователи для демо (админ, менеджер, etc.)
const authMockUsers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Адміністратор Системи',
    position: 'Системний адміністратор',
    departmentId: '1', // Компания "Технології"
    role: UserRole.ADMIN,
  },
  {
    id: '2',
    email: 'manager@company.com',
    name: 'Менеджер ІТ',
    position: 'Керівник ІТ відділу',
    departmentId: '2', // ІТ Департамент
    role: UserRole.MANAGER,
  },
  {
    id: '100', // Изменили ID чтобы избежать конфликта с mockUsers
    email: 'duty@company.com',
    name: 'Черговий Офіцер',
    position: 'Черговий по будівлі',
    departmentId: '1', // Компания "Технології" - видит все департаменты
    role: UserRole.DUTY_OFFICER,
  },
  // Включаем всех пользователей из централизованных данных
  ...mockUsers,
];

// Убираем дублирование пользователей из centralised данных
const uniqueAuthUsers = authMockUsers.filter((user, index, arr) => 
  arr.findIndex(u => u.id === user.id) === index
);

const getUserPermissions = (user: User): UserPermissions => {
  switch (user.role) {
    case UserRole.ADMIN:
      return {
        canViewDepartments: mockDepartments.map(d => d.id),
        canEditDepartments: mockDepartments.map(d => d.id),
        canManageUsers: true,
        canManageSchedules: true,
        canManageDepartments: true,
      };
    case UserRole.MANAGER:
      // Менеджер может управлять своим департаментом и всеми подчиненными (рекурсивно)
      const getAllChildDepartments = (parentId: string): string[] => {
        console.log(`Looking for children of department: ${parentId}`);
        const children = mockDepartments
          .filter(d => d.parentId === parentId)
          .map(d => d.id);
        
        console.log(`Found direct children:`, children);
        
        // Рекурсивно находим всех потомков
        const allDescendants = children.flatMap(childId => 
          [childId, ...getAllChildDepartments(childId)]
        );
        
        console.log(`All descendants of ${parentId}:`, allDescendants);
        return allDescendants;
      };
      
      console.log(`Processing manager: ${user.name}, department: ${user.departmentId}`);
      const managedDepartments = [
        user.departmentId, // Свой департамент
        ...getAllChildDepartments(user.departmentId) // Все дочерние рекурсивно
      ];
      
      console.log(`Manager ${user.name} (dept: ${user.departmentId}) can view departments:`, managedDepartments);
      
      return {
        canViewDepartments: managedDepartments,
        canEditDepartments: managedDepartments,
        canManageUsers: true,
        canManageSchedules: true,
        canManageDepartments: false,
      };
    case UserRole.DUTY_OFFICER:
      // Дежурный может просматривать все департаменты, но НЕ может редактировать графики
      return {
        canViewDepartments: mockDepartments.map(d => d.id),
        canEditDepartments: [], // Дежурные НЕ могут редактировать департаменты/графики
        canManageUsers: false,
        canManageSchedules: false,
        canManageDepartments: false,
      };
    case UserRole.EMPLOYEE:
    default:
      // Обычный сотрудник может только просматривать свой департамент
      return {
        canViewDepartments: [user.departmentId],
        canEditDepartments: [],
        canManageUsers: false,
        canManageSchedules: false,
        canManageDepartments: false,
      };
  }
};

class AuthService {
  private currentUser: User | null = null;

  async login(credentials: LoginForm): Promise<{ user: User; permissions: UserPermissions }> {
    // Имитация запроса к серверу
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = uniqueAuthUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Користувача не знайдено');
    }

    // В реальном приложении здесь будет проверка пароля
    if (credentials.password !== 'password') {
      throw new Error('Невірний пароль');
    }

    this.currentUser = user;
    
    // Сохраняем токен в localStorage (в реальном приложении)
    localStorage.setItem('authToken', 'mock-jwt-token');
    localStorage.setItem('userId', user.id);

    const permissions = getUserPermissions(user);

    return { user, permissions };
  }

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  }

  async checkAuth(): Promise<{ user: User; permissions: UserPermissions }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      throw new Error('Не авторизований');
    }

    const user = uniqueAuthUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Користувача не знайдено');
    }

    this.currentUser = user;
    const permissions = getUserPermissions(user);

    return { user, permissions };
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

export const authService = new AuthService();
