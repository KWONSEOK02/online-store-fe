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
      //if (response.status !== 200) throw new Error(response.error);
      
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
      //if (response.status !== 200) throw new Error(response.data?.message);

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
      //error로 받으면 "Product validation failed: sku:" 같은 불필요한 앞부분이 붙는 문제
      //error -> message로 수정
      //if (response.status !== 200) throw new Error(response.message);  
      dispatch(showToastMessage({ message: "상품 생성 완료", status: "success" }));
      return response.data.data;
    } catch (error) {
      return rejectWithValue( error.message || "상품 생성 실패"); // error.message로 백엔드에서 받음
    }
  }
);

export const deleteProduct = createAsyncThunk( //adminProductPage에서 현재 페이지로 갱신할 거라서 여기에 넣을 필요 없음.
  "products/deleteProduct",
  async (id, { dispatch, rejectWithValue }) => {
    try{
      const response = await api.delete(`/product/${id}`);
      //if (response.status !== 200) throw new Error(response.data?.message || "삭제 실패");
      dispatch(showToastMessage({ message: "상품 삭제 완료", status: "success" }));
      return id; // 삭제 id 받기
    }catch(error){
      return rejectWithValue(error.message || "삭제 실패");
    }
  }
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, ...formData }, { dispatch, rejectWithValue }) => {
    try{
      const response = await api.put(`/product/${id}`, formData); // 백틱 사용 해야함 물결 모양 옆에 있는거  따옴표는 사용시 택스트로 인식
      //if (response.status !== 200) throw new Error(response.message);
      dispatch(showToastMessage({ message: "상품 수정 완료", status: "success" }));
      dispatch(getProductList({page: 1})); // 여기서 갱신함
      return response.data.data;
    }catch(error){
        return rejectWithValue(error.message);
    }
  }
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
      state.selectedProduct = null;   // 이전 상세 잔상 제거
    })
    .addCase(getProductDetail.fulfilled, (state, action)=>{
      state.loading = false;
      state.error = "";
      state.success = true;
      state.selectedProduct = action.payload;
    // 백엔드 응답이 {data:{...}} 형태면 -> action.payload.data 로 변경
    })
    .addCase(getProductDetail.rejected, (state, action)=>{
      state.loading = false;
      state.error = action.payload;
      state.success = false;
      state.selectedProduct = null;   // 실패 시도 정리
    })
  },
});

export const { setSelectedProduct, setFilteredList, clearError } =
  productSlice.actions;
export default productSlice.reducer;
