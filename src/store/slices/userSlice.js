import { createSlice } from "@reduxjs/toolkit";
import { userIndexThunk } from "../thunks/userThunk.js";

const initialState = {
  users: [],          // 현재 페이지의 주문 목록
  pagination: {
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  },
  loading: false,
};

const slice = createSlice({
  name: 'userShow',
  initialState: initialState,
  reducers: {},

  extraReducers: builder => {
    // extraReducers 내부
    builder
      .addCase(userIndexThunk.fulfilled, (state, action) => {
        console.log(action.payload.data)
        const { users, pagination } = action.payload.data;
        
        state.users = users;          // 목록 교체 (기존 데이터 뒤에 붙이는게 아님!)
        state.pagination = pagination;  // 페이지 정보 업데이트 (전체 페이지 수 등)
        state.loading = false;
      });

  }
})

export default slice.reducer;