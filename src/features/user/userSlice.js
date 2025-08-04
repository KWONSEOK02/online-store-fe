import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { showToastMessage } from "../common/uiSlice";
import api from "../../utils/api";
import { initialCart } from "../cart/cartSlice";

export const loginWithEmail = createAsyncThunk( // 로그인 시 토큰 세션 스토리지에 저장
  "user/loginWithEmail",
  async ({ email, password }, { rejectWithValue }) => {
    try{
      const response = await api.post("/auth/login", {email, password});
      return response.data; // response.data.user 도 가능
    } catch(error){
        return rejectWithValue(error.message); // error.message 백엔드의 오류 메시지 받아서 출력 
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "user/loginWithGoogle",
  async (token, { rejectWithValue }) => {}
);

export const logout = () => (dispatch) => {
  sessionStorage.removeItem("token"); // 토큰 삭제
  window.location.href = "/login"; // 로그인 페이지로 강제 이동 (새로고침 포함)
};

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.post("/user", { email, name, password });
      // 성공
      // 1. 성공 토스트 메시지 보여주기
      dispatch(
        showToastMessage({
          message: "회원가입을 성공했습니다!",
          status: "success",
        })
      );
      // 2. 로그인 페이지로 리다이렉트
      navigate("/login");
      return response.data.data;
    } catch (error) {
      // 백엔드에서 보낸 에러 메시지 추출
      const errorMsg =
        error && error.message
          ? error.message
          : "회원가입에 실패했습니다.";

      dispatch(
        showToastMessage({
          message: errorMsg,
          status: "error",
        })
      );
      return rejectWithValue(errorMsg);
    }
  }
);

export const loginWithToken = createAsyncThunk( // 토큰 유지 시 로그인 상태 유지 
  "user/loginWithToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/me"); // api.js에서 토큰 헤더에 세팅하고 있어서 가져오기만 하면된다.

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registrationError = action.payload;
      })
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.loginError = null;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      .addCase(loginWithToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });      
      
  },
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
