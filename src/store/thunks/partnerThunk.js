import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const partnerShowThunk = createAsyncThunk(
  'partnerShow/partnerShowThunk', // Thunk 고유명
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = `/api/partners${queryString ? `?${queryString}` : ''}`;
      
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

export const partnerDetailThunk = createAsyncThunk(
  'partnerDetail/partnerDetailThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/partners/${id}`;
      
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

export const partnerCreateThunk = createAsyncThunk(
  'partnerCreate/partnerCreateThunk', // Thunk 고유명
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/admins/partner`;
      
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

export const partnerUpdateThunk = createAsyncThunk(
  'partnerUpdate/partnerUpdateThunk',
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/admins/partner`;

      const response = await axiosInstance.put(url, data);

      if(!response.data) {
        throw new Error('호텔정보 수정 실패');
      }
      return response.data;
    } catch (error) {
      // 에러 메시지 처리
      const msg = error.response?.data?.data?.join(', ') || error.message; 
      return rejectWithValue(msg);
    }
  }
);

export const postLogoImageUploadThunk = createAsyncThunk(
  'postLogoImageUpload/postLogoImageUploadThunk', // Thunk 고유명
  async (file, { rejectWithValue }) => {
    try {
      const url = `/api/files/logos`;
      const headers = {
        'Content-Type': 'multipart/form-data'
      };
      
      // 폼데이터 생성
      const formData = new FormData();
      formData.append('logoImg', file);

      const response = await axiosInstance.post(url, formData, { headers });

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const partnerDeleteThunk = createAsyncThunk(
  'partnerDelete/partnerDeleteThunk', // Thunk 고유명
  async (id, { rejectWithValue }) => {
    try {
      const url = `/api/admins/partner/${id}`;
      
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