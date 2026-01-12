import { createSlice } from "@reduxjs/toolkit";
import { qnaShowThunk } from "../thunks/qnaThunk.js";

const initialState = {
  qnas: [], // QnA 리스트 데이터가 저장될 곳
  pagination: null, // 페이지네이션 정보
  loading: false,
  error: null,
}

const slice = createSlice({
  name: 'qnaShow',
  initialState: initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(qnaShowThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(qnaShowThunk.fulfilled, (state, action) => {
        console.log(action.payload)
        state.loading = false;
        state.qnas = action.payload.data.qnas;      // ★ `qnas` 데이터를 직접 할당
        state.pagination = action.payload.data.pagination; // ★ 페이지네이션 데이터를 할당
      })
      .addCase(qnaShowThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.qnas = [];
        state.pagination = null;
      });
  },
});

export default slice.reducer;