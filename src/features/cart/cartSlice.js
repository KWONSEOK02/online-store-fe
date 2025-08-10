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
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/cart");
      if (response.status !== 200) throw new Error(response.data.error|| "카트 목록 불러오기 실패");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.delete(`/cart/${id}`);
      if (response.data.status !== "success") {
        throw new Error(response.data.error || "카트 아이템 삭제 실패");
      }
      // 수량 뱃지 갱신
      const qty = response.data.cartItemQty;
      // 리스트도 최신화
      dispatch(getCartList());
      return qty;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ id, value }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart/${id}`, { qty: value });
      if (response.data.status !== "success") {
        throw new Error(response.data.error || "수량 변경 실패");
      }
      // 변경 후의 items 배열을 그대로 반환해 슬라이스에서 cartList 갱신
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getCartQty = createAsyncThunk(
  "cart/getCartQty",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/cart/qty");
      if (response.data.status !== "success") {
        throw new Error(response.data.error || "카트 수량 조회 실패");
      }

      return response.data.qty; // fulfilled → extraReducers에서 state.cartItemCount 갱신
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initialCart: (state) => {
      state.cartItemCount = 0;
    },
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
      .addCase(getCartList.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getCartList.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartList = action.payload;
        state.totalPrice = action.payload.reduce( //여기서 계산하면 다른데서 사용될 때 사용할 수 있어서 시간 단축
          (total, item) => total 
          + item.productId.price* item.qty, 0
        ); // reduce 배열을 순회하며 누적(accumulator) 계산을 해주는 메서드
      })
      .addCase(getCartList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartItemCount = action.payload; // cartItemQty
        // 리스트 갱신은 thunk에서 getCartList() 디스패치로 처리됨
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateQty.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQty.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartList = action.payload;
        state.totalPrice = state.cartList.reduce(
          (sum, item) => sum + item.productId.price * item.qty,
          0
        );
      })
      .addCase(updateQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartQty.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCartQty.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        state.cartItemCount = action.payload; // qty
      })
      .addCase(getCartQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
export const { initialCart } = cartSlice.actions;
