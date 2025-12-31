import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const noticeCreateThunk = createAsyncThunk(
  'noticeCreate/noticeCreateThunk', // Thunk 고유명
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/notices`;
      
      const response = await axiosInstance.post(url, data);
      if(!response.data) {
        throw new Error('공지정보 등록 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const noticeShowThunk = createAsyncThunk(
  'noticeShow/noticeShowThunk', // Thunk 고유명
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/admins/notice`;
      
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

export const noticeDetailThunk = createAsyncThunk(
  'noticeDetail/noticeDetailThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/admins/notice/${id}`;
      
      const response = await axiosInstance.get(url);
      if(!response.data) {
        throw new Error('매장정보 불러오기 실패');
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// server에서, save로 만들어야 함.
export const noticeUpdateThunk = createAsyncThunk(
  'noticeUpdate/noticeUpdateThunk', // Thunk 고유명
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/admins/notice`;
      
      const response = await axiosInstance.put(url, data);
      if(!response.data) {
        throw new Error('호텔정보 수정 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// server에서, save로 만들어야 함.
export const noticeDeleteThunk = createAsyncThunk(
  'noticeDelete/noticeDeleteThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/admins/notice/${id}`;
      
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