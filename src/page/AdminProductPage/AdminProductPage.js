import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import SearchBox from "../../common/component/SearchBox";
import NewItemDialog from "./component/NewItemDialog";
import ProductTable from "./component/ProductTable";
import {
  getProductList,
  deleteProduct,
  setSelectedProduct,
} from "../../features/product/productSlice";
import { showToastMessage } from "../../features/common/uiSlice";

const AdminProductPage = () => {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const dispatch = useDispatch();
  const { productList, totalPageNum } = useSelector((state) => state.product);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    page: query.get("page") || 1,
    name: query.get("name") || "", // 초기 값
  }); //검색 조건들을 저장하는 객체

  const [mode, setMode] = useState("new");
  const [initialLoading, setInitialLoading] = useState(true); // 로딩 시작 상태

  const tableHeader = [
    "#",
    "Sku",
    "Name",
    "Price",
    "Stock",
    "Image",
    "Status",
    "",
  ];

  //상품리스트 가져오기 (url쿼리 맞춰서)
  useEffect(() => {
    dispatch(getProductList({ ...searchQuery })).finally(() => {
      setInitialLoading(false); // 로딩 완료 시 초기 로딩 종료
    });
  }, [query]);
  
  useEffect(() => {
    //검색어나 페이지가 바뀌면 url바꿔주기 (검색어또는 페이지가 바뀜 => url 바꿔줌=> url쿼리 읽어옴=> 이 쿼리값 맞춰서  상품리스트 가져오기)
    if (searchQuery.name === "") {
      delete searchQuery.name;
    }
    const params = new URLSearchParams(searchQuery);  //URLSearchParams는 객체 형태의 파라미터를 URL 쿼리스트링 형식으로 변환
    const query = params.toString();
    navigate("?" + query);    
  }, [searchQuery]);

  const deleteItem = async  (id) => {
    //아이템 삭제하기
    if (!window.confirm("정말 삭제하시겠어요?")) return;

    const action = await dispatch(deleteProduct(id));

    // 성공/실패 분기
    if (deleteProduct.fulfilled.match(action)) {
    // 현재 페이지 마지막 1개를 지웠다면 페이지 한 칸 앞으로
      if (productList.length === 1 && Number(searchQuery.page) > 1) {
        setSearchQuery({ ...searchQuery, page: Number(searchQuery.page) - 1 });
      } else {
      // 현재 페이지 유지한 채로 새로고침 원하면:
      dispatch(getProductList({ ...searchQuery }));
      // 또는 page를 1로 리셋해서 보고 싶으면:
      // setSearchQuery({ ...searchQuery, page: 1 });
      }
    } else {
    // 실패 시 에러 토스트 등 처리 (action.payload에 메시지)
      dispatch(showToastMessage({ message: action.payload || "삭제 실패", status: "error" }));
    }
  };

  const openEditForm = (product) => {
    // edit 모드로 설정하고
    setMode("edit");
    // 아이템 수정 다이얼로그 열어주기
    dispatch(setSelectedProduct(product));
    setShowDialog(true);
  };

  const handleClickNewItem = () => {
    // new 모드로 설정하고
    setMode("new");
    // 다이얼로그 열어주기
    setShowDialog(true);

  };

  const refreshList = () => {
    setSearchQuery({ ...searchQuery, page: 1 }); //1페이지로 이동하면서 리스트 갱신
  };  

  const handlePageClick = ({ selected }) => {
    //  쿼리에 페이지값 바꿔주기
    const newPage = selected + 1; // ReactPaginate는 0부터 시작하므로 +1
    setSearchQuery({ ...searchQuery, page: newPage });
  };
  //searchbox에서 검색어를 읽어온다 => 엔터를 치면 => searchQuery 객체가 업데이트가 됨 
  //=> searchQuery 객체 안에 아이템 기준으로 url을 새로 생성해서 호출 &name=스트레이트+팬츠
 //=> url쿼리 읽어오기 => url쿼리 기준으로 BE에 검색조건과 함께 호출함
  
  return (
    <div className="locate-center">
      <Container>
        <div className="mt-2">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="제품 이름으로 검색"
            field="name"
          />
        </div>
        <Button className="mt-2 mb-2" onClick={handleClickNewItem}>
          Add New Item +
        </Button>

        <ProductTable
          header={tableHeader}
          data={productList}
          deleteItem={deleteItem}
          openEditForm={openEditForm}
          searchKeyword={searchQuery.name}
          initialLoading={initialLoading}
        />
        <ReactPaginate
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={totalPageNum}
          forcePage={searchQuery.page - 1}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
          className="display-center list-style-none"
        />
      </Container>

      <NewItemDialog
        mode={mode}
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        refreshList={refreshList} // 상품 생성 성공 시 리스트를 갱신하기 위한 함수
      />
    </div>
  );
};

export default AdminProductPage;
