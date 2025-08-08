import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { ColorRing } from "react-loader-spinner";
import { currencyFormat } from "../../utils/number";
import "./style/productDetail.style.css";
import { getProductDetail } from "../../features/product/productSlice";
import { addToCart } from "../../features/cart/cartSlice";

const ProductDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { selectedProduct, loading, error } = useSelector((state) => state.product);
  const user = useSelector((state) => state.user.user);

  const [size, setSize] = useState("");
  const [sizeError, setSizeError] = useState(false);
  
 

  const addItemToCart = () => {
    //사이즈를 아직 선택안했다면 에러
    // 아직 로그인을 안한유저라면 로그인페이지로
    // 카트에 아이템 추가하기
  };
  const selectSize = (value) => {
    // 사이즈 추가하기
    setSize(value);          // 선택된 사이즈 상태 저장
    setSizeError(false);     // 에러 메시지 숨김
  };

  useEffect(() => {
    if (id) dispatch(getProductDetail(id));
  }, [id, dispatch]);

// if (loading) {
//   return (
//     <div className="center-wrapper">
//       <ColorRing visible height="80" width="80" ariaLabel="blocks-loading" />
//     </div>
//   );
// }

if (loading) {
  return (
    <div className="center-wrapper">
      <ColorRing
        visible
        height="80"
        width="80"
        ariaLabel="blocks-loading"
        colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
      />
    </div>
  );
}

// 에러
if (error) {
  return (
    <div className="center-wrapper warning-message">
      {error}
    </div>
  );
}

if (!selectedProduct) {
  return <div className="warning-message">상품을 불러오지 못했습니다.</div>;
}
// -----------------------------

const stock = selectedProduct.stock || {};

return (
  <Container className="product-detail-card">
    <Row>
      <Col sm={6}>
        <img src={selectedProduct.image} className="w-100" alt="product" />
      </Col>

      <Col className="product-info-area" sm={6}>
        <div className="product-info">{selectedProduct.name}</div>
        <div className="product-info">₩ {currencyFormat(selectedProduct.price)}</div>
        <div className="product-info">{selectedProduct.description}</div>

        <Dropdown
          className="drop-down size-drop-down"
          align="start"
          onSelect={selectSize}
        >
          <Dropdown.Toggle
            className="size-drop-down"
            variant={sizeError ? "outline-danger" : "outline-dark"}
            id="dropdown-basic"
          >
            {size === "" ? "사이즈 선택" : size.toUpperCase()}
          </Dropdown.Toggle>

          <Dropdown.Menu className="size-drop-down">
            {Object.keys(stock).length > 0
              ? Object.keys(stock).map((s, idx) => (
                  <Dropdown.Item
                    eventKey={s}
                    key={idx}
                    disabled={!(stock[s] > 0)} // 재고 0이면 비활성화
                  >
                    {s.toUpperCase()} {stock[s] <= 0 ? "(품절)" : ""}
                  </Dropdown.Item>
                ))
              : <Dropdown.Item disabled>사이즈 정보 없음</Dropdown.Item>}
          </Dropdown.Menu>
        </Dropdown>

        <div className="warning-message">{sizeError && "사이즈를 선택해주세요."}</div>

        <Button variant="dark" className="add-button" onClick={addItemToCart}>
          추가
        </Button>
      </Col>
    </Row>
  </Container>
);

}; // ProductDetail 닫는 중괄호

export default ProductDetail;
