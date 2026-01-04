import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './QnA.css';
import { qnaShowThunk } from '../../store/thunks/qnaThunk';

function QnA() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State 구독 (store 이름은 qnaShow로 가정)
  const { qnas, pagination, loading } = useSelector((state) => state.qnaShow); 

  // Local States
  const [filter, setFilter] = useState('all'); // 'all' | 'waiting'
  const [searchTitle, setSearchTitle] = useState(''); // 실시간 입력
  const [debouncedSearch, setDebouncedSearch] = useState(''); // 디바운싱된 검색어 (API 요청용)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 페이지당 항목 수

  // --- 디바운싱 Effect ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTitle);
      setCurrentPage(1); // 검색어 변경 시 1페이지로 초기화
    }, 500); // 500ms 지연

    return () => {
      clearTimeout(handler);
    };
  }, [searchTitle]);

  // 데이터 요청 함수 (페이지네이션, 필터, 검색 포함)
  const fetchQnAs = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
    };
    if (filter === 'waiting') {
      params.status = false; // 답변 대기 중
    }
    dispatch(qnaShowThunk(params));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearch, filter]);

  // 페이지 로드 및 파라미터 변경 시 실행
  useEffect(() => {
    fetchQnAs();
  }, [fetchQnAs]);

  // 필터 변경 시 현재 페이지와 검색어 초기화
  useEffect(() => {
    setCurrentPage(1);
    setSearchTitle('');
    setDebouncedSearch('');
  }, [filter]);

  // 상세 페이지 이동
  const handleDetailClick = (id) => {
    navigate(`/admin/qna/${id}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="qna-container">
      <div className="qna-title">QnA Management (문의 관리)</div>
      
      {/* 헤더 (토글 필터) */}
      <div className="qna-head">
        <div className="qna-toggle-group">
          <button 
            className={`toggle-btn ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => setFilter('all')}
          >
            전체 문의
          </button>
          <button 
            className={`toggle-btn ${filter === 'waiting' ? 'active' : ''}`} 
            onClick={() => setFilter('waiting')}
          >
            답변 대기
          </button>
        </div>
        
        {/* 검색창 */}
        <div className="qna-search-box">
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="제목 검색 (자동 검색)" 
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="qna-table-wrapper">
        <table className="qna-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>답변상태</th>
              <th>제목</th>
              <th>유저명</th>
              <th>Image 여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="6" style={{textAlign:'center', padding:'40px'}}>로딩 중...</td></tr>
            ) : qnas && qnas.length > 0 ? (
              qnas.map(item => (
                <tr key={item.id} className="clickable-row">
                  <td className="fw-bold">{item.id}</td>
                  <td>
                    {item.status ? (
                      <span className="status-dot complete" title="답변완료"></span> 
                    ) : (
                      <span className="status-dot waiting" title="대기중"></span>
                    )}
                    {item.status ? '답변 완료' : '답변 대기'}
                  </td>
                  <td className="text-left fw-bold">{item.title}</td>
                  <td>
                    {item.question_user?.name ? item.question_user.name : <span className="text-gray">비회원</span>}
                  </td>
                  <td>
                    {/* qnaImg가 null이 아니고 빈 문자열도 아닐 때 아이콘 표시 */}
                    {item.qnaImg ? <span className="img-icon">📷</span> : <span className="text-gray">-</span>}
                  </td>
                  <td>
                    <button 
                      className="qna-btn-small gray" 
                      style={{padding: '6px 12px', fontSize:'12px'}}
                      onClick={(e) => { e.stopPropagation(); handleDetailClick(item.id); }}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="no-data">문의 내역이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination && pagination.totalPages > 1 && (() => {
          const PAGE_GROUP_SIZE = 10;
          const totalPages = pagination.totalPages;
          
          const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
          
          let startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
          let endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

          const pageNumbers = [];
          for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
          }

          const handlePrevGroup = () => {
            const newPage = startPage - PAGE_GROUP_SIZE;
            handlePageChange(newPage < 1 ? 1 : newPage);
          };

          const handleNextGroup = () => {
            const newPage = startPage + PAGE_GROUP_SIZE;
            handlePageChange(newPage > totalPages ? totalPages : newPage);
          };

          return (
            <div className="pagination">
              <button onClick={handlePrevGroup} disabled={startPage === 1}>&lt;&lt;</button>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
              {pageNumbers.map(num => (
                <button 
                  key={num} 
                  className={currentPage === num ? 'active' : ''}
                  onClick={() => handlePageChange(num)}
                >
                  {num}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
              <button onClick={handleNextGroup} disabled={endPage === totalPages}>&gt;&gt;</button>
            </div>
          );
        })()}

    </div>
  );
}

export default QnA;