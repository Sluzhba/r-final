import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Schedule, CreateScheduleForm } from '../../../shared/types';
import { scheduleService } from '../api/scheduleService';

interface ScheduleState {
  schedules: Schedule[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ScheduleState = {
  schedules: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSchedules = createAsyncThunk(
  'schedules/fetchSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await scheduleService.getSchedules();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка загрузки графиков');
    }
  }
);

export const createSchedule = createAsyncThunk(
  'schedules/createSchedule',
  async (scheduleData: CreateScheduleForm, { rejectWithValue }) => {
    try {
      const response = await scheduleService.createSchedule(scheduleData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка создания графика');
    }
  }
);

export const updateSchedule = createAsyncThunk(
  'schedules/updateSchedule',
  async ({ id, data }: { id: string; data: Partial<Schedule> }, { rejectWithValue }) => {
    try {
      const response = await scheduleService.updateSchedule(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка обновления графика');
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedules/deleteSchedule',
  async (id: string, { rejectWithValue }) => {
    try {
      await scheduleService.deleteSchedule(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка удаления графика');
    }
  }
);

const scheduleSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch schedules
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules = action.payload;
        state.error = null;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create schedule
    builder
      .addCase(createSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules.push(action.payload);
        state.error = null;
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update schedule
    builder
      .addCase(updateSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.schedules.findIndex(schedule => schedule.id === action.payload.id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete schedule
    builder
      .addCase(deleteSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules = state.schedules.filter(schedule => schedule.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = scheduleSlice.actions;
export default scheduleSlice.reducer;
