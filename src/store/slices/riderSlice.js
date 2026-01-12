import { createSlice } from "@reduxjs/toolkit";
import { riderShowThunk } from "../thunks/riderThunk.js";

const initialState = {
  riders: [], // 리스트 데이터
  pagination: null, // 페이지네이션 정보
  loading: false,
  error: null,
}

const slice = createSlice({
  name: 'riderShow',
  initialState: initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(riderShowThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(riderShowThunk.fulfilled, (state, action) => {
        state.loading = false;
        // 백엔드 응답이 { data: { riders: [], pagination: {} } } 형태일 것으로 가정
        state.riders = action.payload.data.riders; 
        state.pagination = action.payload.data.pagination;
      })
      .addCase(riderShowThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default slice.reducer;