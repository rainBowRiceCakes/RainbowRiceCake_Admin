import { useState } from 'react';
import './Rider.css';

// 더미 데이터 (기사 목록)
const mockRiders = [
  { id: 'R-1001', name: '김철수', phone: '010-1234-5678', work: true, status: 'ACTIVE', create: '2025-11-12' },
  { id: 'R-1002', name: '이영희', phone: '010-9876-5432', work: false, status: 'PENDING', create: '2025-12-01' },
  { id: 'R-1003', name: '박민수', phone: '010-5555-4444', work: false, status: 'SUSPENDED', create: '2025-12-12' },
  { id: 'R-1004', name: '최지훈', phone: '010-1111-2222', work: true, status: 'ACTIVE', create: '2025-11-12' },
  { id: 'R-1005', name: '정수진', phone: '010-7777-8888', work: false, status: 'ACTIVE', create: '2025-11-25' },
];

function Riders() {
  const [viewType, setViewType] = useState('all'); // all(전체) | pending(승인대기)

  return (
    <div className="rider-container">
      
      {/* 1. 제목 영역 */}
      <div className="rider-title">Rider (기사 관리)</div>

      {/* 2. 헤더 영역 */}
      <div className="rider-main-head">
        
        {/* 좌측: 보기 방식 토글 (전체 vs 대기) */}
        <div className="rider-toggle-container">
          <button 
            className={`rider-toggle-btn ${viewType === 'all' ? 'active' : ''}`} 
            onClick={() => setViewType('all')}
          >
            전체 기사
          </button>
          <button 
            className={`rider-toggle-btn ${viewType === 'pending' ? 'active' : ''}`} 
            onClick={() => setViewType('pending')}
          >
            승인 대기
          </button>
        </div>

        {/* 우측: 검색 및 액션 */}
        <div className="rider-action-group">
          <div className="rider-search-box">
            <span className="rider-search-icon">🔍</span>
            <input type="text" placeholder="이름, 전화번호 검색" className="rider-search-input" />
          </div>
          <button className="rider-btn-outline">엑셀 다운로드</button>
          <button className="rider-btn-black">+ 기사 등록</button>
        </div>
      </div>

      {/* 3. 본문 영역 (테이블) */}
      <div className="rider-main-content">
        <table className="rider-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>출근상태</th>
              <th>Status</th>
              <th>가입날짜</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockRiders.map((rider) => (
              <tr key={rider.id}>
                <td className="fw-bold">{rider.id}</td>
                <td>{rider.name}</td>
                <td>{rider.phone}</td>
                <td><span className={`rider-work-tag ${rider.work ? 'rider-work' : ''}`}>{rider.work ? '출근' : '퇴근'}</span></td>
                <td>
                  {/* 상태에 따른 점(Dot) + 텍스트 표시 */}
                  <div className="rider-status-cell">
                    <span className={`status-dot ${rider.status}`}></span>
                    {rider.status}
                  </div>
                </td>
                <td>{rider.create.toLocaleString()}</td>
                <td>
                  {rider.status === 'PENDING' ? (
                    <button className="rider-btn-small blue">승인</button>
                  ) : (
                    <button className="rider-btn-small gray">관리</button>
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

export default Riders;