import { useCallback, useEffect, useState } from 'react';
import './Hotel.css';
import { excelDown } from '../../api/utils/excelDown.js';
import { useDispatch, useSelector } from 'react-redux';
import { hotelShowThunk } from '../../store/thunks/hotelThunk.js';
import { useNavigate } from 'react-router-dom';
import HotelCreate from './HotelCreate';

function Hotel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { show, loading } = useSelector(state => state.hotelShow);
  
  // 데이터 로딩
const refreshList = useCallback(() => {
    dispatch(hotelShowThunk());
  }, [dispatch]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);
  
  const [viewType, setViewType] = useState('all'); // all(전체) | active(활동중)
  const [searchHotel, setSearchHotel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // --- 모달 Open 상태 관리 ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- 상세 페이지로 이동 ---
  const handleManageClick = (hotel) => {
    // '/admin/hotel/:id' 경로로 이동하며, hotel 데이터를 state로 넘겨줍니다.
    navigate(`/admin/hotel/${hotel.id}`);
  };

  // 필터링 로직
  // 1. viewType 조건 (토글)과 2. searchHotel 조건 (검색)을 모두 만족(AND)해야 함
  const filteredHotels = show.filter((hotel) => {
    // 1. 토글 상태 체크 ('active'면 status가 true여야 함, 'all'이면 무조건 통과)
    const isStatusMatched = viewType === 'active' ? hotel.status : true;
    
    // 2. 검색어 체크 (호텔 이름에 검색어가 포함되어 있는지, 대소문자 무시)
    const isSearchMatched = hotel.krName.toLowerCase().includes(searchHotel.toLowerCase());

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
      { header: 'id', key: 'id', width: 5 },
      { header: '한글이름', key: 'krName', width: 15 },
      { header: '영어이름', key: 'enName', width: 15 },
      { header: '주소', key: 'address', width: 20 },
      { header: '매니저', key: 'manager', width: 15 },
      { header: '전화번호', key: 'phone', width: 20 },
    ];

    // 2. 파일명 생성 (예: Hotels_2025-06-25)
    const today = new Date().toISOString().slice(0, 10);
    
    // 3. 함수 실행 (데이터는 현재 필터링된 데이터를 넣거나 전체 데이터를 넣음)
    excelDown(show, `Hotels_${today}`, columns);
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
          <button className="hotel-btn-black" onClick={() => setIsCreateModalOpen(true)}>+ 호텔 등록</button>
        </div>
      </div>

      {/* 3. 본문 영역 (테이블) */}
      <div className="hotel-main-content">
        <table className="hotel-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>호텔명</th>
              <th>매니저</th>
              <th>전화번호</th>
              <th>주소</th>
              <th>활동상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((hotel) => (
              <tr key={hotel.id}>
                <td className="fw-bold">{hotel.id}</td>
                <td>{hotel.krName}</td>
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
                   <button className="hotel-btn-small gray" onClick={() => handleManageClick(hotel)}>관리</button>
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

      {/* Hotel등록 모달 */}
      <HotelCreate 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onRefresh={refreshList} 
      />

    </div>
  );
}

export default Hotel;