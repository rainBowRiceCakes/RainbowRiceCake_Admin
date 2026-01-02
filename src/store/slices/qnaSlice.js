import { createSlice } from "@reduxjs/toolkit";
import { qnaShowThunk } from "../thunks/qnaThunk.js";

const initialState = {
  show: [], // 리스트 데이터가 저장될 곳
  loading: false,
  error: null,
}

const slice = createSlice({
  name: 'qnaShow',
  initialState: initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(qnaShowThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.show = action.payload.data; // ★ 서버에서 받은 데이터를 Store에 저장
      })
      // ... pending, rejected 처리
  },
});

export default slice.reducer;