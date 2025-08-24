import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../features/departments';
import { Department, DepartmentLevel, UserRole } from '../shared/types';
import { createDepartmentOptionsData } from '../shared/lib/departmentHierarchy';

export default function DepartmentsPage() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector(state => state.auth);
  const { departments, isLoading } = useAppSelector(state => state.departments);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    managerId: '',
    level: DepartmentLevel.DEPARTMENT
  });

  const LEVEL_LABELS = {
    [DepartmentLevel.COMPANY]: 'Компанія',
    [DepartmentLevel.DEPARTMENT]: 'Відділ',
    [DepartmentLevel.DIVISION]: 'Підрозділ',
    [DepartmentLevel.GROUP]: 'Група'
  };

  const LEVEL_COLORS = {
    [DepartmentLevel.COMPANY]: 'bg-purple-100 text-purple-800',
    [DepartmentLevel.DEPARTMENT]: 'bg-blue-100 text-blue-800',
    [DepartmentLevel.DIVISION]: 'bg-green-100 text-green-800',
    [DepartmentLevel.GROUP]: 'bg-yellow-100 text-yellow-800'
  };

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const buildHierarchy = (departments: Department[]): Department[] => {
    const deptMap = new Map<string, Department>();
    const roots: Department[] = [];

    // Create a map of all departments
    departments.forEach(dept => {
      deptMap.set(dept.id, { ...dept, children: [] });
    });

    // Build the hierarchy
    deptMap.forEach(dept => {
      if (dept.parentId && deptMap.has(dept.parentId)) {
        const parent = deptMap.get(dept.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(dept);
      } else {
        roots.push(dept);
      }
    });

    return roots;
  };

  const filterDepartments = (depts: Department[], searchTerm: string): Department[] => {
    if (!searchTerm) return depts;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const filterRecursive = (dept: Department): Department | null => {
      const nameMatches = dept.name.toLowerCase().includes(lowerSearchTerm);
      
      // Рекурсивно фильтруем дочерние элементы
      const filteredChildren = dept.children 
        ? dept.children.map(filterRecursive).filter(Boolean) as Department[]
        : [];
      
      // Возвращаем подразделение, если:
      // 1. Его имя соответствует поиску, ИЛИ
      // 2. У него есть дочерние элементы, которые соответствуют поиску
      if (nameMatches || filteredChildren.length > 0) {
        return {
          ...dept,
          children: filteredChildren
        };
      }
      
      return null;
    };
    
    return depts.map(filterRecursive).filter(Boolean) as Department[];
  };

  const renderDepartmentTree = (depts: Department[], level: number = 0): React.ReactElement[] => {
    return depts.map(dept => (
        <div key={dept.id}>
          <div 
            className={`flex items-center justify-between p-3 hover:bg-gray-50 ${level > 0 ? 'ml-' + (level * 6) : ''}`}
            style={{ marginLeft: level * 24 }}
          >
            <div className="flex items-center">
              {dept.children && dept.children.length > 0 && (
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedDepts);
                    if (newExpanded.has(dept.id)) {
                      newExpanded.delete(dept.id);
                    } else {
                      newExpanded.add(dept.id);
                    }
                    setExpandedDepts(newExpanded);
                  }}
                  className="mr-2 p-1 hover:bg-gray-200 rounded"
                >
                  {expandedDepts.has(dept.id) ? '▼' : '▶'}
                </button>
              )}
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[dept.level]}`}>
                    {LEVEL_LABELS[dept.level]}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {dept.id} • Менеджер: {dept.managerId}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(dept)}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Редагувати
              </button>
              <button
                onClick={() => handleDelete(dept.id)}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Видалити
              </button>
            </div>
          </div>
          
          {dept.children && dept.children.length > 0 && expandedDepts.has(dept.id) && (
            <div>{renderDepartmentTree(dept.children, level + 1)}</div>
          )}
        </div>
      ));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parentId: '',
      managerId: '',
      level: DepartmentLevel.DEPARTMENT
    });
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      parentId: department.parentId || '',
      managerId: department.managerId,
      level: department.level
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    const departmentData = {
      name: formData.name,
      parentId: formData.parentId || undefined,
      managerId: formData.managerId,
      level: formData.level
    };

    if (editingDepartment) {
      await dispatch(updateDepartment({ 
        id: editingDepartment.id, 
        data: departmentData 
      }));
    } else {
      await dispatch(createDepartment(departmentData));
    }
    
    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = async (departmentId: string) => {
    if (confirm('Ви впевнені, що хочете видалити цей підрозділ?')) {
      await dispatch(deleteDepartment(departmentId));
    }
  };

  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Доступ заборонено</h2>
            <p className="mt-2 text-gray-600">
              У вас немає прав для управління підрозділами.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hierarchicalDepts = filterDepartments(buildHierarchy(departments), searchTerm);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Управління підрозділами
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleAdd}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Додати підрозділ
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Пошук за назвою
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Назва підрозділу"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              onClick={() => setExpandedDepts(new Set(departments.map(d => d.id)))}
              className="mr-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Розгорнути все
            </button>
            <button
              onClick={() => setExpandedDepts(new Set())}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Згорнути все
            </button>
          </div>
        </div>

        {/* Department Tree */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Загрузка...</p>
            </div>
          ) : hierarchicalDepts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Підрозділи не знайдені</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {renderDepartmentTree(hierarchicalDepts)}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingDepartment ? 'Редагувати підрозділ' : 'Додати підрозділ'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Назва
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Батьківський підрозділ
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Кореневий підрозділ</option>
                      {createDepartmentOptionsData(
                        departments.filter(dept => dept.id !== editingDepartment?.id)
                      ).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ID менеджера
                    </label>
                    <input
                      type="text"
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Рівень
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as DepartmentLevel })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value={DepartmentLevel.COMPANY}>Компанія</option>
                      <option value={DepartmentLevel.DEPARTMENT}>Відділ</option>
                      <option value={DepartmentLevel.DIVISION}>Підрозділ</option>
                      <option value={DepartmentLevel.GROUP}>Група</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Відмінити
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.name || !formData.managerId}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingDepartment ? 'Зберегти' : 'Додати'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
