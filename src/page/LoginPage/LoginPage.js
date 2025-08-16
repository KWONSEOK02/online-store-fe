import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./style/login.style.css";
import { loginWithEmail, loginWithGoogle } from "../../features/user/userSlice";
import { clearErrors } from "../../features/user/userSlice";

import api from "../../utils/api";
import { getCartQty} from "../../features/cart/cartSlice";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;


const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loginError } = useSelector((state) => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  useEffect(() => {
    if (loginError) {
      dispatch(clearErrors());
    }
    if (user) {
      navigate("/"); 
    }
  }, [user, navigate]);
// 로그인 성공 시 토큰을 세션에 저장하고 Axios 기본 Authorization 헤더를 설정
  const handleLoginWithEmail = async (event) => {
    event.preventDefault();

    const result = await dispatch(loginWithEmail({ email, password }));
  
    if (loginWithEmail.fulfilled.match(result)) {
      const { token } = result.payload; 
  
      sessionStorage.setItem("token", token);
  
      api.defaults.headers.authorization = `Bearer ${token}`;

      await dispatch(getCartQty());
  
    } else {
      console.error("Login failed:", result.payload);
    }
  };

  const handleGoogleLogin = async (googleData) => {
   
    dispatch(loginWithGoogle(googleData.credential));
  };

  if (user) {
    navigate("/"); 
  }
  return (
    <>
      <Container className="login-area">
        {loginError && (
          <div className="error-message">
            <Alert variant="danger">{loginError}</Alert>
          </div>
        )}
        <Form className="login-form" onSubmit={handleLoginWithEmail}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </Form.Group>
          <div className="display-space-between login-button-area">
            <Button variant="danger" type="submit">
              Login
            </Button>
            <div>
              아직 계정이 없으세요?<Link to="/register">회원가입 하기</Link>{" "}
            </div>
          </div>

          <div className="text-align-center mt-2">
            <p>-외부 계정으로 로그인하기-</p>
            <div className="display-center">
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    console.log("Login Failed");
                  }}
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default Login;
