import { createSlice } from "@reduxjs/toolkit";
import { 
  settlementShowThunk, 
  settlementSumUpThunk, 
  settlementThreeMonthThunk,
  getSettlementDetailThunk, // 새로 추가
  retrySettlementThunk, // 새로 추가
} from "../thunks/settlementThunk.js";

const initialState = {
  settlements: [], // 정산 리스트 데이터
  summary: {
    totalRevenue: 0,
    totalRevenueMoM: null, // 전월 대비 매출 성장률
    totalOrderCount: 0,
    activeRiderCount: 0,
    paymentErrorCount: 0,
  }, // 정산 요약 데이터
  chartData: {},
  pagination: null, // 페이지네이션 정보
  settlementDetail: null, // 정산 상세 정보
  loading: false,
  error: null,
}

const settlementSlice = createSlice({
  name: 'settlement',
  initialState: initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      // settlementShowThunk
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
      })
      .addCase(settlementSumUpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // settlementThreeMonthThunk
      .addCase(settlementThreeMonthThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(settlementThreeMonthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData = action.payload.data;
      })
      .addCase(settlementThreeMonthThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getSettlementDetailThunk
      .addCase(getSettlementDetailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.settlementDetail = null; // 상세 정보 로딩 시작 시 초기화
      })
      .addCase(getSettlementDetailThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.settlementDetail = action.payload;
      })
      .addCase(getSettlementDetailThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.settlementDetail = null;
      })
      // retrySettlementThunk
      .addCase(retrySettlementThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retrySettlementThunk.fulfilled, (state) => {
        state.loading = false;
        // 재시도 성공 시 별도 데이터를 저장할 필요는 없음 (목록을 다시 불러올 예정)
      })
      .addCase(retrySettlementThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default settlementSlice.reducer;
