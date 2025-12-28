import { createSlice } from '@reduxjs/toolkit';
import { loginThunk, reissueThunk } from '../thunks/authThunk.js';

const initialState = {
  accessToken: null,
  name: null,
  isLoggedIn: false,
}

const slice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    clearAuth(state) {
      state.accessToken = null;
      state.name = null;
      state.isLoggedIn = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginThunk.fulfilled, (state, action) => {
        const { accessToken, name } = action.payload.data;
        state.accessToken = accessToken;
        state.name = name;
        state.isLoggedIn = true;
      })
      .addCase(reissueThunk.fulfilled, (state, action) => {
        const { accessToken, name } = action.payload.data;
        state.accessToken = accessToken;
        state.name = name;
        state.isLoggedIn = true;
      })
  },
});

export const {
  clearAuth,
} = slice.actions;

export default slice.reducer;