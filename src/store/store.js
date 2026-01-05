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
import orderShowReducer from "../store/slices/orderSlice.js";
import userShowReducer from "../store/slices/userSlice.js";
import noticeShowReducer from "../store/slices/noticeSlice.js";
import qnaShowReducer from "../store/slices/qnaSlice.js";
import dashboardReducer from "../store/slices/dashboadSlice.js";
import settlementReducer from "../store/slices/settlementSlice.js";

export default configureStore ({
  reducer: {
    auth: authReducer,
    hotelShow: hotelShowReducer,
    partnerShow: partnerShowReducer,
    riderShow: riderShowReducer,
    orderShow: orderShowReducer,
    userShow: userShowReducer,
    noticeShow: noticeShowReducer,
    qnaShow: qnaShowReducer,
    dashboard: dashboardReducer,
    settlement: settlementReducer,
  }
});