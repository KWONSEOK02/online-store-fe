import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "react-router-dom";

const SearchBox = ({ searchQuery, setSearchQuery, placeholder, field }) => {
  const [query] = useSearchParams();
  const [keyword, setKeyword] = useState(query.get(field) || ""); 
  //  URL 쿼리스트링에서 특정 검색 조건(field)을 읽어와서 keyword 상태로 저장

  const onCheckEnter = (event) => {
    if (event.key === "Enter") {
      setSearchQuery({ ...searchQuery, page: 1, [field]: event.target.value });
    }
  };
  return (
    <div className="search-box">
      <FontAwesomeIcon icon={faSearch} />
      <input
        type="text"
        placeholder={placeholder}
        onKeyPress={onCheckEnter}
        onChange={(event) => setKeyword(event.target.value)}
        value={keyword}
      />
    </div>
  );
};

export default SearchBox;
