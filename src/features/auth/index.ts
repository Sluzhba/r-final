// Public API модуля auth
export { default as authSlice } from './model/authSlice';
export { loginUser, logoutUser, checkAuth, clearError, updateUserPermissions } from './model/authSlice';
export { default as Login } from './components/Login';
export { default as UserSwitcher } from './components/UserSwitcher';
export { authService } from './api/authService';
