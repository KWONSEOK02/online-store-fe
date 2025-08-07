import React, { useEffect, useState } from "react";
import ProductCard from "./components/ProductCard";
import { Row, Col, Container } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProductList } from "../../features/product/productSlice";
import Spinner from "react-bootstrap/Spinner"; // Bootstrap 스피너 컴포넌트 불러오기

const LandingPage = () => {
  const dispatch = useDispatch();
  const [query] = useSearchParams();
  const name = query.get("name");
  
   // 전역 상태에서 상품 리스트와 로딩 상태 가져오기
  const { productList, loading } = useSelector((state) => state.product);
   // 로컬 상태: 첫 진입 시 API 호출 완료 여부를 추적
  const [initialLoading, setInitialLoading] = useState(true);
  // 목표 initialLoading이라는 별도 상태로 초기 로딩 여부를 제어
useEffect(() => {
  // API 요청 보내고, 요청이 끝나면 무조건 initialLoading을 false로 변경
  dispatch(getProductList({ name })).finally(() => {
    setInitialLoading(false); // API 요청 성공/실패 상관없이 첫 로딩 완료 상태로 전환
  });
}, [query]);

  return (
    <Container>
      <Row>
        {initialLoading || loading ? (
          // 첫 로딩 중이거나 Redux의 loading 상태일 때 스피너 표시
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : Array.isArray(productList) && productList.length > 0 ? (
           // 상품이 존재하면 상품 카드 목록 표시
          productList.map((item) => (
            <Col md={3} sm={12} key={item._id}>
              <ProductCard item={item} />
            </Col>
          ))
        ) : (
          // 상품이 없을 때 조건 분기
          <div className="text-center empty-bag my-5">
            {name ? (
              <h2>{name}과 일치한 상품이 없습니다!</h2>
            ) : (
              <h2>등록된 상품이 없습니다!</h2>
            )}
          </div>
        )}
      </Row>
    </Container>
  );  
};

export default LandingPage;
