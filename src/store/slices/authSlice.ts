import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, Usuario } from '@/types/auth';

const initialState: AuthState = {
  usuario: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<Usuario>) => {
      state.usuario = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.usuario = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;