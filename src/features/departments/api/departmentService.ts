import { Department, CreateDepartmentForm } from '../../../shared/types';
import { mockDepartments } from '../../../shared/lib/mockData';

class DepartmentService {
  private departments: Department[] = [...mockDepartments];

  async getDepartments(): Promise<Department[]> {
    // Имитация запроса к серверу
    await new Promise(resolve => setTimeout(resolve, 500));
    // Возвращаем плоский массив департаментов
    return [...this.departments];
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.departments.find(dept => dept.id === id) || null;
  }

  async createDepartment(departmentData: CreateDepartmentForm): Promise<Department> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newDepartment: Department = {
      id: Date.now().toString(),
      ...departmentData,
    };

    this.departments.push(newDepartment);
    return newDepartment;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = this.departments.findIndex(dept => dept.id === id);
    if (index === -1) {
      throw new Error('Департамент не знайдено');
    }

    this.departments[index] = { ...this.departments[index], ...updates };
    return this.departments[index];
  }

  async deleteDepartment(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Проверяем, есть ли дочерние департаменты
    const hasChildren = this.departments.some(dept => dept.parentId === id);
    if (hasChildren) {
      throw new Error('Неможливо видалити департамент з дочірніми підрозділами');
    }

    const index = this.departments.findIndex(dept => dept.id === id);
    if (index === -1) {
      throw new Error('Департамент не знайдено');
    }

    this.departments.splice(index, 1);
  }
}

export const departmentService = new DepartmentService();
