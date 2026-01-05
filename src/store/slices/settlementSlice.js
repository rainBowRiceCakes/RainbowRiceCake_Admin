import { createSlice } from "@reduxjs/toolkit";
import { settlementShowThunk } from "../thunks/settlementThunk.js";

const initialState = {
  settlements: [], // 정산 리스트 데이터
  pagination: null, // 페이지네이션 정보
  loading: false,
  error: null,
}

const settlementSlice = createSlice({
  name: 'settlementShow',
  initialState: initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(settlementShowThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(settlementShowThunk.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload.data)
        // 백엔드 응답이 { data: { settlements: [], pagination: {} } } 형태일 것으로 가정
        state.settlements = action.payload.data.settlements; 
        state.pagination = action.payload.data.pagination;
      })
      .addCase(settlementShowThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default settlementSlice.reducer;
