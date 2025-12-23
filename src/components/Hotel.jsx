import { useState } from 'react';
import './Hotel.css';
import { excelDown } from '../api/utils/excelDown.js';
// import { useDispatch } from 'react-redux';
// import { hotelShowThunk } from '../store/thunks/hotelShowThunk.js';

// const dispatch = useDispatch();
// 더미 데이터 (호텔 목록 - 담당자/전화번호 추가)
const mockHotels = [
  { id: 'H-1001', name: '신라호텔', manager: '김철수 지배인', phone: '02-2233-3131', address: '서울 중구 동호로 249', status: true },
  { id: 'H-1002', name: '조선 팰리스', manager: '이영희 매니저', phone: '02-555-1234', address: '서울 강남구 테헤란로 231', status: true },
  { id: 'H-1003', name: '롯데호텔 서울', manager: '박민수 팀장', phone: '02-771-1000', address: '서울 중구 을지로 30', status: false },
  { id: 'H-1004', name: '하얏트 리젠시', manager: '최지훈', phone: '032-745-1234', address: '인천 중구 공항로', status: true },
  { id: 'H-1005', name: '파라다이스 시티', manager: '정수진', phone: '1833-8855', address: '인천 중구 영종해안남로', status: false },
];

// const mockHotels = await dispatch(hotelShowThunk).unwrap();

function Hotels() {
  const [viewType, setViewType] = useState('all'); // all(전체) | active(활동중)
  const [searchHotel, setSearchHotel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 필터링 로직
  // 1. viewType 조건 (토글)과 2. searchHotel 조건 (검색)을 모두 만족(AND)해야 함
  const filteredHotels = mockHotels.filter((hotel) => {
    // 1. 토글 상태 체크 ('active'면 status가 true여야 함, 'all'이면 무조건 통과)
    const isStatusMatched = viewType === 'active' ? hotel.status : true;
    
    // 2. 검색어 체크 (호텔 이름에 검색어가 포함되어 있는지, 대소문자 무시)
    const isSearchMatched = hotel.name.toLowerCase().includes(searchHotel.toLowerCase());

    // 두 조건 모두 참이어야 결과에 포함
    return isStatusMatched && isSearchMatched;
  });

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const currentItems = filteredHotels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ★ 엑셀 다운로드 핸들러
  const handleDownloadExcel = () => {
    // 1. 엑셀에 정의할 컬럼 설정 (width로 너비 조절 가능)
    const columns = [
      { header: 'Hotel ID', key: 'id', width: 15 },
      { header: '고객명', key: 'name', width: 15 },
      { header: '매니저', key: 'manager', width: 15 },
      { header: '전화번호', key: 'phone', width: 20 },
      { header: '주소', key: 'address', width: 20 },
      { header: '주소', key: 'address', width: 20 },
      { header: '주소', key: 'address', width: 20 },
      { header: '주소', key: 'address', width: 20 },
    ];

    // 2. 파일명 생성 (예: Hotels_2025-06-25)
    const today = new Date().toISOString().slice(0, 10);
    
    // 3. 함수 실행 (데이터는 현재 필터링된 데이터를 넣거나 전체 데이터를 넣음)
    excelDown(mockHotels, `Hotels_${today}`, columns);
  };

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
            <input type="text" placeholder="호텔명" className="hotel-search-input" value={searchHotel} onChange={(e) => setSearchHotel(e.target.value)} />
          </div>
          <button className="hotel-btn-outline" onClick={handleDownloadExcel}>엑셀 다운로드</button>
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
            {currentItems.map((hotel) => (
              <tr key={hotel.id}>
                <td className="fw-bold">{hotel.id}</td>
                <td>{hotel.name}</td>
                <td>{hotel.manager}</td>
                <td>{hotel.phone}</td>
                <td>{hotel.address}</td>
                <td>
                  <div className="hotel-status-cell">
                    <span className={`status-dot status-${hotel.status}`}></span>
                    {hotel.status ? '활동 중' : '활동 안함'}
                  </div>
                </td>
                <td>
                   <button className="hotel-btn-small gray">관리</button>
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

export default Hotels;