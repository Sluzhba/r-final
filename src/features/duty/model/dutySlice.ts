import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DutyAssignment, DutyCalendar, CalendarState } from '../../../shared/types';
import { dutyService } from '../api/dutyService';

interface DutyState {
  assignments: DutyAssignment[];
  calendar: DutyCalendar | null;
  calendarState: CalendarState;
  isLoading: boolean;
  error: string | null;
}

const initialState: DutyState = {
  assignments: [],
  calendar: null,
  calendarState: {
    currentDate: new Date().toISOString().split('T')[0], // Use ISO date string
    selectedDate: null,
    viewMode: 'month',
    selectedDepartment: null,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDutyCalendar = createAsyncThunk(
  'duty/fetchDutyCalendar',
  async ({ year, month, departmentId }: { year: number; month: number; departmentId?: string }, { rejectWithValue }) => {
    try {
      const response = await dutyService.getDutyCalendar(year, month, departmentId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Помилка завантаження календаря чергувань');
    }
  }
);

export const createDutyAssignment = createAsyncThunk(
  'duty/createDutyAssignment',
  async (assignment: Omit<DutyAssignment, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await dutyService.createDutyAssignment(assignment);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Помилка створення призначення чергування');
    }
  }
);

export const updateDutyAssignment = createAsyncThunk(
  'duty/updateDutyAssignment',
  async ({ id, data }: { id: string; data: Partial<DutyAssignment> }, { rejectWithValue }) => {
    try {
      const response = await dutyService.updateDutyAssignment(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Помилка оновлення призначення чергування');
    }
  }
);

export const deleteDutyAssignment = createAsyncThunk(
  'duty/deleteDutyAssignment',
  async (id: string, { rejectWithValue }) => {
    try {
      await dutyService.deleteDutyAssignment(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Помилка видалення призначення чергування');
    }
  }
);

export const bulkUpdateDutyAssignments = createAsyncThunk(
  'duty/bulkUpdateDutyAssignments',
  async (assignments: { dates: string[]; userId: string; scheduleId: string; departmentId: string }, { rejectWithValue }) => {
    try {
      const response = await dutyService.bulkUpdateDutyAssignments(assignments);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Помилка масового оновлення призначень');
    }
  }
);

const dutySlice = createSlice({
  name: 'duty',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.calendarState.currentDate = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.calendarState.selectedDate = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'month' | 'year'>) => {
      state.calendarState.viewMode = action.payload;
    },
    setSelectedDepartment: (state, action: PayloadAction<string | null>) => {
      state.calendarState.selectedDepartment = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch duty calendar
    builder
      .addCase(fetchDutyCalendar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDutyCalendar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.calendar = action.payload;
        state.assignments = action.payload.assignments;
        state.error = null;
      })
      .addCase(fetchDutyCalendar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create duty assignment
    builder
      .addCase(createDutyAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDutyAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments.push(action.payload);
        state.error = null;
      })
      .addCase(createDutyAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update duty assignment
    builder
      .addCase(updateDutyAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDutyAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.assignments.findIndex(assignment => assignment.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateDutyAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete duty assignment
    builder
      .addCase(deleteDutyAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDutyAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = state.assignments.filter(assignment => assignment.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteDutyAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Bulk update duty assignments
    builder
      .addCase(bulkUpdateDutyAssignments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkUpdateDutyAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        // Обновляем назначения в состоянии
        action.payload.forEach(updatedAssignment => {
          const index = state.assignments.findIndex(assignment => assignment.id === updatedAssignment.id);
          if (index !== -1) {
            state.assignments[index] = updatedAssignment;
          } else {
            state.assignments.push(updatedAssignment);
          }
        });
        state.error = null;
      })
      .addCase(bulkUpdateDutyAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setCurrentDate, 
  setSelectedDate, 
  setViewMode, 
  setSelectedDepartment 
} = dutySlice.actions;

export default dutySlice.reducer;
