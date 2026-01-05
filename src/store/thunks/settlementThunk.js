import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const settlementShowThunk = createAsyncThunk(
  'settlementShow/settlementShowThunk', // Thunk 고유명
  async (params = {}, { rejectWithValue }) => {
    try {
      // params: { page, month, status, search }
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.month) queryParams.append('month', params.month);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = `/api/settlements${queryString ? `?${queryString}` : ''}`;
      
      const response = await axiosInstance.get(url);
      if(!response.data) {
        throw new Error('정산정보 불러오기 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const settlementSumUpThunk = createAsyncThunk(
  'settlementSumUp/settlementSumUpThunk', // Thunk 고유명
  async (params = {}, { rejectWithValue }) => {
    try {
      // params: { year, month }
      const queryParams = new URLSearchParams();

      if (params.year) queryParams.append('year', params.year);
      if (params.month) queryParams.append('month', params.month);

      const queryString = queryParams.toString();
      const url = `/api/settlements/statistics${queryString ? `?${queryString}` : ''}`;
      
      const response = await axiosInstance.get(url);
      if(!response.data) {
        throw new Error('정산정보 불러오기 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

