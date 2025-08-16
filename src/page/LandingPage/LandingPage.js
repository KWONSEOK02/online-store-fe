import React, { useEffect, useState } from "react";
import ProductCard from "./components/ProductCard";
import { Row, Col, Container } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProductList } from "../../features/product/productSlice";
import Spinner from "react-bootstrap/Spinner";

// Landing: URL 쿼리(name)와 동기화해 목록을 요청하고, 초기 깜빡임 방지를 위해 initialLoading으로 첫 로딩만 별도 처리
const LandingPage = () => {
  const dispatch = useDispatch();
  const [query] = useSearchParams();
  const name = query.get("name");
  
  const { productList, loading } = useSelector((state) => state.product);
  const [initialLoading, setInitialLoading] = useState(true);
useEffect(() => {
  dispatch(getProductList({ name })).finally(() => {
    setInitialLoading(false); 
  });
}, [query]);

  return (
    <Container>
      <Row>
        {initialLoading || loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : Array.isArray(productList) && productList.length > 0 ? (
          productList.map((item) => (
            <Col md={3} sm={12} key={item._id}>
              <ProductCard item={item} />
            </Col>
          ))
        ) : (
          <div className="text-center empty-bag my-5">
            {name ? (
              <h2>{name} 검색 결과 없음.</h2> 
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
