import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

export const partnerShowThunk = createAsyncThunk(
  'partnerShow/partnerShowThunk', // Thunk 고유명
  async (_, { rejectWithValue }) => {
    try {
      const url = `/api/partners`;
      
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
      const url = `/api/partners`;
      
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


// // server에서, save로 만들어야 함.
// export const partnerUpdateThunk = createAsyncThunk(
//   'partnerUpdate/partnerUpdateThunk', // Thunk 고유명
//   async (data, { rejectWithValue }) => {
//     try {
//       const url = `/api/admins/partner`;
//       const headers = {
//         'Content-Type': 'multipart/form-data'
//       };
      
//       const response = await axiosInstance.put(url, data, { headers });
//       if(!response.data) {
//         throw new Error('호텔정보 수정 실패');
//       }
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

export const partnerUpdateThunk = createAsyncThunk(
  'partnerUpdate/partnerUpdateThunk',
  async (data, { rejectWithValue }) => {
    try {
      const url = `/api/admins/partner`;
      
      // ❌ [삭제] 이 부분 때문에 에러가 나는 겁니다.
      /*
      const headers = {
        'Content-Type': 'multipart/form-data'
      };
      */
      
      // ✅ [수정] 헤더 설정 없이 data(FormData 객체)만 넘깁니다.
      // Axios가 data가 FormData임을 감지하고,
      // 기존 'application/json'을 무시하고 알맞은 'multipart/...' 헤더를 자동 생성합니다.
      const response = await axiosInstance.post(url, data);

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