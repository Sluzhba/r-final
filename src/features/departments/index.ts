// Public API модуля departments
export { default as departmentSlice } from './model/departmentSlice';
export { 
  fetchDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  clearError, 
  setCurrentDepartment 
} from './model/departmentSlice';
export { default as OrganizationTree } from './components/OrganizationTree';
export { departmentService } from './api/departmentService';
