import { createSlice } from "@reduxjs/toolkit";
import { dashboardStatsThunk } from "../thunks/dashboadThunk";

const initialState = {
  chartData: {      // 차트 데이터 (표시용)
    labels: [],
    counts: []
  },
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

        // 백엔드 응답이 'data'인지 'result'인지 둘 다 체크 (안전 장치)
        const responseData = action.payload.data || action.payload.result;
        
        if (responseData?.recentDeliveryChart) {
          state.chartData = responseData.recentDeliveryChart;
        } else {
          console.warn("⚠️ recentDeliveryChart 데이터가 없습니다!", responseData);
        }
      })
      // --- [요청 실패] ---
      .addCase(dashboardStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("🔥 데이터 로딩 실패:", action.payload);
      });
  },
});

export const { clearError } = slice.actions;
export default slice.reducer;