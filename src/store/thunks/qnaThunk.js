import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const qnaShowThunk = createAsyncThunk(
  'qnaShow/qnaShowThunk', // Thunk 고유명
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/admins/qna`;
      
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