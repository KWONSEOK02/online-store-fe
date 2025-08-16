import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCartQty } from "../cart/cartSlice";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

const initialState = {
  orderList: [],
  orderNum: "",
  selectedOrder: {},
  error: "",
  loading: false,
  totalPageNum: 1,
};

// Async thunks
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/order", payload);
      
      dispatch(getCartQty());

      return response.data.orderNum;
    } catch (error) {
      const msg = error?.response?.data?.error ||
      error?.response?.data?.message || 
      error?.error ||                   
      error?.message ||                 
      "주문 생성 중 오류가 발생했습니다.";

      dispatch(showToastMessage({ message: msg, status: "error" }));
      return rejectWithValue(msg);
    }
  }
);


export const getOrder = createAsyncThunk(
  "order/getOrder",
  async ({ page = 1 } = {}, { rejectWithValue, dispatch }) => {
    try{
      const response = await api.get("/order/me", {params: { page }});

     return response.data;
     
    }catch(error){
      dispatch(showToastMessage({ message: "주문 정보 호출 실패", status: "error" }));
      return rejectWithValue(error.error || "주문 정보 로딩 실패");
    }
  }
);

export const getOrderList = createAsyncThunk(
  "order/getOrderList",
  async (query, { rejectWithValue, dispatch }) => {
    try{
      const response = await api.get("/order", {params:{...query}});
      
      // 결과 전체 넘기고, getOrderList.fulfilled에서 최종 페이지와 data 저장
      return response.data; 
    }catch(error){
      dispatch(showToastMessage({ message: "주문 정보 호출 실패", status: "error" }));
      return rejectWithValue(error.error || "주문 정보 로딩 실패");
    }
  }
);

export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ id, status }, { dispatch, rejectWithValue }) => {
    try{
      const response = await api.put("/order", { id, status });
     
      dispatch(showToastMessage({ message: "주문 상태 수정 완료", status: "success" }));
      dispatch(getOrderList({page: 1}));
      return response.data.data;
    }catch(error){
        return rejectWithValue(error.message);
    }
  }
);

// Order slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.pending, (state, action) => {
      state.loading = true;
    })
    .addCase(createOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.error = "";
      state.orderNum = action.payload; 
    })
    .addCase(createOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(getOrderList.pending, (state, action) => {
      state.loading = true;
    })
    .addCase(getOrderList.fulfilled, (state, action) => {
      state.loading = false;
      state.orderList = action.payload.data;
      state.error = "";
      state.totalPageNum = action.payload.totalPageNum; 
    })
    .addCase(getOrderList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(updateOrder.pending, (state, action)=>{
      state.loading = true;
    })
    .addCase(updateOrder.fulfilled, (state, action)=>{
      state.loading = false;
      state.error = "";
      state.success = true; 
    })
    .addCase(updateOrder.rejected, (state, action)=>{
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })
    .addCase(getOrder.pending, (state, action)=>{
      state.loading = true;
    })
    .addCase(getOrder.fulfilled, (state, action)=>{
      state.loading = false;
      state.error = "";
      state.orderList = action.payload.data;
      state.totalPageNum = action.payload.totalPageNum;
    })
    .addCase(getOrder.rejected, (state, action)=>{
      state.loading = false;
      state.error = action.payload;
    });  
  },
});

export const { setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
