import React, { useState } from 'react';
import { Department, User, DepartmentLevel } from '../../../shared/types';

interface OrganizationTreeProps {
  departments: Department[];
  users: User[];
  onUserSelect?: (user: User) => void;
  selectedUserId?: string;
}

interface TreeNodeProps {
  department: Department;
  level: number;
  users: User[];
  allDepartments: Department[];
  onUserSelect?: (user: User) => void;
  selectedUserId?: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  department, 
  level, 
  users, 
  allDepartments, 
  onUserSelect, 
  selectedUserId 
}) => {
  const [isExpanded, setIsExpanded] = useState(level <= 1); // Автоматически раскрываем первые 2 уровня

  // Получаем пользователей этого подразделения
  const departmentUsers = users.filter(user => user.departmentId === department.id);
  
  // Получаем дочерние подразделения
  const childDepartments = allDepartments.filter(dept => dept.parentId === department.id);
  
  const hasChildren = childDepartments.length > 0 || departmentUsers.length > 0;

  const getIcon = () => {
    switch (department.level) {
      case DepartmentLevel.COMPANY:
        return '🏢';
      case DepartmentLevel.DEPARTMENT:
        return '🏬';
      case DepartmentLevel.DIVISION:
        return '📋';
      case DepartmentLevel.GROUP:
        return '👥';
      default:
        return '📁';
    }
  };

  const getLevelColor = () => {
    switch (department.level) {
      case DepartmentLevel.COMPANY:
        return 'text-blue-800 font-bold';
      case DepartmentLevel.DEPARTMENT:
        return 'text-blue-600 font-semibold';
      case DepartmentLevel.DIVISION:
        return 'text-blue-500 font-medium';
      case DepartmentLevel.GROUP:
        return 'text-blue-400';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="select-none">
      {/* Заголовок подразделения */}
      <div
        className={`flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {hasChildren && (
          <span className="mr-2 text-gray-400 text-sm">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="mr-2 w-4"></span>}
        <span className="mr-2">{getIcon()}</span>
        <span className={`${getLevelColor()}`}>
          {department.name}
        </span>
        <span className="ml-2 text-xs text-gray-500">
          ({departmentUsers.length} сотр.)
        </span>
      </div>

      {/* Содержимое (дочерние подразделения и пользователи) */}
      {isExpanded && (
        <div>
          {/* Дочерние подразделения */}
          {childDepartments.map(childDept => (
            <TreeNode
              key={childDept.id}
              department={childDept}
              level={level + 1}
              users={users}
              allDepartments={allDepartments}
              onUserSelect={onUserSelect}
              selectedUserId={selectedUserId}
            />
          ))}
          
          {/* Пользователи в этом подразделении */}
          {departmentUsers.map(user => (
            <div
              key={user.id}
              className={`flex items-center py-2 px-2 hover:bg-blue-50 rounded cursor-pointer ${
                selectedUserId === user.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
              }`}
              style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
              onClick={() => onUserSelect?.(user)}
            >
              <span className="mr-2 w-4"></span>
              <span className="mr-2">👤</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500">
                  {user.position}
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {user.role}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const OrganizationTree: React.FC<OrganizationTreeProps> = ({ 
  departments, 
  users, 
  onUserSelect, 
  selectedUserId 
}) => {
  // Находим корневые подразделения (компании)
  const rootDepartments = departments.filter(dept => !dept.parentId);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Структура организации</h3>
      </div>
      <div className="p-2">
        {rootDepartments.map(department => (
          <TreeNode
            key={department.id}
            department={department}
            level={0}
            users={users}
            allDepartments={departments}
            onUserSelect={onUserSelect}
            selectedUserId={selectedUserId}
          />
        ))}
      </div>
    </div>
  );
};

export default OrganizationTree;
