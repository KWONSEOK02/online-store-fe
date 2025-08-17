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
    name: query.get("name") || "", 
  }); 

  const [mode, setMode] = useState("new");
  const [initialLoading, setInitialLoading] = useState(true); 

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

  // URL 쿼리에 맞춰 목록 요청 & 버튼 동기화
  useEffect(() => {
    const pageFromUrl = Number(query.get("page") || 1);
    const nameFromUrl = query.get("name") || "";
    setSearchQuery((prev) => ({ ...prev, page: pageFromUrl, name: nameFromUrl }));

    dispatch(getProductList({ page: pageFromUrl, name: nameFromUrl }))
      .finally(() => setInitialLoading(false));
  }, [dispatch, query]);
  
  useEffect(() => {
    // searchQuery 변경 시 URL 동기화
    if (searchQuery.name === "") {
      delete searchQuery.name;
    }
    const params = new URLSearchParams(searchQuery);  
    const query = params.toString();
    navigate("?" + query);    
  }, [searchQuery]);

  const deleteItem = async  (id) => {
    if (!window.confirm("정말 삭제하시겠어요?")) return;

    const action = await dispatch(deleteProduct(id));

    if (deleteProduct.fulfilled.match(action)) {
    // 현재 페이지 마지막 1개를 지웠다면 페이지 한 칸 앞으로
      if (productList.length === 1 && Number(searchQuery.page) > 1) {
        setSearchQuery({ ...searchQuery, page: Number(searchQuery.page) - 1 });
      } else {
      dispatch(getProductList({ ...searchQuery }));
      }
    } else {
      dispatch(showToastMessage({ message: action.payload || "삭제 실패", status: "error" }));
    }
  };

  const openEditForm = (product) => {
    setMode("edit");
    dispatch(setSelectedProduct(product));
    setShowDialog(true);
  };

  const handleClickNewItem = () => {
    setMode("new");
    setShowDialog(true);

  };

  const refreshList = () => {
    setSearchQuery((prev) => ({ ...prev, page: 1 }));
  };  

  const handlePageClick = ({ selected }) => {
    const newPage = selected + 1;
    setSearchQuery({ ...searchQuery, page: newPage });
  };
  
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

        <div className="d-flex gap-2 mt-2 mb-2">
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/")}
            aria-label="Go to Home"
          >
            ← Home
          </Button>
          <Button className="mt-2 mb-2" onClick={handleClickNewItem}>
            Add New Item +
          </Button>
        </div>
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
          forcePage={Number(searchQuery.page) - 1}
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
        refreshList={refreshList}
      />
    </div>
  );
};

export default AdminProductPage;
