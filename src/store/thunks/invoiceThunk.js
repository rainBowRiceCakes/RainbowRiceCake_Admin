import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance.js";

// 청구서 발송 Thunk
export const sendInvoiceThunk = createAsyncThunk(
  'invoice/sendInvoiceThunk',
  async (data, { rejectWithValue }) => {
    try {
      // data: { partnerId, year, month }
      const url = `/api/invoices/send`;
      const response = await axiosInstance.post(url, data);
      
      // 성공 시 서버 응답 데이터 반환
      return response.data; 
    } catch (error) {
      // 실패 시 에러 메시지 반환
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);