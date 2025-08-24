import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Типизированные хуки
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Селекторы для удобства
export const useAuth = () => useAppSelector((state) => state.auth);
export const useDepartments = () => useAppSelector((state) => state.departments);
export const useDuty = () => useAppSelector((state) => state.duty);
export const useSchedules = () => useAppSelector((state) => state.schedules);
