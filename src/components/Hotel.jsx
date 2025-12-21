import { useState } from 'react';
import './Hotel.css';

// 더미 데이터 (호텔 목록 - 담당자/전화번호 추가)
const mockHotels = [
  { id: 'H-1001', name: '신라호텔', manager: '김철수 지배인', phone: '02-2233-3131', address: '서울 중구 동호로 249', status: 'ACTIVE' },
  { id: 'H-1002', name: '조선 팰리스', manager: '이영희 매니저', phone: '02-555-1234', address: '서울 강남구 테헤란로 231', status: 'ACTIVE' },
  { id: 'H-1003', name: '롯데호텔 서울', manager: '박민수 팀장', phone: '02-771-1000', address: '서울 중구 을지로 30', status: 'INACTIVE' },
  { id: 'H-1004', name: '하얏트 리젠시', manager: '최지훈', phone: '032-745-1234', address: '인천 중구 공항로', status: 'ACTIVE' },
  { id: 'H-1005', name: '파라다이스 시티', manager: '정수진', phone: '1833-8855', address: '인천 중구 영종해안남로', status: 'INACTIVE' },
];

function Hotels() {
  const [viewType, setViewType] = useState('all'); // all(전체) | active(활동중)

  // 필터링 로직
  const filteredHotels = viewType === 'active' 
    ? mockHotels.filter(h => h.status === 'ACTIVE') 
    : mockHotels;

  return (
    <div className="hotel-container">
      
      {/* 1. 제목 영역 */}
      <div className="hotel-title">Hotel (제휴 호텔)</div>

      {/* 2. 헤더 영역 */}
      <div className="hotel-main-head">
        
        {/* 좌측: 보기 방식 토글 */}
        <div className="hotel-toggle-container">
          <button 
            className={`hotel-toggle-btn ${viewType === 'all' ? 'active' : ''}`} 
            onClick={() => setViewType('all')}
          >
            전체 호텔
          </button>
          <button 
            className={`hotel-toggle-btn ${viewType === 'active' ? 'active' : ''}`} 
            onClick={() => setViewType('active')}
          >
            활동 중
          </button>
        </div>

        {/* 우측: 검색 및 액션 */}
        <div className="hotel-action-group">
          <div className="hotel-search-box">
            <span className="hotel-search-icon">🔍</span>
            <input type="text" placeholder="호텔명, 담당자 검색" className="hotel-search-input" />
          </div>
          <button className="hotel-btn-outline">엑셀 다운로드</button>
          <button className="hotel-btn-black">+ 호텔 등록</button>
        </div>
      </div>

      {/* 3. 본문 영역 (테이블) */}
      <div className="hotel-main-content">
        <table className="hotel-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hotel Name</th>
              <th>Manager</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHotels.map((hotel) => (
              <tr key={hotel.id}>
                <td className="fw-bold">{hotel.id}</td>
                <td>{hotel.name}</td>
                <td>{hotel.manager}</td>
                <td>{hotel.phone}</td>
                <td>{hotel.address}</td>
                <td>
                  <div className="hotel-status-cell">
                    <span className={`status-dot ${hotel.status}`}></span>
                    {hotel.status === 'ACTIVE' ? '활동 중' : '활동 안함'}
                  </div>
                </td>
                <td>
                   <button className="hotel-btn-small gray">관리</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Hotels;