import { createSlice } from "@reduxjs/toolkit";
import { partnerShowThunk } from "../thunks/partnerThunk.js";

const initialState = {
  partners: [], // 리스트 데이터
  pagination: null, // 페이지네이션 정보
  loading: false,
  error: null,
}

const slice = createSlice({
  name: 'partnerShow',
  initialState: initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(partnerShowThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(partnerShowThunk.fulfilled, (state, action) => {
        state.loading = false;
        // 백엔드 응답이 { data: { partners: [], pagination: {} } } 형태일 것으로 가정
        state.partners = action.payload.data.partners; 
        state.pagination = action.payload.data.pagination;
      })
      .addCase(partnerShowThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default slice.reducer;