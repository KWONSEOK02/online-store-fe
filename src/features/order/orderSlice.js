import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCartQty } from "../cart/cartSlice";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

// Define initial state
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
      
      if (response.data.status !== "success") {
        throw new Error(response.data.error || "주문 생성 실패");
      }
      dispatch(getCartQty());

      return response.data.orderNum;
    } catch (error) {
      const msg = error?.response?.data?.error ||   // Axios Error (기본형)
      error?.response?.data?.message || // 혹시 message로 내려올 때
      error?.error ||                   // 인터셉터가 data만 reject했을 때 { status, error }
      error?.message ||                 // 일반 Error
      "주문 생성 중 오류가 발생했습니다.";

      dispatch(showToastMessage({ message: msg, status: "error" }));
      return rejectWithValue(msg);
    }
  }
);


export const getOrder = createAsyncThunk(
  "order/getOrder",
  async (_, { rejectWithValue, dispatch }) => {}
);

export const getOrderList = createAsyncThunk(
  "order/getOrderList",
  async (query, { rejectWithValue, dispatch }) => {}
);

export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ id, status }, { dispatch, rejectWithValue }) => {}
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
      state.orderNum = action.payload; //리턴 값 저장
    })
    .addCase(createOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });    
  },
});

export const { setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
