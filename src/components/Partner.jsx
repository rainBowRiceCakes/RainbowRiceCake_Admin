import { useState } from 'react';
import './Partner.css';
import { excelDown } from '../api/utils/excelDown.js';

// 더미 데이터 (파트너 목록)
// 더미 데이터 (파트너 목록)
const mockPartners = [
  { id: 'P-1001', name: '올리브영 명동본점', manager: '매니저', address: '서울 중구 명동길 12', businessNum: '123-45-67890', status: 'RES' },
  { id: 'P-1002', name: '어디어디매장', manager: '매니저', address: '서울 중구 동호로 249', businessNum: '987-65-43210', status: 'RES' },
  { id: 'P-1003', name: '강남 기념품샵', manager: '매니저', address: '서울 강남구 테헤란로 1', businessNum: '111-22-33333', status: 'REQ' },
  { id: 'P-1004', name: '인천공항 T1', manager: '매니저', address: '인천 중구 공항로', businessNum: '000-00-00000', status: 'RES' },
  { id: 'P-1005', name: '홍대 굿즈샵', manager: '매니저', address: '서울 마포구 양화로', businessNum: '444-55-66666', status: 'REJ' },
];

const getStatusText = (status) => {
  switch (status) {
    case 'REQ':
      return '대기중';
    case 'RES':
      return '승인';
    case 'REJ':
      return '거절';
    default:
      return status;
  }
};

function Partner() {
  const [viewType, setViewType] = useState('all'); // all(전체) | pending(승인대기)
  const [searchPartner, setSearchPartner] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // // 필터링 로직
  const filteredPartners = mockPartners.filter((partner) => {
    const isStatusMatched = viewType === 'pending' ? partner.status === 'REQ' : true;

    const isSearchMatched = partner.name.toLowerCase().includes(searchPartner.toLowerCase());

    return isStatusMatched && isSearchMatched;
  });

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const currentItems = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
    const handleDownloadExcel = () => {
      // 1. 엑셀에 정의할 컬럼 설정 (width로 너비 조절 가능)
      const columns = [
        { header: 'Partner ID', key: 'id', width: 15 },
        { header: '매장명', key: 'name', width: 15 },
        { header: '매니저', key: 'manager', width: 20 },
        { header: '주소', key: 'address', width: 20 },
        { header: '사업자번호', key: 'businessNum', width: 20 },
        { header: '상태', key: 'status', width: 15 },
      ];
  
      // 2. 파일명 생성 (예: Partners_2025-06-25)
      const today = new Date().toISOString().slice(0, 10);
      
      // 3. 함수 실행 (데이터는 현재 필터링된 데이터를 넣거나 전체 데이터를 넣음)
      excelDown(mockPartners, `Partners_${today}`, columns);
    };

  return (
    <div className="partner-container">
      
      {/* 1. 제목 영역 */}
      <div className="partner-title">Partner (제휴 관리)</div>

      {/* 2. 헤더 영역 */}
      <div className="partner-main-head">
        
        {/* 좌측: 보기 방식 토글 */}
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

        {/* 우측: 검색 및 액션 */}
        <div className="partner-action-group">
          <div className="partner-search-box">
            <span className="partner-search-icon">🔍</span>
            <input type="text" placeholder="매장명, 주소 검색" className="partner-search-input" value={searchPartner} onChange={(e) => setSearchPartner(e.target.value)} />
          </div>
          <button className="partner-btn-outline" onClick={handleDownloadExcel}>엑셀 다운로드</button>
          <button className="partner-btn-black">+ 매장 등록</button>
        </div>
      </div>

      {/* 3. 본문 영역 (테이블) - 체크박스 제거됨 */}
      <div className="partner-main-content">
        <table className="partner-table">
          <thead>
            <tr>
              {/* 체크박스 컬럼 제거됨 */}
              <th>ID</th>
              <th>Store Name</th>
              <th>manager</th>
              <th>Business Num</th>
              <th>Address</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((partner) => (
              <tr key={partner.id}>
                <td className="fw-bold">{partner.id}</td>
                <td>{partner.name}</td>
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
                  {partner.status === 'REQ' ? (
                    <button className="partner-btn-small blue">승인</button>
                  ) : (
                    <button className="partner-btn-small gray">관리</button>
                  )}
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>

        {/* 6. 페이지네이션 */}
        <div className="pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button 
              key={num} 
              className={currentPage === num ? 'active' : ''}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            &gt;
          </button>
        </div>
      </div>

    </div>
  );
}

export default Partner;