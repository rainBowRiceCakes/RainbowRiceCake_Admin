import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Partner.css'; // 제공해주신 CSS 파일 import
import { excelDown } from '../../api/utils/excelDown.js';

// ★ Thunk 및 모달 컴포넌트 import
import { partnerShowThunk } from '../../store/thunks/partnerThunk.js';
import PartnerCreate from './PartnerCreate';

// 상태 코드를 읽기 편한 텍스트로 변환하는 함수
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

  // ★ 1. Redux Store 구독 (state.partner.partners)
  const { show, loading } = useSelector(state => state.partnerShow);
  console.log(show);
  // ★ 2. 데이터 새로고침 함수
  const refreshList = useCallback(() => {
    dispatch(partnerShowThunk())
  }, [dispatch]);

  useEffect(() => {
    refreshList();
  }, []);

  // --- Local States ---
  const [viewType, setViewType] = useState('all'); // all | pending
  const [searchPartner, setSearchPartner] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // 모달 상태

  // --- Handlers ---

  // 상세 페이지 이동
  const handleManageClick = (partner) => {
    navigate(`/admin/partner/${partner.id}`);
  };

  // 엑셀 다운로드
  const handleDownloadExcel = () => {
    const columns = [
      { header: 'Partner ID', key: 'id', width: 15 },
      { header: '매장명', key: 'krName', width: 20 }, // ★ krName 사용 확인
      { header: '매니저', key: 'manager', width: 15 },
      { header: '주소', key: 'address', width: 30 },
      { header: '사업자번호', key: 'businessNum', width: 20 },
      { header: '상태', key: 'statusText', width: 10 },
    ];
    
    const today = new Date().toISOString().slice(0, 10);
    
    // 데이터 가공 (상태 코드 -> 텍스트)
    const excelData = show.map(p => ({
      ...p,
      statusText: getStatusText(p.status)
    }));
    
    excelDown(excelData, `Partners_${today}`, columns);
  };

  // --- Filtering & Pagination ---
  
  const safePartners = show || [];
  const filteredPartners = safePartners.filter((partner) => {
    // 1. 상태 필터 ('REQ'가 대기중)
    const isStatusMatched = viewType === 'pending' ? partner.status === 'REQ' : true;
    
    // 2. 검색어 필터 (★ krName 기준 검색)
    const partnerName = partner.krName || ''; 
    const isSearchMatched = partnerName.toLowerCase().includes(searchPartner.toLowerCase());

    return isStatusMatched && isSearchMatched;
  });

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const currentItems = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="partner-container">
      
      {/* 1. 제목 영역 */}
      <div className="partner-title">Partner (제휴 관리)</div>

      {/* 2. 헤더 영역 */}
      <div className="partner-main-head">
        <div className="partner-toggle-container">
          <button 
            className={`partner-toggle-btn ${viewType === 'all' ? 'active' : ''}`} 
            onClick={() => { setViewType('all'); setCurrentPage(1); }}
          >
            전체 제휴처
          </button>
          <button 
            className={`partner-toggle-btn ${viewType === 'pending' ? 'active' : ''}`} 
            onClick={() => { setViewType('pending'); setCurrentPage(1); }}
          >
            승인 대기
          </button>
        </div>

        <div className="partner-action-group">
          <div className="partner-search-box">
            <span className="partner-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="매장명 검색" 
              className="partner-search-input" 
              value={searchPartner} 
              onChange={(e) => setSearchPartner(e.target.value)} 
            />
          </div>
          <button className="partner-btn-outline" onClick={handleDownloadExcel}>엑셀 다운로드</button>
          <button className="partner-btn-black" onClick={() => setIsCreateModalOpen(true)}>+ 매장 등록</button>
        </div>
      </div>

      {/* 3. 본문 영역 */}
      <div className="partner-main-content">
        <table className="partner-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Store Name</th>
              <th>Manager</th>
              <th>Business Num</th>
              <th>Address</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>로딩 중...</td></tr>
            ) : (
              <>
                {currentItems.map((partner) => (
                  <tr key={partner.id}>
                    <td className="fw-bold">{partner.id}</td>
                    {/* ★ krName 데이터 출력 */}
                    <td>{partner.krName}</td> 
                    <td>{partner.manager}</td>
                    <td>{partner.businessNum}</td>
                    <td>{partner.address}</td>
                    <td>
                      <div className="partner-status-cell">
                        {/* CSS 클래스와 매칭: .status-dot.REQ / .status-dot.RES */}
                        <span className={`status-dot ${partner.status}`}></span>
                        {getStatusText(partner.status)}
                      </div>
                    </td>
                    <td>
                      <button className="partner-btn-small gray" onClick={() => handleManageClick(partner)}>관리</button>
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

        {/* 4. 페이지네이션 */}
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button key={num} className={currentPage === num ? 'active' : ''} onClick={() => setCurrentPage(num)}>{num}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>&gt;</button>
        </div>
      </div>

      {/* 5. 매장 등록 모달 */}
      <PartnerCreate 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onRefresh={refreshList} 
      />

    </div>
  );
}

export default Partner;