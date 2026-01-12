import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

/**
 * 대시보드 통계(차트) 데이터 조회 Thunk
 */
export const dashboardStatsThunk = createAsyncThunk(
  "dashboardStats/dashboardStatsThunk",
  async (_, { rejectWithValue }) => {
    try {
      const url = "/api/admins/dashboard/stats";
      const response = await axiosInstance.get(url);

      return response.data; // { isSuccess: true, ..., data: { recentDeliveryChart: ... } }
    } catch (error) {
      const errorPayload = error.response?.data || { message: error.message };
      return rejectWithValue(errorPayload);
    }
  }
);