import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

const initialState = {
  loading: false,
  error: "",
  cartList: [],
  selectedItem: {},
  cartItemCount: 0,
  totalPrice: 0,
};

// Async thunk actions
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ id, size }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/cart", { productId: id, size, qty: 1 });
       // 서버 응답에서 status 확인
       if (response.data.status !== "success") {
        throw new Error(response.data.error || "알 수 없는 오류");
      }

      dispatch(
        showToastMessage({
          message: "카트에 아이템이 추가 됐습니다",
          status: "success",
        })
      );
      return response.data.cartItemQty;

    } catch (error) {
      const errMsg = error?.error || "카트에 아이템 추가 실패"; // error?.error 백엔드에서 error로 보냄
      dispatch(
        showToastMessage({
          message: errMsg,
          status: "error",
        })
      );
  
      return rejectWithValue(errMsg);
    }
  }
);


export const getCartList = createAsyncThunk(
  "cart/getCartList",
  async (_, { rejectWithValue, dispatch }) => {}
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (id, { rejectWithValue, dispatch }) => {}
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ id, value }, { rejectWithValue }) => {}
);

export const getCartQty = createAsyncThunk(
  "cart/getCartQty",
  async (_, { rejectWithValue, dispatch }) => {}
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initialCart: (state) => {
      state.cartItemCount = 0;
    },
    // You can still add reducers here for non-async actions if necessary
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartItemCount = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default cartSlice.reducer;
export const { initialCart } = cartSlice.actions;
