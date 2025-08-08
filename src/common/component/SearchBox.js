// import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSearch } from "@fortawesome/free-solid-svg-icons";
// import { useSearchParams } from "react-router-dom";

// const SearchBox = ({ searchQuery, setSearchQuery, placeholder, field }) => {
//   const [query] = useSearchParams();
//   const [keyword, setKeyword] = useState(query.get(field) || ""); 
//   //  URL 쿼리스트링에서 특정 검색 조건(field)을 읽어와서 keyword 상태로 저장

//   const onCheckEnter = (event) => {
//     if (event.key === "Enter") {
//       setSearchQuery({ ...searchQuery, page: 1, [field]: event.target.value });
//     }
//   };
//   return (
//     <div className="search-box">
//       <FontAwesomeIcon icon={faSearch} />
//       <input
//         type="text"
//         placeholder={placeholder}
//         onKeyPress={onCheckEnter}
//         onChange={(event) => setKeyword(event.target.value)}
//         value={keyword}
//       />
//     </div>
//   );
// };

// export default SearchBox;

import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "react-router-dom";

const SearchBox = ({ searchQuery, setSearchQuery, placeholder, field }) => {
  // Added 설명
  // keyword는 인풋의 현재 값이다
  // URL 쿼리 파라미터와 동기화를 위해 useSearchParams를 사용한다
  const [query] = useSearchParams();
  const [keyword, setKeyword] = useState(query.get(field) || "");

  // Added 설명
  // 삭제 버튼 클릭 후에도 커서를 유지하기 위해 input에 ref를 단다
  const inputRef = useRef(null);

  // Added 설명
  // 외부에서 쿼리스트링이 변경되면 인풋 값도 맞춰준다
  // 검색 결과 페이지에서 브라우저 앞으로 가기 뒤로 가기 시 값 불일치 방지를 위함
  useEffect(() => {
    setKeyword(query.get(field) || "");
  }, [query, field]);

  // 엔터 입력 시 검색 실행
  const onCheckEnter = (event) => {
    if (event.key === "Enter") {
      // 기존 검색조건을 유지하면서 페이지를 1로 리셋하고 현재 필드 값으로 덮어쓴다
      setSearchQuery({ ...searchQuery, page: 1, [field]: event.target.value });
    }
    // Added 설명
    // Escape 키로도 즉시 검색어를 지우도록 처리한다
    if (event.key === "Escape") {
      handleClear();
    }
  };

  // Added 설명
  // 검색어 삭제 동작
  // 1 인풋 값 초기화
  // 2 searchQuery 객체에서 해당 필드를 제거하여 실제 필터도 해제
  // 3 페이지를 1로 리셋
  // 4 포커스를 인풋에 유지
  const handleClear = () => {
    setKeyword("");
    // 필드 키를 제거하기 위해 구조 분해 할당으로 제외
    const { [field]: omitted, ...rest } = searchQuery;
    setSearchQuery({ ...rest, page: 1 });
    inputRef.current?.focus();
  };

  return (
    // relative 포지션은 오른쪽에 삭제 버튼을 겹쳐 배치하기 위한 것
    <div className="search-box" style={{ position: "relative" }}>
      <FontAwesomeIcon icon={faSearch} />
      <input
        ref={inputRef} // Added 설명 포커스 유지를 위한 ref
        type="text"
        placeholder={placeholder}
        onKeyDown={onCheckEnter}
        onChange={(event) => setKeyword(event.target.value)}
        value={keyword}
        // 오른쪽 삭제 버튼과 겹치지 않도록 여백 확보
        style={{ paddingRight: 48 }}
      />
      {/*
        Added 설명
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

