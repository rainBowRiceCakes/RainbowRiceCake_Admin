import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Rider.css';
import { excelDown } from '../../api/utils/excelDown.js';
import { riderShowThunk } from '../../store/thunks/riderThunk.js';
import RiderCreate from './RiderCreate';

const getStatusText = (status) => {
  switch (status) {
    case 'REQ': return '대기중';
    case 'RES': return '승인';
    case 'REJ': return '거절';
    default: return status;
  }
};

function Riders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State 구독 (서버 사이드)
  const { riders, pagination, loading } = useSelector((state) => state.riderShow);

  // Local State
  const [viewType, setViewType] = useState('all'); // all | pending
  const [searchRider, setSearchRider] = useState(''); // 검색어 (실시간)
  const [debouncedSearch, setDebouncedSearch] = useState(''); // 디바운싱된 검색어 (API 요청용)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 디바운싱 Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchRider);
      setCurrentPage(1); // 검색 시 1페이지로
    }, 500);
    return () => clearTimeout(handler);
  }, [searchRider]);

  // 보기 방식 변경 시 1페이지로 및 검색어 초기화
  useEffect(() => {
    setCurrentPage(1);
    setSearchRider('');
    setDebouncedSearch('');
  }, [viewType]);

  // 데이터 요청
  const fetchRiders = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
    };
    if (viewType === 'pending') {
      params.status = 'REQ';
    }
    dispatch(riderShowThunk(params));
  }, [dispatch, currentPage, itemsPerPage, viewType, debouncedSearch]);

  // 메인 Effect (데이터 로딩 트리거)
  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  // Handlers
  const handleManageClick = (rider) => {
    navigate(`/admin/rider/${rider.id}`);
  };

  const handleDownloadExcel = () => {
    const columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '이름', key: 'name', width: 15 },
      { header: '전화번호', key: 'phone', width: 20 },
      { header: '은행', key: 'bank', width: 15 },
      { header: '계좌번호', key: 'bankNum', width: 20 },
      { header: '상태', key: 'statusText', width: 10 },
    ];
    
    const today = new Date().toISOString().slice(0, 10);
    const excelData = (riders || []).map(r => ({
      ...r,
      name: r.rider_user.name,
      statusText: getStatusText(r.status)
    }));
    
    excelDown(excelData, `Riders_${today}`, columns);
  };

  return (
    <div className="rider-container">
      <div className="rider-title">Rider (기사 관리)</div>

      <div className="rider-main-head">
        <div className="rider-toggle-container">
          <button className={`rider-toggle-btn ${viewType === 'all' ? 'active' : ''}`} onClick={() => setViewType('all')}>전체 기사</button>
          <button className={`rider-toggle-btn ${viewType === 'pending' ? 'active' : ''}`} onClick={() => setViewType('pending')}>승인 대기</button>
        </div>
        <div className="rider-action-group">
          <div className="rider-search-box">
            <span className="rider-search-icon">🔍</span>
            <input type="text" placeholder="이름, 전화번호 검색" className="rider-search-input" value={searchRider} onChange={(e) => setSearchRider(e.target.value)} />
          </div>
          <button className="rider-btn-outline" onClick={handleDownloadExcel}>엑셀 다운로드</button>
          <button className="rider-btn-black" onClick={() => setIsCreateModalOpen(true)}>+ 기사 등록</button>
        </div>
      </div>

      <div className="rider-main-content">
        <table className="rider-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>전화번호</th>
              <th>활동상태</th>
              <th>가입상태</th>
              <th>신청일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>로딩 중...</td></tr>
            ) : riders && riders.length > 0 ? (
              riders.map((rider) => (
                <tr key={rider.id}>
                  <td className="fw-bold">{rider.id}</td>
                  <td>{rider.rider_user?.name}</td>
                  <td>{rider.phone}</td>
                  <td>
                    <span className={`rider-work-tag ${rider.isWorking ? 'on' : 'off'}`}>
                      {rider.isWorking ? '출근' : '퇴근'}
                    </span>
                  </td>
                  <td>
                    <div className="rider-status-cell">
                      <span className={`status-dot ${rider.status}`}></span>
                      {getStatusText(rider.status)}
                    </div>
                  </td>
                  <td>{rider.createdAt ? rider.createdAt.slice(0, 10) : '-'}</td>
                  <td>
                      <button className="rider-btn-small gray" onClick={() => handleManageClick(rider)}>관리</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
        
        {/* 페이지네이션 (그룹 적용 - 서버 측) */}
        {pagination && pagination.totalPages > 1 && (() => {
          const PAGE_GROUP_SIZE = 10;
          const totalPages = pagination.totalPages;
          
          const handlePageChange = (newPage) => {
            if (newPage >= 1 && newPage <= totalPages) {
              setCurrentPage(newPage);
            }
          };

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

      <RiderCreate 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onRefresh={fetchRiders} 
      />
    </div>
  );
}

export default Riders;