import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

export const getProductList = createAsyncThunk(
  "products/getProductList",
  async (query, { rejectWithValue }) => {
    try{
      const response = await api.get("/product", {params:{...query}});
      
      // 결과 전체 넘기고, getProductList.fulfilled에서 최종 페이지와 data 저장
      return response.data; 
    }catch(error){
      return rejectWithValue(error.error || "상품 목록 로딩 실패");
    }
  }
);

export const getProductDetail = createAsyncThunk(
  "products/getProductDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}`);

      return response.data.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "상품 상세 로딩 실패");
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/product", formData);
       
      dispatch(showToastMessage({ message: "상품 생성 완료", status: "success" }));
      return response.data.data;
    } catch (error) {
      return rejectWithValue( error.message || "상품 생성 실패"); 
    }
  }
);

export const deleteProduct = createAsyncThunk( 
  "products/deleteProduct",
  async (id, { dispatch, rejectWithValue }) => {
    try{
      const response = await api.delete(`/product/${id}`);
      
      dispatch(showToastMessage({ message: "상품 삭제 완료", status: "success" }));
      return id; 
    }catch(error){
      return rejectWithValue(error.message || "삭제 실패");
    }
  }
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, ...formData }, { dispatch, rejectWithValue }) => {
    try{
      const response = await api.put(`/product/${id}`, formData); 

      dispatch(showToastMessage({ message: "상품 수정 완료", status: "success" }));
      dispatch(getProductList({page: 1})); 
      return response.data.data;
    }catch(error){
        return rejectWithValue(error.message);
    }
  }
);

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
      state.success = true;
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
      state.productList = action.payload.data; 
      state.error = "";
      state.totalPageNum = action.payload.totalPageNum; // 전체 페이지 수 상태에 저장
    })
    .addCase(getProductList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(editProduct.pending, (state, action)=>{
      state.loading = true;
    })
    .addCase(editProduct.fulfilled, (state, action)=>{
      state.loading = false;
      state.error = "";
      state.success = true; 
    })
    .addCase(editProduct.rejected, (state, action)=>{
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })
    .addCase(deleteProduct.pending, (state, action)=>{
      state.loading = true;
    })
    .addCase(deleteProduct.fulfilled, (state, action)=>{
      state.loading = false;
      state.error = "";
      state.success = true;
    })
    .addCase(deleteProduct.rejected, (state, action)=>{
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })
    .addCase(getProductDetail.pending, (state, action)=>{
      state.loading = true;
      // 상세 재요청 시 이전 선택 상태 초기화(잔상 방지)
      state.selectedProduct = null;
    })
    .addCase(getProductDetail.fulfilled, (state, action)=>{
      state.loading = false;
      state.error = "";
      state.success = true;
      state.selectedProduct = action.payload;
    })
    .addCase(getProductDetail.rejected, (state, action)=>{
      state.loading = false;
      state.error = action.payload;
      state.success = false;
      state.selectedProduct = null;
    })
  },
});

export const { setSelectedProduct, setFilteredList, clearError } =
  productSlice.actions;
export default productSlice.reducer;
