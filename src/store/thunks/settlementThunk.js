import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const settlementShowThunk = createAsyncThunk(
  'settlementShow/settlementShowThunk', // Thunk 고유명
  async (params = {}, { rejectWithValue }) => {
    try {
      // params: { year, month }
      const queryParams = new URLSearchParams();

      if (params.year) queryParams.append('year', params.year);
      if (params.month) queryParams.append('month', params.month);

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


export const settlementThreeMonthThunk = createAsyncThunk(
  'settlementThreeMonth/settlementThreeMonthThunk', // Thunk 고유명
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/settlements/three-months-total`;
      
      const response = await axiosInstance.get(url);
      if(!response.data) {
        throw new Error('차트정보 불러오기 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getSettlementDetailThunk = createAsyncThunk(
  'settlement/getSettlementDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/settlements/${id}`);
      if (!response.data) {
        throw new Error('정산 상세 정보 불러오기 실패');
      }
      return response.data.data; // 컨트롤러의 createBaseResponse 구조에 따라 data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const retrySettlementThunk = createAsyncThunk(
  'settlement/retrySettlement',
  async ({ id, bankAccount, bankCode, memo }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/settlements/${id}/retry`, {
        bankAccount,
        bankCode,
        memo,
      });
      if (!response.data) {
        throw new Error('정산 재시도 실패');
      }
      return response.data.data; // 컨트롤러의 createBaseResponse 구조에 따라 data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

