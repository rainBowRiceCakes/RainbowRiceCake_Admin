import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const orderShowThunk = createAsyncThunk(
  'orderShow/orderShowThunk', // Thunk 고유명
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/orders`;
      
      const response = await axiosInstance.get(url);
      if(!response.data) {
        throw new Error('주문정보 불러오기 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);