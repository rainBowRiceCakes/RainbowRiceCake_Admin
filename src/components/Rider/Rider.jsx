import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Rider.css'; // Partner.css와 스타일 공유하거나 복사
import { excelDown } from '../../api/utils/excelDown.js';

// ★ Thunk & Component Import
import { riderShowThunk } from '../../store/thunks/riderThunk.js'; // 경로 확인
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

  // Redux State 구독
  const { show, loading } = useSelector((state) => state.riderShow);

  // 데이터 새로고침
  const refreshList = useCallback(() => {
    dispatch(riderShowThunk());
  }, [dispatch]);

  useEffect(() => {
    refreshList();
  }, []);

  // Local State
  const [viewType, setViewType] = useState('all');
  const [searchRider, setSearchRider] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    const safeData = show || [];
    const excelData = safeData.map(r => ({
      ...r,
      statusText: getStatusText(r.status)
    }));
    
    excelDown(excelData, `Riders_${today}`, columns);
  };

  // Filter & Pagination
  const safeRiders = show || [];
  const filteredRiders = safeRiders.filter((rider) => {
    const isStatusMatched = viewType === 'pending' ? rider.status === 'REQ' : true;
    const riderName = rider.rider_user.name || '';
    const isSearchMatched = riderName.toLowerCase().includes(searchRider.toLowerCase()) || 
                            rider.phone?.includes(searchRider);
    return isStatusMatched && isSearchMatched;
  });

  const totalPages = Math.ceil(filteredRiders.length / itemsPerPage);
  const currentItems = filteredRiders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              <th>Name</th>
              <th>Phone</th>
              <th>isWork</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>로딩 중...</td></tr>
            ) : (
              <>
                {currentItems.map((rider) => (
                  <tr key={rider.id}>
                    <td className="fw-bold">{rider.id}</td>
                    <td>{rider.rider_user.name}</td>
                    <td>{rider.phone}</td>
                    <td>
                      {/* 출근 여부 표시 */}
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
                ))}
                {currentItems.length === 0 && (
                  <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>데이터가 없습니다.</td></tr>
                )}
              </>
            )}
          </tbody>
        </table>
        
        {/* 페이지네이션 (Partner와 동일) */}
        <div className="pagination">
             {/* ... Partner와 동일한 페이지네이션 코드 ... */}
             <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>&lt;</button>
             {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
               <button key={num} className={currentPage === num ? 'active' : ''} onClick={() => setCurrentPage(num)}>{num}</button>
             ))}
             <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>&gt;</button>
        </div>
      </div>

      {/* 모달 */}
      <RiderCreate 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onRefresh={refreshList} 
      />
    </div>
  );
}

export default Riders;