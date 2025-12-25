import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const riderShowThunk = createAsyncThunk(
  'riderShow/riderShowThunk', // Thunk 고유명
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/riders`;
      
      const response = await axiosInstance.get(url);
      if(!response.data) {
        throw new Error('기사정보 불러오기 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const riderDetailThunk = createAsyncThunk(
  'riderDetail/riderDetailThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/riders/${id}`;
      
      const response = await axiosInstance.get(url);
      if(!response.data) {
        throw new Error('매장정보 불러오기 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const riderCreateThunk = createAsyncThunk(
  'riderCreate/riderCreateThunk', // Thunk 고유명
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/riders`;
      
      const response = await axiosInstance.post(url, data);
      if(!response.data) {
        throw new Error('호텔정보 등록 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// server에서, save로 만들어야 함.
export const riderUpdateThunk = createAsyncThunk(
  'riderUpdate/riderUpdateThunk', // Thunk 고유명
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/admins/rider`;
      
      const response = await axiosInstance.post(url, data);
      if(!response.data) {
        throw new Error('호텔정보 수정 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);