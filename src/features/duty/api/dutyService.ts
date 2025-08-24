import { DutyAssignment, DutyCalendar } from '../../../shared/types';
import { mockUsersForDutyService, mockDepartments } from '../../../shared/lib/mockData';

class DutyService {
  private assignments: DutyAssignment[] = [];

  constructor() {
    this.regenerateAssignments();
  }

  private regenerateAssignments() {
    this.assignments = this.generateMockAssignments();
  }

  private generateMockAssignments(): DutyAssignment[] {
    console.log('=== Generating mock assignments ===');
    const assignments: DutyAssignment[] = [];
    const currentDate = new Date(); // Используем текущую дату
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = currentDate.getDate();

    // Генерируем назначения на текущий месяц
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];

      // Для сегодняшнего дня обязательно создаем дежурных
      if (day === today) {
        
        // Создаем дежурных из разных департаментов для лучшего тестирования
        const todayAssignments = [
          { userId: '11', departmentId: '4' }, // Backend группа (под ИТ департаментом)
          { userId: '14', departmentId: '5' }, // Frontend группа (под ИТ департаментом)
          { userId: '16', departmentId: '7' }, // Техподдержка (под ИТ департаментом)
          { userId: '1', departmentId: '1' },  // Компания (админ)
          { userId: '2', departmentId: '2' },  // ИТ департамент (менеджер)
        ];
        
        console.log('Today duty assignments:', todayAssignments);
        
        todayAssignments.forEach((dutyUser, index) => {
          const assignment = {
            id: `${dutyUser.userId}_${dateString}`,
            userId: dutyUser.userId,
            departmentId: dutyUser.departmentId,
            date: dateString,
            scheduleId: index % 2 === 0 ? '1' : '2', // Дневное или ночное дежурство
            createdBy: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          assignments.push(assignment);
        });
      }

      // Случайные назначения для других дней
      mockUsersForDutyService.forEach((user, index) => {
        if (day !== today && day % (index + 2) === 0) { // Создаем нерегулярный паттерн для других дней
          assignments.push({
            id: `${user.id}_${dateString}`,
            userId: user.id,
            departmentId: user.departmentId,
            date: dateString,
            scheduleId: day % 7 === 0 ? '4' : (day % 3 === 0 ? '2' : '1'), // Выходные, сутки, или обычный день
            createdBy: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
    }

    console.log('=== Generated assignments summary ===');
    console.log('Total assignments generated:', assignments.length);
    console.log('Today assignments:', assignments.filter(a => a.date === new Date().toISOString().split('T')[0]));
    console.log('All assignments:', assignments);
    
    return assignments;
  }

  async getDutyCalendar(year: number, month: number, departmentId?: string): Promise<DutyCalendar> {
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredAssignments = this.assignments.filter(assignment => {
      const assignmentDate = new Date(assignment.date);
      const isCorrectMonth = assignmentDate.getFullYear() === year && assignmentDate.getMonth() === month - 1;
      
      if (!departmentId) return isCorrectMonth;
      
      // Если указан departmentId, фильтруем по нему и его дочерним подразделениям
      return isCorrectMonth && this.isDepartmentMatch(assignment.departmentId, departmentId);
    });

    return {
      year,
      month,
      assignments: filteredAssignments,
    };
  }

  async getCurrentDutyOfficers(departmentId?: string): Promise<DutyAssignment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Принудительно регенерируем данные для отладки
    if (this.assignments.length === 0) {
      console.log('No assignments found, regenerating...');
      this.regenerateAssignments();
    }

    // Используем текущую дату
    const today = new Date().toISOString().split('T')[0]; // Сегодняшняя дата
    console.log('Getting current duty officers for date:', today);
    console.log('Total assignments:', this.assignments.length);
    console.log('Filter by department:', departmentId);
    
    const todayAssignments = this.assignments.filter(assignment => assignment.date === today);
    console.log('Today assignments before department filter:', todayAssignments);
    
    const result = this.assignments.filter(assignment => {
      const isToday = assignment.date === today;
      if (!departmentId) return isToday;
      const matches = isToday && this.isDepartmentMatch(assignment.departmentId, departmentId);
      
      if (isToday) {
        console.log(`Assignment ${assignment.id}: dept=${assignment.departmentId}, target=${departmentId}, matches=${matches}`);
      }
      
      return matches;
    });
    
    console.log('Final filtered result:', result);
    return result;
  }

  async createDutyAssignment(assignment: Omit<DutyAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<DutyAssignment> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const newAssignment: DutyAssignment = {
      ...assignment,
      id: `${assignment.userId}_${assignment.date}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Удаляем существующее назначение на эту дату для этого пользователя
    this.assignments = this.assignments.filter(
      a => !(a.userId === assignment.userId && a.date === assignment.date)
    );

    this.assignments.push(newAssignment);
    return newAssignment;
  }

  async updateDutyAssignment(id: string, data: Partial<DutyAssignment>): Promise<DutyAssignment> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const assignmentIndex = this.assignments.findIndex(a => a.id === id);
    if (assignmentIndex === -1) {
      throw new Error('Призначення чергування не знайдено');
    }

    this.assignments[assignmentIndex] = {
      ...this.assignments[assignmentIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return this.assignments[assignmentIndex];
  }

  async deleteDutyAssignment(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('Видаляємо призначення с ID:', id);
    console.log('Поточні призначення до видалення:', this.assignments.length);

    const assignmentIndex = this.assignments.findIndex(a => a.id === id);
    if (assignmentIndex === -1) {
      console.error('Призначення чергування не знайдено, ID:', id);
      throw new Error('Призначення чергування не знайдено');
    }

    console.log('Найдено призначення по індексу:', assignmentIndex);
    this.assignments.splice(assignmentIndex, 1);
    console.log('Призначення видалено, залишилось призначень:', this.assignments.length);
  }

  async bulkUpdateDutyAssignments(data: {
    dates: string[];
    userId: string;
    scheduleId: string;
    departmentId: string;
  }): Promise<DutyAssignment[]> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const { dates, userId, scheduleId, departmentId } = data;
    const updatedAssignments: DutyAssignment[] = [];
    const currentUser = '1'; // В реальном приложении получать из контекста

    for (const date of dates) {
      // Удаляем существующее назначение на эту дату для этого пользователя
      this.assignments = this.assignments.filter(
        a => !(a.userId === userId && a.date === date)
      );

      const newAssignment: DutyAssignment = {
        id: `${userId}_${date}_${Date.now()}`,
        userId,
        departmentId,
        date,
        scheduleId,
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.assignments.push(newAssignment);
      updatedAssignments.push(newAssignment);
    }

    return updatedAssignments;
  }

  async getDutyAssignmentsByUser(userId: string, startDate: string, endDate: string): Promise<DutyAssignment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return this.assignments.filter(assignment => {
      return assignment.userId === userId && 
             assignment.date >= startDate && 
             assignment.date <= endDate;
    });
  }

  async getDutyAssignmentsByDepartment(departmentId: string, startDate: string, endDate: string): Promise<DutyAssignment[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return this.assignments.filter(assignment => {
      return this.isDepartmentMatch(assignment.departmentId, departmentId) &&
             assignment.date >= startDate && 
             assignment.date <= endDate;
    });
  }

  // Проверка, подходит ли назначение по департаменту (включая дочерние)
  private isDepartmentMatch(assignmentDeptId: string, targetDeptId: string): boolean {
    console.log(`Checking department match: ${assignmentDeptId} vs ${targetDeptId}`);
    
    // Если точно совпадает
    if (assignmentDeptId === targetDeptId) {
      console.log('Direct match found');
      return true;
    }

    // Проверяем, является ли assignmentDeptId дочерним для targetDeptId
    const isChildDepartment = (childId: string, parentId: string): boolean => {
      const childDept = mockDepartments.find(d => d.id === childId);
      console.log(`Looking for child dept ${childId}:`, childDept);
      
      if (!childDept || !childDept.parentId) {
        return false;
      }
      
      if (childDept.parentId === parentId) {
        console.log(`Found direct parent relationship: ${childId} -> ${parentId}`);
        return true;
      }
      
      // Рекурсивно проверяем родительские департаменты
      return isChildDepartment(childDept.parentId, parentId);
    };

    const result = isChildDepartment(assignmentDeptId, targetDeptId);
    console.log(`Child department check result: ${result}`);
    return result;
  }

  // Получить статистику дежурств за период
  async getDutyStatistics(departmentId?: string, startDate?: string, endDate?: string): Promise<{
    totalAssignments: number;
    userStats: { userId: string; assignmentsCount: number }[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredAssignments = this.assignments;

    if (departmentId) {
      filteredAssignments = filteredAssignments.filter(a => 
        this.isDepartmentMatch(a.departmentId, departmentId)
      );
    }

    if (startDate && endDate) {
      filteredAssignments = filteredAssignments.filter(a => 
        a.date >= startDate && a.date <= endDate
      );
    }

    const userStats: { [userId: string]: number } = {};
    filteredAssignments.forEach(assignment => {
      userStats[assignment.userId] = (userStats[assignment.userId] || 0) + 1;
    });

    return {
      totalAssignments: filteredAssignments.length,
      userStats: Object.entries(userStats).map(([userId, count]) => ({
        userId,
        assignmentsCount: count,
      })),
    };
  }
}

export const dutyService = new DutyService();
