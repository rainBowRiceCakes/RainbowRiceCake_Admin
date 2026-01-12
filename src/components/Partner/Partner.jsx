import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Partner.css';
import { excelDown } from '../../api/utils/excelDown.js';
import { partnerShowThunk } from '../../store/thunks/partnerThunk.js';
import PartnerCreate from './PartnerCreate';

const getStatusText = (status) => {
  switch (status) {
    case 'REQ': return '대기중';
    case 'RES': return '승인';
    case 'REJ': return '거절';
    default: return status;
  }
};

function Partner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux Store 구독 (서버 사이드)
  const { partners, pagination, loading } = useSelector(state => state.partnerShow);

  // Local States
  const [viewType, setViewType] = useState('all'); // all | pending
  const [searchPartner, setSearchPartner] = useState(''); // 검색어 (실시간)
  const [debouncedSearch, setDebouncedSearch] = useState(''); // 디바운싱된 검색어
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 디바운싱 Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchPartner);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchPartner]);
  
  // 보기 방식 변경 시 1페이지로
  useEffect(() => {
    setCurrentPage(1);
  }, [viewType]);

  // 데이터 요청
  const fetchPartners = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
    };
    if (viewType === 'pending') {
      params.status = 'REQ';
    }
    dispatch(partnerShowThunk(params));
  }, [dispatch, currentPage, itemsPerPage, viewType, debouncedSearch]);

  // 메인 Effect (데이터 로딩 트리거)
  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Handlers
  const handleManageClick = (partner) => {
    navigate(`/admin/partner/${partner.id}`);
  };

  const handleDownloadExcel = () => {
    const columns = [
      { header: 'Partner ID', key: 'id', width: 15 },
      { header: '매장명', key: 'krName', width: 20 },
      { header: '매니저', key: 'manager', width: 15 },
      { header: '주소', key: 'address', width: 30 },
      { header: '사업자번호', key: 'businessNum', width: 20 },
      { header: '상태', key: 'statusText', width: 10 },
    ];
    const today = new Date().toISOString().slice(0, 10);
    const excelData = (partners || []).map(p => ({
      ...p,
      statusText: getStatusText(p.status)
    }));
    excelDown(excelData, `Partners_${today}`, columns);
  };

  return (
    <div className="partner-container">
      <div className="partner-title">Partner (제휴 매장)</div>

      <div className="partner-main-head">
        <div className="partner-toggle-container">
          <button 
            className={`partner-toggle-btn ${viewType === 'all' ? 'active' : ''}`} 
            onClick={() => setViewType('all')}
          >
            전체 제휴처
          </button>
          <button 
            className={`partner-toggle-btn ${viewType === 'pending' ? 'active' : ''}`} 
            onClick={() => setViewType('pending')}
          >
            승인 대기
          </button>
        </div>

        <div className="partner-action-group">
          <div className="partner-search-box">
            <span className="partner-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="매장명 검색 (자동 검색)" 
              className="partner-search-input" 
              value={searchPartner} 
              onChange={(e) => setSearchPartner(e.target.value)} 
            />
          </div>
          <button className="partner-btn-outline" onClick={handleDownloadExcel}>엑셀 다운로드</button>
          <button className="partner-btn-black" onClick={() => setIsCreateModalOpen(true)}>+ 매장 등록</button>
        </div>
      </div>

      <div className="partner-main-content">
        <table className="partner-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>매장명</th>
              <th>매니저</th>
              <th>사업자번호</th>
              <th>주소</th>
              <th>가입상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>로딩 중...</td></tr>
            ) : partners && partners.length > 0 ? (
              partners.map((partner) => (
                <tr key={partner.id}>
                  <td className="fw-bold">{partner.id}</td>
                  <td>{partner.krName}</td> 
                  <td>{partner.manager}</td>
                  <td>{partner.businessNum}</td>
                  <td>{partner.address}</td>
                  <td>
                    <div className="partner-status-cell">
                      <span className={`status-dot ${partner.status}`}></span>
                      {getStatusText(partner.status)}
                    </div>
                  </td>
                  <td>
                    <button className="partner-btn-small gray" onClick={() => handleManageClick(partner)}>관리</button>
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

      <PartnerCreate 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onRefresh={fetchPartners} 
      />

    </div>
  );
}

export default Partner;