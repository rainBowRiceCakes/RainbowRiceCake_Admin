import { createSlice } from "@reduxjs/toolkit";
import { partnerShowThunk } from "../thunks/partnerThunk.js";

const initialState = {
  show: [], // 리스트 데이터가 저장될 곳
  loading: false,
  error: null,
}

const slice = createSlice({
  name: 'partnerShow',
  initialState: initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(partnerShowThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.show = action.payload.data; // ★ 서버에서 받은 데이터를 Store에 저장
      })
      // ... pending, rejected 처리
  },
});

export default slice.reducer;