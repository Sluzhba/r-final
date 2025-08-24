import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Department, CreateDepartmentForm } from '../../../shared/types';
import { departmentService } from '../api/departmentService';

interface DepartmentState {
  departments: Department[];
  currentDepartment: Department | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  currentDepartment: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await departmentService.getDepartments();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Помилка завантаження підрозділів');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'departments/createDepartment',
  async (departmentData: CreateDepartmentForm, { rejectWithValue }) => {
    try {
      const response = await departmentService.createDepartment(departmentData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Помилка створення підрозділу');
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, data }: { id: string; data: Partial<Department> }, { rejectWithValue }) => {
    try {
      const response = await departmentService.updateDepartment(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Помилка оновлення підрозділу');
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id: string, { rejectWithValue }) => {
    try {
      await departmentService.deleteDepartment(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Помилка видалення підрозділу');
    }
  }
);

const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentDepartment: (state, action: PayloadAction<Department | null>) => {
      state.currentDepartment = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload;
        state.error = null;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create department
    builder
      .addCase(createDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments.push(action.payload);
        state.error = null;
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update department
    builder
      .addCase(updateDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.departments.findIndex(dep => dep.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete department
    builder
      .addCase(deleteDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = state.departments.filter(dep => dep.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;
