import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

// 비동기 액션 생성
export const getProductList = createAsyncThunk(
  "products/getProductList",
  async (query, { rejectWithValue }) => {
    try{
      //검색 조건을 포함한 쿼리 파라미터를 백엔드에 전달하여, 필터링된 상품 목록을 받아오는 구조
      const response = await api.get("/product", {params:{...query}});
      if (response.status !== 200) throw new Error(response.error);
      
      // 결과 전체 넘기고, getProductList.fulfilled에서 최종 페이지와 data 저장
      return response.data; 
      

    }catch(error){
      return rejectWithValue(error.error || "상품 목록 로딩 실패");
    }
  }
);

export const getProductDetail = createAsyncThunk(
  "products/getProductDetail",
  async (id, { rejectWithValue }) => {}
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/product", formData);
      if (response.status !== 200) throw new Error(response.error);
      dispatch(showToastMessage({ message: "상품 생성 완료", status: "success" }));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.error || "상품 생성 실패");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { dispatch, rejectWithValue }) => {}
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, ...formData }, { dispatch, rejectWithValue }) => {}
);

// 슬라이스 생성
const productSlice = createSlice({
  name: "products",
  initialState: {
    productList: [],
    selectedProduct: null,
    loading: false,
    error: "",
    totalPageNum: 1,
    success: false,
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setFilteredList: (state, action) => {
      state.filteredList = action.payload;
    },
    clearError: (state) => {
      state.error = "";
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createProduct.pending, (state, action) => {
      state.loading = true;
    })
    .addCase(createProduct.fulfilled, (state, action) => {
      state.loading = false;
      state.error = "";
      state.success = true; // 상품 생성을 성공=> 다이얼로그를 닫고, 실패=> 실패메세지를 다이얼로그에 보여주고, 닫진 않음
    })
    .addCase(createProduct.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })
    .addCase(getProductList.pending, (state, action) => {
      state.loading = true;
    })
    .addCase(getProductList.fulfilled, (state, action) => {
      state.loading = false;
      state.productList = action.payload.data; // 상품 목록 상태에 저장
      state.error = "";
      state.totalPageNum = action.payload.totalPageNum; // 전체 페이지 수 상태에 저장
    })
    .addCase(getProductList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
  },
});

export const { setSelectedProduct, setFilteredList, clearError } =
  productSlice.actions;
export default productSlice.reducer;
