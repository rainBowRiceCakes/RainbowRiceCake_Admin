import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const userIndexThunk = createAsyncThunk(
  'userIndex/userIndexThunk',
  async ({ page = 1, limit = 9 }, { rejectWithValue }) => {
    try {
      // 쿼리 파라미터 생성
      let query = `?page=${page}&limit=${limit}`;
      const response = await axiosInstance.get(`/api/users/show${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const userDetailThunk = createAsyncThunk(
  'userDetail/userDetailThunk',
  async (id, { rejectWithValue }) => {
    try {
      // 쿼리 파라미터 생성
      const response = await axiosInstance.get(`/api/users/show/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const userCreateThunk = createAsyncThunk(
  'userCreate/userCreateThunk', // Thunk 고유명
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/users/store`;
      
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

// 2. 정보 수정
export const userUpdateThunk = createAsyncThunk(
  'userUpdate/userUpdateThunk',
  async (data, { rejectWithValue }) => {
    try {
      // data는 { id, status, price, cntS, ... } 형태
      const response = await axiosInstance.put(`/api/users/update`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const userDeleteThunk = createAsyncThunk(
  'userDelete/userDeleteThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/admins/user/${id}`;
      
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