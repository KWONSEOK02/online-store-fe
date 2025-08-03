import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import "./common/style/common.style.css";
import AppLayout from "./Layout/AppLayout";
import AppRouter from "./routes/AppRouter";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginWithToken } from "./features/user/userSlice"; // 실제 위치 확인 필요

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loginWithToken()); // 토큰이 있다면 로그인 복원 시도
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
