import React from "react";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { currencyFormat } from "../../../utils/number";

const ProductTable = ({ header, data, deleteItem, openEditForm, searchKeyword, initialLoading }) => {
  return (
    <div className="overflow-x">
      <Table striped bordered hover>
        <thead>
          <tr>
            {header.map((title, index) => (
              <th key={index}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <th>{index}</th>
                <th>{item.sku}</th>
                <th style={{ minWidth: "100px" }}>{item.name}</th>
                <th>{currencyFormat(item.price)}</th>
                <th>
                  {Object.keys(item.stock).map((size, index) => (
                    <div key={index}>
                      {size}:{item.stock[size]}
                    </div>
                  ))}
                </th>
                <th>
                  <img src={item.image} width={100} alt="image" />
                </th>
                <th>{item.status}</th>
                <th style={{ minWidth: "100px" }}>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteItem(item._id)}
                    className="mr-1"
                  >
                    -
                  </Button>
                  <Button size="sm" onClick={() => openEditForm(item)}>
                    Edit
                  </Button>
                </th>
              </tr>
            ))
          ) : !initialLoading ? ( // 초기 로딩 중이 아닐 때만 결과 없음 표시
            <tr>
              <td colSpan={header.length} className="text-center">
                {searchKeyword?.trim()
                  ? `"${searchKeyword}" 검색 결과 없음`
                  : "등록된 상품이 없습니다"}
              </td>
            </tr>
          ) : null}
        </tbody>
      </Table>
    </div>
  );
};

export default ProductTable;
