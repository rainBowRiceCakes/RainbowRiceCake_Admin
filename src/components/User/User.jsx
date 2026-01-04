import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './User.css'; 
import { excelDown } from '../../api/utils/excelDown.js';

// ★ Thunk Import (경로 확인 필요)
import { userIndexThunk } from '../../store/thunks/userThunk.js';
import UserCreate from './UserCreate.jsx';

function User() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ★ 1. Redux Store 구독
  // 백엔드 응답 구조: { users: [...], pagination: { total, totalPages, page, limit } }
  // store 설정 이름이 'userShow'라고 가정합니다. (다르다면 수정 필요)
  const { users, pagination, loading } = useSelector((state) => state.userShow);
  // --- Local States ---
  const [searchName, setSearchName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // 디바운싱된 검색어 (API 요청용)
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ★ 페이지당 개수 설정
  const limit = 9; 

  // --- 디바운싱 Effect ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchName);
      setCurrentPage(1); // 검색어 변경 시 1페이지로 초기화
    }, 500); // 500ms 지연

    return () => {
      clearTimeout(handler);
    };
  }, [searchName]);

  // ★ 2. 데이터 요청 함수
  const fetchUsers = useCallback(() => {
    // 쿼리 파라미터 구성
    const params = {
      page: currentPage,
      limit: limit,
      search: debouncedSearch, // 디바운싱된 검색어를 파라미터로 추가
    };

    dispatch(userIndexThunk(params));
  }, [dispatch, currentPage, limit, debouncedSearch]); // debouncedSearch를 의존성 배열에 추가

  // 페이지 로드 및 페이지 변경 시 실행
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Handlers ---

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const handleManageClick = (id) => {
    navigate(`/admin/user/${id}`);
  };

  // 엑셀 다운로드
  const handleDownloadExcel = () => {
    const columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '이름', key: 'name', width: 20 },
      { header: '이메일', key: 'email', width: 30 },
      { header: '권한', key: 'role', width: 15 },
      { header: '가입일', key: 'createdAt', width: 20 },
    ];
    
    // 안전한 데이터 매핑
    const excelData = users ? users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt ? u.createdAt.slice(0, 10) : '-'
    })) : [];

    const today = new Date().toISOString().slice(0, 10);
    excelDown(excelData, `Users_List_${today}`, columns);
  };

  return (
    <div className="user-container">
      <div className="user-title">User (회원 관리)</div>

      <div className="user-main-head">
        <div className="toggle-container">
          <span className="user-info-text">
            {pagination?.total ? `총 ${pagination.total}명의 회원이 있습니다.` : '회원 목록 조회'}
          </span>
        </div>

        <div className="head-action-group">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="이름 검색 (자동 검색)" 
              className="search-input"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <button className="btn-outline" onClick={handleDownloadExcel}>엑셀 다운로드</button>
          <button className="btn-black" onClick={() => setIsCreateModalOpen(true)}>+ 회원 등록</button>
        </div>
      </div>

      <div className="user-main-content">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>이메일</th>
              <th>권한</th>
              <th>가입일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding:'30px'}}>로딩 중...</td></tr>
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="fw-bold">{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {/* Role에 따른 뱃지 스타일 (CSS에 .role-badge 클래스 필요) */}
                    <span className={`role-badge ${user.role}`}>
                      {user.role ? user.role.toUpperCase() : 'USER'}
                    </span>
                  </td>
                  {/* 날짜 포맷팅 */}
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <button className="btn-detail" onClick={() => handleManageClick(user.id)}>
                      관리
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{textAlign:'center', padding:'30px'}}>데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>

        {/* 페이지네이션 (그룹 적용) */}
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
              {/* 이전 그룹으로 */}
              <button onClick={handlePrevGroup} disabled={startPage === 1}>&lt;&lt;</button>
              
              {/* 이전 페이지로 */}
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
              
              {/* 페이지 번호들 */}
              {pageNumbers.map(num => (
                <button 
                  key={num} 
                  className={currentPage === num ? 'active' : ''}
                  onClick={() => handlePageChange(num)}
                >
                  {num}
                </button>
              ))}

              {/* 다음 페이지로 */}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
              
              {/* 다음 그룹으로 */}
              <button onClick={handleNextGroup} disabled={endPage === totalPages}>&gt;&gt;</button>
            </div>
          );
        })()}
      </div>

      {/* 등록 모달 */}
      <UserCreate 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRefresh={fetchUsers} // 등록 성공 시 목록 새로고침
      />
    </div>
  );
}

export default User;