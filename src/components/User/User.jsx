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
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ★ 페이지당 개수 설정
  const limit = 9; 

  // ★ 2. 데이터 요청 함수
  const fetchUsers = useCallback(() => {
    // 쿼리 파라미터 구성
    const params = {
      page: currentPage,
      limit: limit
    };

    dispatch(userIndexThunk(params));
  }, [dispatch, currentPage]);

  // 페이지 로드 및 페이지 변경 시 실행
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Handlers ---

  // 검색 핸들러 (Enter 키)
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1); // 검색 시 1페이지로 초기화
      // fetchUsers는 의존성 배열에 searchName이 없으므로, 
      // 여기서 직접 dispatch하거나 useEffect 의존성을 조정해야 함.
      // 가장 간단한 방법: searchName을 state로 관리하고, useEffect 의존성에 넣되 디바운싱(지연) 처리.
      // 여기서는 수동 호출 방식으로 구현:
      dispatch(userIndexThunk({ page: 1, limit}));
    }
  };

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
              placeholder="이름 검색 (Enter)" 
              className="search-input"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={handleSearch}
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

        {/* 페이지네이션 (서버 데이터 기반) */}
        {pagination && pagination.totalPages > 0 && (
          <div className="pagination">
            <button 
              disabled={currentPage === 1} 
              onClick={() => handlePageChange(currentPage - 1)}
            >
              &lt;
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num} 
                className={currentPage === num ? 'active' : ''}
                onClick={() => handlePageChange(num)}
              >
                {num}
              </button>
            ))}

            <button 
              disabled={currentPage === pagination.totalPages} 
              onClick={() => handlePageChange(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        )}
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