import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "react-router-dom";

// - URL 쿼리필드(field)와 입력값을 동기화(브라우저 앞/뒤 이동 시 값 일치 보장)
// - Enter: 기존 검색조건 유지 + page=1로 리셋 후 해당 field만 갱신
// - Escape: 현재 필드 필터 제거 + page=1, 포커스 유지
const SearchBox = ({ searchQuery, setSearchQuery, placeholder, field }) => {
  const [query] = useSearchParams();
  const [keyword, setKeyword] = useState(query.get(field) || "");

  const inputRef = useRef(null);

  // URL 쿼리스트링이 바뀌면(앞/뒤 이동 포함) 입력값을 동기화
  useEffect(() => {
    setKeyword(query.get(field) || "");
  }, [query, field]);

  // 엔터 입력 시 검색 실행
  const onCheckEnter = (event) => {
    if (event.key === "Enter") {
      // 기존 검색조건을 유지하면서 페이지를 1로 리셋하고 현재 필드 값으로 덮어쓴다
      setSearchQuery({ ...searchQuery, page: 1, [field]: event.target.value });
    }
    
    if (event.key === "Escape") {
      handleClear();
    }
  };

  // 입력값 비우고 해당 필드 필터 제거, page=1로 리셋, 포커스 유지
  const handleClear = () => {
    setKeyword("");
   
    const { [field]: omitted, ...rest } = searchQuery;
    setSearchQuery({ ...rest, page: 1 });
    inputRef.current?.focus();
  };

  return (
   
    <div className="search-box" style={{ position: "relative" }}>
      <FontAwesomeIcon icon={faSearch} />
      <input
        ref={inputRef} 
        type="text"
        placeholder={placeholder}
        onKeyDown={onCheckEnter}
        onChange={(event) => setKeyword(event.target.value)}
        va
        style={{ paddingRight: 48 }}
      />
      {/*
        keyword가 존재할 때만 삭제 버튼을 노출한다
        시각적 혼잡과 불필요한 포커스 흐름을 줄이기 위함
      */}
      {keyword && (
        <button
          type="button"
          onClick={handleClear}
          // 인풋 안쪽 오른쪽에 겹치게 배치
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            cursor: "pointer"
          }}
        >
          삭제
        </button>
      )}
    </div>
  );
};

export default SearchBox;

