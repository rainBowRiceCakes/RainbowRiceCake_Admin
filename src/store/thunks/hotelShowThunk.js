import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const hotelShowThunk = createAsyncThunk(
  'hotelShow/hotelShowThunk', // Thunk 고유명
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/hotels`;
      
      const response = await axiosInstance.get(url);
      if(!response.data) {
        throw new Error('호텔정보 불러오기 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);