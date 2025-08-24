import { Department } from '../types';

/**
 * Утилиты для работы с иерархическим отображением департаментов
 */

/**
 * Получает иерархическое отображение департамента с отступами
 * @param dept - Департамент для отображения
 * @param accessibleDepartments - Список доступных департаментов
 * @returns Строка с названием департамента и отступами по иерархии
 */
export const getDepartmentDisplayName = (dept: Department, accessibleDepartments: Department[]): string => {
  // Найдем корневые департаменты среди доступных
  const accessibleIds = accessibleDepartments.map(d => d.id);
  const roots = accessibleDepartments.filter(d => !d.parentId || !accessibleIds.includes(d.parentId));
  
  const getRelativeDepth = (deptId: string, targetRoots: Department[], currentDepth = 0): number => {
    // Если это один из корневых элементов, возвращаем текущую глубину
    if (targetRoots.some(root => root.id === deptId)) {
      return currentDepth;
    }
    
    // Найдем департамент
    const department = accessibleDepartments.find(d => d.id === deptId);
    if (!department || !department.parentId) return currentDepth;
    
    // Рекурсивно идем к родителю
    return getRelativeDepth(department.parentId, targetRoots, currentDepth + 1);
  };

  const depth = getRelativeDepth(dept.id, roots);
  
  // Используем простые символы для иерархии
  let displayName = '';
  if (depth === 0) {
    displayName = dept.name;
  } else if (depth === 1) {
    displayName = `— ${dept.name}`;
  } else if (depth === 2) {
    displayName = `—— ${dept.name}`;
  } else {
    displayName = `${'—'.repeat(depth)} ${dept.name}`;
  }
  
  return displayName;
};

/**
 * Сортирует департаменты в иерархическом порядке
 * @param departments - Список департаментов для сортировки
 * @returns Отсортированный список департаментов
 */
export const sortDepartmentsByHierarchy = (departments: Department[]): Department[] => {
  // Ищем департаменты, которые являются корневыми в рамках доступных (не имеют родителей среди доступных)
  const accessibleIds = departments.map(d => d.id);
  const roots = departments.filter(d => !d.parentId || !accessibleIds.includes(d.parentId));
  
  const result: Department[] = [];
  
  const addDepartmentWithChildren = (dept: Department) => {
    result.push(dept);
    const children = departments
      .filter(d => d.parentId === dept.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    children.forEach(addDepartmentWithChildren);
  };
  
  roots.sort((a, b) => a.name.localeCompare(b.name));
  roots.forEach(addDepartmentWithChildren);
  
  return result;
};

/**
 * Создает данные для опций select элемента с иерархическим отображением департаментов
 * @param departments - Список департаментов
 * @returns Массив объектов с value и label
 */
export const createDepartmentOptionsData = (departments: Department[]) => {
  const sortedDepartments = sortDepartmentsByHierarchy(departments);
  
  return sortedDepartments.map((dept) => ({
    value: dept.id,
    label: getDepartmentDisplayName(dept, departments)
  }));
};
