import { createSlice } from '@reduxjs/toolkit';
import { loginThunk, reissueThunk } from '../thunks/authThunk.js';

const initialState = {
  accessToken: null,
  name: null,
  isLoggedIn: false,
  isCheckingAuth: true, // 초기값을 true로 설정 (새로고침 시 체크부터 시작하니까요)
}

const slice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    clearAuth(state) {
      state.accessToken = null;
      state.name = null;
      state.isLoggedIn = false;
      state.isCheckingAuth = false; // 로그아웃 시엔 체크 끝남
    },
  },
  extraReducers: builder => {
    builder
      // 로그인 성공
      .addCase(loginThunk.fulfilled, (state, action) => {
        const { accessToken, name } = action.payload.data;
        state.accessToken = accessToken;
        state.name = name;
        state.isLoggedIn = true;
        state.isCheckingAuth = false;
      })
      // 재발급 성공
      .addCase(reissueThunk.fulfilled, (state, action) => {
        const reissueData = action.payload.data;
        state.accessToken = reissueData.accessToken;
        state.name = reissueData.admin.name;
        state.isLoggedIn = true;
        state.isCheckingAuth = false;
      })
      // 재발급 실패 (비로그인/토큰만료)
      .addCase(reissueThunk.rejected, (state) => {
        state.isLoggedIn = false;
        state.isCheckingAuth = false; // 체크 완료
      });
  },
});

export const {
  clearAuth,
} = slice.actions;

export default slice.reducer;