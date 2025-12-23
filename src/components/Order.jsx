import { useState } from 'react';
import './Order.css';
import { excelDown } from '../api/utils/excelDown.js';

// 더미 데이터
const mockOrders = [
  { id: 'ORD-1024', customer: '홍길동', from: '인천공항 T1', to: '신라호텔', status: 'WAITING', time: '14:00', price: 15000 },
  { id: 'ORD-1023', customer: 'Sarah Kim', from: '명동 올리브영', to: '롯데호텔', status: 'MATCHED', time: '15:30', price: 22000 },
  { id: 'ORD-1022', customer: '이영희', from: '하얏트 호텔', to: '서울역', status: 'COMPLETE', time: '12:00', price: 12000 },
  { id: 'ORD-1021', customer: 'Michael', from: '부산역', to: '파라다이스', status: 'CANCEL', time: '-', price: 0 },
  { id: 'ORD-1020', customer: '박철수', from: '강남 다이소', to: '조선 팰리스', status: 'PICKUP', time: '16:20', price: 18000 },
];

function Order() {
  // 정렬 상태 관리 ('latest': 최신순, 'status': 상태별)
  const [sortBy, setSortBy] = useState('latest');

  // 정렬 변경 핸들러
  const handleSortChange = (type) => {
    setSortBy(type);
    
    // TODO: DB에 새로운 정렬 기준으로 데이터를 요청할 곳.
    // 예: fetchOrders({ orderBy: type });
    console.log(`DB 요청: 정렬기준 -> ${type}`); 
  };

  const handleDownloadExcel = () => {
    // 1. 엑셀에 정의할 컬럼 설정 (width로 너비 조절 가능)
    const columns = [
      { header: 'Order ID', key: 'id', width: 15 },
      { header: '고객명', key: 'customer', width: 15 },
      { header: '출발지', key: 'from', width: 20 },
      { header: '도착지', key: 'to', width: 20 },
      { header: '상태', key: 'status', width: 12 },
      { header: '예약 시간', key: 'time', width: 15 },
      { header: '금액', key: 'price', width: 15 },
    ];

    // 2. 파일명 생성 (예: Orders_2025-06-25)
    const today = new Date().toISOString().slice(0, 10);
    
    // 3. 함수 실행 (데이터는 현재 필터링된 데이터를 넣거나 전체 데이터를 넣음)
    excelDown(mockOrders, `Orders_${today}`, columns);
  };

  return (
    <div className="order-container">
      
      {/* 1. 제목 영역 */}
      <div className="order-title">Order (예약 관리)</div>
 
      {/* 2. 헤더 영역 (필터, 검색, 버튼) */}
      <div className="order-main-head">
        
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${sortBy === 'latest' ? 'active' : ''}`} 
            onClick={() => handleSortChange('latest')}
          >
            시간순 (최신)
          </button>
          <button 
            className={`toggle-btn ${sortBy === 'status' ? 'active' : ''}`} 
            onClick={() => handleSortChange('status')}
          >
            상태별 (진행중)
          </button>
        </div>

        {/* 우측: 검색 및 액션 버튼 */}
        <div className="head-action-group">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="ID, 고객명 검색" className="search-input" />
          </div>
          <button className="btn-outline" onClick={handleDownloadExcel}>엑셀 다운로드</button>
          <button className="btn-black">+ 예약 등록</button>
        </div>
      </div>

      {/* 3. 본문 영역 (테이블) */}
      <div className="order-main-content">
        <table className="order-table">
          <thead>
            <tr className='order-table-head'>
              <th>배송번호</th>
              <th>주문고객</th>
              <th>출발지</th>
              <th>도착지</th>
              <th>상태</th>
              <th>주문시간</th>
              <th>가격</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr className='order-table-body' key={order.id}>
                <td className="fw-bold">{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.from}</td>
                <td>{order.to}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.time}</td>
                <td>₩{order.price.toLocaleString()}</td>
                <td><button className='order-detail-btn'>수정</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Order;