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

export const hotelDetailThunk = createAsyncThunk(
  'hotelDetail/hotelDetailThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/hotels/${id}`;
      
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

export const hotelCreateThunk = createAsyncThunk(
  'hotelCreate/hotelCreateThunk', // Thunk 고유명
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/hotels`;
      
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
export const hotelUpdateThunk = createAsyncThunk(
  'hotelUpdate/hotelUpdateThunk', // Thunk 고유명
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/admins/hotel`;
      
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

export const hotelDeleteThunk = createAsyncThunk(
  'hotelDelete/hotelDeleteThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/admins/hotel/${id}`;
      
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