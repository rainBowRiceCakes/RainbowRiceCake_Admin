import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
}
from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Settlement.css';
import { excelDown } from '../../api/utils/excelDown.js';
import { settlementShowThunk, settlementSumUpThunk } from '../../store/thunks/settlementThunk.js';

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// YYYY-MM 형식의 현재 월 문자열을 생성하는 함수
const getCurrentYearMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

// 숫자 포맷팅 함수
const formatNumber = (num) => (num || 0).toLocaleString();

// 정산 상태(status) 텍스트와 스타일을 매핑하는 객체
const STATUS_MAP = {
  REQ: { text: '정산 대기', className: 'status-req' },
  COM: { text: '정산 완료', className: 'status-com' },
  REJ: { text: '정산 거부', className: 'status-rej' },
};

/**
 * 정산 관리 대시보드 컴포넌트
 */
function Settlement() {
  const dispatch = useDispatch();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const itemsPerPage = 5;

  // Redux store에서 데이터 가져오기
  const { 
    settlements: settlementList, 
    summary,
    loading, 
    error 
  } = useSelector((state) => state.settlement);
  
  // --- MOCK DATA (차트용) ---
  const MOCK_CHART = {
    labels: ['2025-11', '2025-12', '2026-01'],
    data: [16500000, 17585550, 18500000],
  };
  const backendChartData = MOCK_CHART;
  // --- END MOCK DATA ---
  
  // 검색어 디바운싱 처리
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // 검색어 변경 시 1페이지로 리셋
    }, 300); // 300ms 딜레이

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // 데이터 요청 Effect (월 변경 시)
  useEffect(() => {
    const [year, month] = selectedMonth.split('-');
    // Thunk 호출 시 page, limit 파라미터를 제거하여 전체 데이터를 가져옴
    dispatch(settlementShowThunk({ year, month }));
    dispatch(settlementSumUpThunk({ year, month }));
    setCurrentPage(1); // 월 변경 시 1페이지로 리셋
  }, [selectedMonth, dispatch]);

  // 프론트엔드 필터링 및 페이지네이션
  const { paginatedData, totalPages } = useMemo(() => {
    const filteredList = settlementList.filter(item => 
      item.settlement_rider?.rider_user?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    const total = Math.ceil(filteredList.length / itemsPerPage);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredList.slice(startIndex, endIndex);

    return { paginatedData: paginated, totalPages: total };
  }, [settlementList, currentPage, debouncedSearchTerm, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // MoM 렌더링 함수 (현재는 비활성화, 추후 구현)
  const renderMomChange = (mom) => {
    if (mom === undefined) return <span className="mom-neutral">- vs Last Month</span>;
    const isPositive = mom > 0;
    return (
      <span className={isPositive ? 'mom-positive' : 'mom-negative'}>
        {isPositive ? '▲' : '▼'} {Math.abs(mom)}% vs Last Month
      </span>
    );
  };
  
  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
    // 엑셀 다운로드는 필터링된 전체 데이터를 대상으로 함
    const filteredForExcel = settlementList.filter(item => 
      item.settlement_rider?.rider_user?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    if (!filteredForExcel || filteredForExcel.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }
    const columns = [
      { header: '기사명', key: 'riderName', width: 15 },
      { header: '총 정산금', key: 'totalAmount', width: 20 },
      { header: '정산월', key: 'period', width: 20 },
      { header: '상태', key: 'statusText', width: 15 },
    ];
    const excelData = filteredForExcel.map(item => ({
      riderName: item.settlement_rider?.rider_user?.name || '알 수 없음',
      totalAmount: item.totalAmount,
      period: `${item.year}-${String(item.month).padStart(2, '0')}`,
      statusText: STATUS_MAP[item.status]?.text || item.status,
    }));
    excelDown(excelData, `Settlement_${selectedMonth}`, columns);
  };

  // --- Chart.js 데이터 및 옵션 ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { callback: (value) => `${(value / 10000).toLocaleString()}만` } } },
  };

  const chartDisplayData = {
    labels: backendChartData.labels,
    datasets: [{
      label: '월별 매출액',
      data: backendChartData.data,
      backgroundColor: '#007bff',
      borderRadius: 4,
    }],
  };
  
  return (
    <div className="settlement-dashboard">
      {/* --- 1. 상단 헤더 --- */}
      <div className="dashboard-header">
        <h1>정산 현황 대시보드</h1>
        <div className="date-filter">
          <label htmlFor="month-picker">조회 월</label>
          <input type="month" id="month-picker" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="month-picker-input" />
        </div>
      </div>

      {/* --- 메인 콘텐츠 레이아웃 (카드 + 테이블/차트) --- */}
      <div className="settlement-main-layout">
        {/* --- 2. 요약 카드 --- */}
        <div className="summary-cards-grid">
        <div className="summary-card">
          <div className="card-title">총 매출액 (Total Revenue)</div>
          <div className="card-main-value">₩ {formatNumber(summary.totalRevenue)}</div>
          <div className="card-sub-text">{renderMomChange(undefined)}</div>
        </div>
        <div className="summary-card">
          <div className="card-title">총 주문 건수 (Total Orders)</div>
          <div className="card-main-value">{formatNumber(summary.totalOrderCount)} 건</div>
        </div>
        <div className="summary-card">
          <div className="card-title">활성 기사 수 (Active Riders)</div>
          <div className="card-main-value">{formatNumber(summary.activeRiderCount)} 명</div>
        </div>
        <div className={`summary-card ${summary.paymentErrorCount > 0 ? 'alert' : ''}`}>
          <div className="card-title">지급 실패 건수 (Payment Error)</div>
          <div className="card-main-value">{formatNumber(summary.paymentErrorCount)} 건</div>
          {summary.paymentErrorCount > 0 && <div className="card-sub-text">확인이 필요합니다.</div>}
        </div>
      </div>
      
      {/* --- 3. 하단 컨텐츠 (테이블 + 차트) --- */}
      <div className="settlement-content-grid">
        {/* 3-1. 왼쪽: 정산 목록 테이블 */}
        <div className="table-container">
          <div className="table-header">
            <h3 className="container-title">월별 정산 내역</h3>
            <div className='table-header-actions'>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text"
                  placeholder="기사명"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-excel" onClick={handleExcelDownload}>엑셀 다운로드</button>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="settlement-table">
              <thead>
                <tr>
                  <th>기사명</th>
                  <th>총 정산금</th>
                  <th>정산월</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4">목록 로딩 중...</td></tr>
                ) : error ? (
                  <tr><td colSpan="4">오류가 발생했습니다.</td></tr>
                ) : paginatedData && paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.settlement_rider?.rider_user?.name || '알 수 없음'}</td>
                      <td>₩{formatNumber(item.totalAmount)}</td>
                      <td>{item.year}-{String(item.month).padStart(2, '0')}</td>
                      <td>
                        <span className={`status-badge ${STATUS_MAP[item.status]?.className || ''}`}>
                          {STATUS_MAP[item.status]?.text || item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4">해당 월의 정산 내역이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (() => {
            const PAGE_GROUP_SIZE = 5; // 페이지 그룹 사이즈 5로 변경
            
            const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
            const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
            const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

            const pageNumbers = [];
            for (let i = startPage; i <= endPage; i++) {
              pageNumbers.push(i);
            }

            const handlePrevGroup = () => handlePageChange(startPage - 1);
            const handleNextGroup = () => handlePageChange(endPage + 1);

            return (
              <div className="pagination">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&lt;&lt;</button>
                <button onClick={handlePrevGroup} disabled={startPage === 1}>&lt;</button>
                {pageNumbers.map(num => (
                  <button 
                    key={num} 
                    className={currentPage === num ? 'active' : ''}
                    onClick={() => handlePageChange(num)}
                  >
                    {num}
                  </button>
                ))}
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>&gt;&gt;</button>
                <button onClick={handleNextGroup} disabled={endPage === totalPages}>&gt;</button>
              </div>
            );
          })()}
        </div>

        {/* 3-2. 오른쪽: 차트 */}
        <div className="chart-container">
          <h3 className="container-title">최근 3개월 매출 추이</h3>
          <div className="chart-wrapper">
            {loading ? <p>차트 로딩 중...</p> : <Bar options={chartOptions} data={chartDisplayData} />}
          </div>
        </div>
      </div>
      {/* --- 메인 콘텐츠 레이아웃 닫기 --- */}
      </div>
    </div>
  );
}

export default Settlement;