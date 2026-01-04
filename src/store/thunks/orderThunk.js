import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const orderIndexThunk = createAsyncThunk(
  'orderIndex/orderIndexThunk',
  async ({ page = 1, limit = 9, from, statusExclude, deliveryStatus, paymentStatus, startDate, endDate, orderCode }, { rejectWithValue }) => {
    try {
      // 쿼리 파라미터 생성
      let query = `?page=${page}&limit=${limit}`;
      if (from) query += `&from=${from}`;
      if (statusExclude) query += `&statusExclude=${statusExclude}`;
      if (deliveryStatus) query += `&deliveryStatus=${deliveryStatus}`;
      if (paymentStatus) query += `&paymentStatus=${paymentStatus}`;
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;
      if (orderCode) query += `&orderCode=${orderCode}`;

      const response = await axiosInstance.get(`/api/admins/orderindex${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// store/thunks/orderThunk.js

// 1. 상세 조회
export const orderDetailThunk = createAsyncThunk(
  'orderDetail/orderDetailThunk',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/admins/order/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// 2. 정보 수정
export const orderUpdateThunk = createAsyncThunk(
  'orderUpdate/orderUpdateThunk',
  async (data, { rejectWithValue }) => {
    try {
      // data는 { id, status, price, cntS, ... } 형태
      const response = await axiosInstance.put(`/api/admins/order`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const orderCreateThunk = createAsyncThunk(
  'orderCreate/orderCreateThunk', // Thunk 고유명
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/admins/order`;
      
      const response = await axiosInstance.post(url, data);
      if(!response.data) {
        throw new Error('주문정보 등록 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const orderDeleteThunk = createAsyncThunk(
  'orderDelete/orderDeleteThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/admins/order/${id}`;
      
      const response = await axiosInstance.delete(url, id);
      if(!response.data) {
        throw new Error('호텔정보 수정 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);