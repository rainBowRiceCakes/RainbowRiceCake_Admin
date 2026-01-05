import { createSlice } from "@reduxjs/toolkit";
import { settlementShowThunk, settlementSumUpThunk } from "../thunks/settlementThunk.js";

const initialState = {
  settlements: [], // 정산 리스트 데이터
  summary: {
    totalRevenue: 0,
    totalOrderCount: 0,
    activeRiderCount: 0,
    paymentErrorCount: 0,
  }, // 정산 요약 데이터
  pagination: null, // 페이지네이션 정보
  loading: false,
  error: null,
}

const settlementSlice = createSlice({
  name: 'settlement',
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
        state.settlements = action.payload.data.settlements; 
        state.pagination = action.payload.data.pagination;
      })
      .addCase(settlementShowThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // settlementSumUpThunk
      .addCase(settlementSumUpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(settlementSumUpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.data;
        console.log(action.payload.data);
      })
      .addCase(settlementSumUpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default settlementSlice.reducer;
