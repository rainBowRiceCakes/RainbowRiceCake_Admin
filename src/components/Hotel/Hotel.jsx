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
  
  // --- Redux Store 구독 ---
  const { hotels, pagination, loading } = useSelector(state => state.hotelShow);

  // --- Local States ---
  const [viewType, setViewType] = useState('all'); // all(전체) | active(활동중)
  const [searchHotel, setSearchHotel] = useState(''); // 검색어 (실시간)
  const [debouncedSearch, setDebouncedSearch] = useState(''); // 디바운싱된 검색어 (API 요청용)
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- 디바운싱 Effect ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchHotel);
      setCurrentPage(1); // 검색어 변경 시 1페이지로 초기화
    }, 500); // 500ms 지연

    return () => {
      clearTimeout(handler);
    };
  }, [searchHotel]);
  const itemsPerPage = 9;

  // --- 데이터 요청 ---
  const fetchHotels = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
    };
    // '활동 중' 토글이 활성화된 경우에만 status 파라미터 추가
    if (viewType === 'active') {
      params.status = true;
    }
    dispatch(hotelShowThunk(params));
  }, [dispatch, currentPage, itemsPerPage, viewType, debouncedSearch]);

  // --- 메인 Effect (데이터 로딩 트리거) ---
  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // --- 상세 페이지로 이동 ---
  const handleManageClick = (hotel) => {
    navigate(`/admin/hotel/${hotel.id}`);
  };

  // 보기 방식 변경 시 1페이지로 초기화 및 검색어 초기화
  useEffect(() => {
    setCurrentPage(1);
    setSearchHotel('');
    setDebouncedSearch('');
  }, [viewType]);

  const handleDownloadExcel = () => {
    const columns = [
      { header: 'id', key: 'id', width: 5 },
      { header: '한글이름', key: 'krName', width: 15 },
      { header: '영어이름', key: 'enName', width: 15 },
      { header: '주소', key: 'address', width: 20 },
      { header: '매니저', key: 'manager', width: 15 },
      { header: '전화번호', key: 'phone', width: 20 },
    ];
    const today = new Date().toISOString().slice(0, 10);
    excelDown(hotels, `Hotels_${today}`, columns);
  };

  return (
    <div className="hotel-container">
      
      <div className="hotel-title">Hotel (제휴 호텔)</div>

      <div className="hotel-main-head">
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
        <div className="hotel-action-group">
                    <div className="hotel-search-box">
                      <span className="hotel-search-icon">🔍</span>
                      <input type="text" placeholder="호텔명 (자동 검색)" className="hotel-search-input" value={searchHotel} onChange={(e) => setSearchHotel(e.target.value)} />
                    </div>
          <button className="hotel-btn-outline" onClick={handleDownloadExcel}>엑셀 다운로드</button>
          <button className="hotel-btn-black" onClick={() => setIsCreateModalOpen(true)}>+ 호텔 등록</button>
        </div>
      </div>

      {/* ... 이하 테이블 및 페이지네이션 로직은 동일 ... */}
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
            {loading ? (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>로딩 중...</td></tr>
            ) : hotels && hotels.length > 0 ? (
              hotels.map((hotel) => (
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
              ))
            ) : (
              <tr><td colSpan="7" style={{textAlign:'center', padding:'30px'}}>데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>

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

      <HotelCreate 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onRefresh={fetchHotels} 
      />

    </div>
  );
}

export default Hotel;