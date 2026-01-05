import { createSlice } from "@reduxjs/toolkit";
import { dashboardStatsThunk } from "../thunks/dashboadThunk";

const initialState = {
  // 차트 데이터 (표시용)
  chartData: {
    labels: [],
    counts: []
  },
  // 상단 요약 데이터(초기값 0으로 설정)
  summary: {
    todayRequests: 0,  // 오늘의 배송 요청
    inProgress: 0,     // 진행 중 배송 (pick)
    todayCompleted: 0  // 오늘의 완료 배송 (com + image)
  },
  urgentOrders: [], // 긴급 주문 배열 추가
  loading: false,
  error: null,
};

const slice = createSlice({
  name: 'dashboard',
  initialState: initialState,
  reducers: {
    // 필요하다면 에러 초기화 등의 동기 액션 추가
    clearError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      // --- [요청 시작] ---
      .addCase(dashboardStatsThunk.pending, (state) => {
        state.loading = true; // 로딩 상태 활성화 (UX 개선)
        state.error = null;   // 이전 에러 초기화
      })
      // --- [요청 성공] ---
      .addCase(dashboardStatsThunk.fulfilled, (state, action) => {
        state.loading = false;

        // 백엔드 응답 구조 유연하게 처리 (data 또는 result)
        const responseData = action.payload.data || action.payload.result;
        
        // 차트 데이터 연결
        if (responseData?.recentDeliveryChart) {
          state.chartData = responseData.recentDeliveryChart;
        }

        // 요약 데이터 연결
        if (responseData?.summary) {
          state.summary = responseData.summary;
        }

        // 긴급 주문 연결
        if (responseData?.urgentOrders) {
          state.urgentOrders = responseData.urgentOrders;
        }
      })
      // --- [요청 실패] ---
      .addCase(dashboardStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = slice.actions;
export default slice.reducer;