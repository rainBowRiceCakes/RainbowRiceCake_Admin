/**
 * @file src/store/store.js
 * @description slice 모아두는 store파일
 * 251214 v1.0.0 wook 최초 생성
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice.js';
import hotelShowReducer from "../store/slices/hotelSlice.js";
import partnerShowReducer from "../store/slices/partnerSlice.js";
import riderShowReducer from "../store/slices/riderSlice.js";

export default configureStore ({
  reducer: {
    auth: authReducer,
    hotelShow: hotelShowReducer,
    partnerShow: partnerShowReducer,
    riderShow: riderShowReducer,
  }
});