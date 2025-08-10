import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import "./common/style/common.style.css";
import AppLayout from "./Layout/AppLayout";
import AppRouter from "./routes/AppRouter";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginWithToken } from "./features/user/userSlice"; // 실제 위치 확인 필요
import { getCartQty, initialCart } from "./features/cart/cartSlice";


function App() { //Redux 상태 복구용 액션(loginWithToken)을 App.js에서 디스패치
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loginWithToken())// 토큰이 있다면 로그인 복원 시도
    .unwrap()
    .then(() => dispatch(getCartQty()))   // 로그인 성공했을 때만 실행
    .catch(() => dispatch(initialCart())); // 실패(토큰 무효 등) 시 0으로 초기화 
  }, []);
   
  return (
    <div>
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </div>
  );
}

export default App;
