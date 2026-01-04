import { createSlice } from "@reduxjs/toolkit";
import { hotelShowThunk, hotelDetailThunk } from "../thunks/hotelThunk.js";

const initialState = {
  hotels: [], // 리스트 데이터
  pagination: null, // 페이지네이션 정보
  hotel: null, // 상세 데이터
  loading: false,
  error: null,
}

const slice = createSlice({
  name: 'hotelShow',
  initialState: initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      // 호텔 목록 조회
      .addCase(hotelShowThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(hotelShowThunk.fulfilled, (state, action) => {
        state.loading = false;
        // 백엔드 응답 데이터 구조에 맞춰서 수정
        state.hotels = action.payload.data.hotels; 
        state.pagination = action.payload.data.pagination;
      })
      .addCase(hotelShowThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 호텔 상세 조회
      .addCase(hotelDetailThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(hotelDetailThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.hotel = action.payload.data;
      })
      .addCase(hotelDetailThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default slice.reducer;