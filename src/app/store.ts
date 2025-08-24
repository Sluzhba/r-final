import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/model/authSlice';
import departmentReducer from '../features/departments/model/departmentSlice';
import dutyReducer from '../features/duty/model/dutySlice';
import scheduleReducer from '../features/schedule/model/scheduleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer,
    duty: dutyReducer,
    schedules: scheduleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
