import React, { useState } from 'react';
import './Partner.css';

// 더미 데이터 (파트너 목록)
const mockPartners = [
  { id: 'P-1001', name: '올리브영 명동본점', manager: '매니저', address: '서울 중구 명동길 12', businessNum: '123-45-67890', status: 'ACTIVE' },
  { id: 'P-1002', name: '어디어디매장', manager: '매니저', address: '서울 중구 동호로 249', businessNum: '987-65-43210', status: 'ACTIVE' },
  { id: 'P-1003', name: '강남 기념품샵', manager: '매니저', address: '서울 강남구 테헤란로 1', businessNum: '111-22-33333', status: 'PENDING' },
  { id: 'P-1004', name: '인천공항 T1', manager: '매니저', address: '인천 중구 공항로', businessNum: '000-00-00000', status: 'ACTIVE' },
  { id: 'P-1005', name: '홍대 굿즈샵', manager: '매니저', address: '서울 마포구 양화로', businessNum: '444-55-66666', status: 'REJECTED' },
];

function Partner() {
  const [viewType, setViewType] = useState('all'); // all(전체) | pending(승인대기)

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
            <input type="text" placeholder="매장명, 주소 검색" className="partner-search-input" />
          </div>
          <button className="partner-btn-outline">엑셀 다운로드</button>
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
            {mockPartners.map((partner) => (
              <tr key={partner.id}>
                <td className="fw-bold">{partner.id}</td>
                <td>{partner.name}</td>
                <td>{partner.manager}</td>
                <td>{partner.businessNum}</td>
                <td>{partner.address}</td>
                <td>
                  <div className="partner-status-cell">
                    <span className={`status-dot ${partner.status}`}></span>
                    {partner.status}
                  </div>
                </td>
                <td>
                  {partner.status === 'PENDING' ? (
                    <button className="partner-btn-small blue">승인</button>
                  ) : (
                    <button className="partner-btn-small gray">관리</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Partner;