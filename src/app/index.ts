// Public API для app слоя
export { store } from './store';
export type { RootState, AppDispatch } from './store';
export { useAppDispatch, useAppSelector, useAuth, useDepartments } from './hooks';
