import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const qnaShowThunk = createAsyncThunk(
  'qnaShow/qnaShowThunk', // Thunk 고유명
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status !== undefined) queryParams.append('status', params.status); // false 값도 보내도록
      if (params.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = `/api/admins/qna${queryString ? `?${queryString}` : ''}`;
      
      const response = await axiosInstance.get(url);
      if(!response.data) {
        throw new Error('질문정보 불러오기 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const qnaDetailThunk = createAsyncThunk(
  'qnaDetail/qnaDetailThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/admins/qna/${id}`;
      
      const response = await axiosInstance.get(url);
      if(!response.data) {
        throw new Error('질문정보 불러오기 실패');
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// server에서, save로 만들어야 함.
export const qnaUpdateThunk = createAsyncThunk(
  'qnaUpdate/qnaUpdateThunk', // Thunk 고유명
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/admins/qna`;
      
      const response = await axiosInstance.put(url, data);
      if(!response.data) {
        throw new Error('질문정보 수정 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const qnaDeleteThunk = createAsyncThunk(
  'qnaDelete/qnaDeleteThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/admins/qna/${id}`;
      
      const response = await axiosInstance.delete(url, id);
      if(!response.data) {
        throw new Error('질문정보 수정 실패');
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);