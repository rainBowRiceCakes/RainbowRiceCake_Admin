import { createSlice } from "@reduxjs/toolkit";
import { noticeShowThunk } from "../thunks/noticeThunk.js";

const initialState = {
  notices: [], // 리스트 데이터
  pagination: null, // 페이지네이션 정보
  loading: false,
  error: null,
}

const slice = createSlice({
  name: 'noticeShow',
  initialState: initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(noticeShowThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(noticeShowThunk.fulfilled, (state, action) => {
        state.loading = false;
        // 백엔드 응답이 { data: { notices: [], pagination: {} } } 형태일 것으로 가정
        state.notices = action.payload.data.notices; 
        state.pagination = action.payload.data.pagination;
      })
      .addCase(noticeShowThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default slice.reducer;