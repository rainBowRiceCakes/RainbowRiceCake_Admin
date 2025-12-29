import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const orderIndexThunk = createAsyncThunk(
  'order/orderIndex',
  async ({ page = 1, limit = 9, from }, { rejectWithValue }) => {
    try {
      // 쿼리 파라미터 생성
      let query = `?page=${page}&limit=${limit}`;
      if (from) query += `&from=${from}`;

      const response = await axiosInstance.get(`/api/admins/orderindex${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);