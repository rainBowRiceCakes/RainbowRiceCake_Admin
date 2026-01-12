import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Order.css';
import { excelDown } from '../../api/utils/excelDown.js';
import { orderIndexThunk } from '../../store/thunks/orderThunk.js';
import { useNavigate } from 'react-router-dom';
import OrderCreate from './OrderCreate.jsx';

function Order() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ★ 1. Redux Store 구독
  // 백엔드 응답: { orders: [], pagination: { page, total, totalPages ... } }
  const { orders, pagination, loading } = useSelector((state) => state.orderShow);
  // --- Local States ---
  const [viewType, setViewType] = useState('all'); // 'all' | 'in_progress'
  const [searchOrderCode, setSearchOrderCode] = useState('');
  const [debouncedSearchOrderCode, setDebouncedSearchOrderCode] = useState(''); // 디바운싱된 검색어 (API 요청용)
  const [currentPage, setCurrentPage] = useState(1);
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 백엔드 기본 설정이 limit 9이므로 맞춤 (변경 가능)
  const limit = 9;

  // --- 디바운싱 Effect (주문번호) ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchOrderCode(searchOrderCode);
      setCurrentPage(1); // 검색어 변경 시 1페이지로 초기화
    }, 500); // 500ms 지연

    return () => {
      clearTimeout(handler);
    };
  }, [searchOrderCode]); 

  // ★ 2. 데이터 요청 함수 (페이지 변경 시 호출)
  const fetchOrders = useCallback(() => {
    // 쿼리 파라미터로 page, limit 전송
    const params = {
      page: currentPage,
      limit: limit,
      deliveryStatus: deliveryStatusFilter,
      paymentStatus: paymentStatusFilter,
      startDate: startDate,
      endDate: endDate,
      orderCode: debouncedSearchOrderCode, // 디바운싱된 주문번호를 파라미터로 추가
    };
    
    // '진행중' 필터일 경우, 'com' 상태 제외 파라미터 추가
    if (viewType === 'in_progress') {
      params.statusExclude = 'com'; 
    }

    dispatch(orderIndexThunk(params));
  }, [dispatch, currentPage, limit, viewType, deliveryStatusFilter, paymentStatusFilter, startDate, endDate, debouncedSearchOrderCode]);

  // 페이지 로드 및 currentPage, viewType 변경 시 실행
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // viewType 변경 시 currentPage 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [viewType]);


  // --- Handlers ---

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  // 엑셀 다운로드
  const handleDownloadExcel = () => {
    const columns = [
      { header: 'Order ID', key: 'orderCode', width: 15 },
      { header: '출발지', key: 'from', width: 20 },
      { header: '도착지', key: 'to', width: 20 },
      { header: '상태', key: 'status', width: 12 },
      { header: '주문 시간', key: 'createdAt', width: 20 },
      { header: '금액', key: 'price', width: 15 },
    ];

    const today = new Date().toISOString().slice(0, 10);
    
    // 백엔드 데이터 구조에 맞춰 엑셀 데이터 매핑
    const excelData = orders.map(order => ({
      orderCode: order.orderCode,
      from: order.order_partner?.krName || 'Unknown',
      to: order.order_hotel?.krName || 'Unknown',
      status: order.status,
      createdAt: order.createdAt,
      price: order.price
    }));

    excelDown(excelData, `Orders_${today}`, columns);
  };

  // --- Rendering Helpers ---
  
  // 상태 뱃지 클래스
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'req': return 'status-badge WAITING'; // CSS 클래스명 매칭 필요
      case 'mat': return 'status-badge MATCHED';
      case 'com': return 'status-badge COMPLETE';
      case 'pick': return 'status-badge PICK';
      default: return 'status-badge';
    }
  };

  const handleManageClick = (order) => {
    console.log(order.orderCode)
    // '/admin/order/:id' 경로로 이동하며, order 데이터를 state로 넘겨줍니다.
    navigate(`/admin/order/${order.orderCode}`);
  };

  return (
    <div className="order-container">
      
      {/* 1. 제목 영역 */}
      <div className="order-title">Order (주문 관리)</div>
 
      {/* 2. 헤더 영역 (필터, 검색, 버튼) */}
      <div className="order-main-head">
        
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${viewType === 'all' ? 'active' : ''}`} 
            onClick={() => setViewType('all')}
          >
            모든 주문
          </button>
          <button 
            className={`toggle-btn ${viewType === 'in_progress' ? 'active' : ''}`} 
            onClick={() => setViewType('in_progress')}
          >
            진행중 주문
          </button>
        </div>

        {/* 우측: 검색 및 액션 버튼 */}
        <div className="head-action-group">
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="주문 번호 검색 (자동 검색)"
                        className="search-input"
                        value={searchOrderCode}
                        onChange={(e) => setSearchOrderCode(e.target.value)}
                      />
                    </div>          <button className="btn-outline" onClick={handleDownloadExcel}>엑셀 다운로드</button>
          <button className="btn-black" onClick={() => setIsCreateModalOpen(true)}>+ 주문 등록</button>
        </div>
      </div>

      {/* 3. 본문 영역 (테이블) */}
      <div className="order-main-content">
        <table className="order-table">
          <thead>
            <tr className='order-table-head'>
              <th>배송번호</th>
              {/* 백엔드 레포지토리에 User include가 없어서 일단 제외하거나 Partner로 대체 */}
              <th>출발지</th> 
              <th>도착지</th>
              <th>담당기사</th>
              <th>상태</th>
              <th>주문시간</th>
              <th>가격</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="8" style={{textAlign:'center', padding:'30px'}}>로딩 중...</td></tr>
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr className='order-table-body' key={order.orderCode}>
                  <td className="fw-bold">{order.orderCode}</td>
                  {/* 백엔드 include 구조: order_partner.krName */}
                  <td>{order.order_partner?.krName}</td>
                  
                  {/* 백엔드 include 구조: order_hotel.krName */}
                  <td>{order.order_hotel?.krName}</td>
                  
                  {/* 백엔드 include 구조: order_rider -> rider_user.name */}
                  <td>{order.order_rider?.rider_user?.name || '-'}</td>
                  
                  <td>
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  
                  {/* 날짜 포맷팅 (YYYY-MM-DD HH:mm) */}
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  
                  <td>₩{Number(order.price).toLocaleString()}</td>
                  <td><button className='order-detail-btn' onClick={() => {handleManageClick(order)}}>수정</button></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="8" style={{textAlign:'center', padding:'30px'}}>데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>

        {/* ★ 4. 페이지네이션 (그룹 적용) */}
        {pagination && pagination.totalPages > 1 && (() => {
          const PAGE_GROUP_SIZE = 10; // 페이지 그룹당 10개씩 보여주기
          const totalPages = pagination.totalPages;
          
          // 현재 페이지가 속한 그룹 계산
          const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
          
          // 현재 그룹의 시작/끝 페이지 번호 계산
          let startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
          let endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

          const pageNumbers = [];
          for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
          }

          // 이전/다음 그룹으로 이동하는 핸들러
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
              {/* 이전 그룹으로 */}
              <button onClick={handlePrevGroup} disabled={startPage === 1}>&lt;&lt;</button>
              
              {/* 이전 페이지로 */}
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
              
              {/* 페이지 번호들 */}
              {pageNumbers.map(num => (
                <button 
                  key={num} 
                  className={currentPage === num ? 'active' : ''}
                  onClick={() => handlePageChange(num)}
                >
                  {num}
                </button>
              ))}

              {/* 다음 페이지로 */}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
              
              {/* 다음 그룹으로 */}
              <button onClick={handleNextGroup} disabled={endPage === totalPages}>&gt;&gt;</button>
            </div>
          );
        })()}
      </div>

      <OrderCreate 
      isOpen={isCreateModalOpen} 
      onClose={() => setIsCreateModalOpen(false)}
      onRefresh={fetchOrders} // 등록 성공 시 목록 새로고침
      />
    </div>
  );
}

export default Order;