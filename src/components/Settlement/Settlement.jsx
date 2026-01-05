import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Settlement.css';
import { excelDown } from '../../api/utils/excelDown.js';
import { settlementShowThunk } from '../../store/thunks/settlementThunk.js';

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
  const itemsPerPage = 5; // 페이지 당 5개로 변경

  // Redux store에서 데이터 가져오기
  const { settlements: settlementList, pagination, loading, error } = useSelector((state) => state.settlementShow);
  
  // --- MOCK DATA (차트/요약용) ---
  const MOCK_STATS = { totalRevenue: { amount: 18500000, mom: 5.2 }, totalOrders: 182, activeRiders: 25, paymentErrors: 0 };
  // 3개월 데이터로 수정
  const MOCK_CHART = {
    labels: ['2025-11', '2025-12', '2026-01'],
    data: [16500000, 17585550, 18500000],
  };
  const stats = MOCK_STATS;
  const backendChartData = MOCK_CHART;
  // --- END MOCK DATA ---

  // 월 변경 시 1페이지로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth]);

  // 데이터 요청 함수
  const fetchSettlementData = useCallback(() => {
    const [year, month] = selectedMonth.split('-');
    dispatch(settlementShowThunk({ page: currentPage, limit: itemsPerPage, year, month }));
  }, [selectedMonth, currentPage, itemsPerPage, dispatch]);

  useEffect(() => {
    fetchSettlementData();
  }, [fetchSettlementData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  // MoM 렌더링 함수
  const renderMomChange = (mom) => {
    if (!mom) return <span className="mom-neutral">- vs Last Month</span>;
    const isPositive = mom > 0;
    return (
      <span className={isPositive ? 'mom-positive' : 'mom-negative'}>
        {isPositive ? '▲' : '▼'} {Math.abs(mom)}% vs Last Month
      </span>
    );
  };
  
  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
    if (!settlementList || settlementList.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }
    const columns = [
      { header: '기사명', key: 'riderName', width: 15 },
      { header: '총 정산금', key: 'totalAmount', width: 20 },
      { header: '정산월', key: 'period', width: 20 },
      { header: '상태', key: 'statusText', width: 15 },
    ];
    const excelData = settlementList.map(item => ({
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

      {/* --- 2. 요약 카드 --- */}
      <div className="summary-cards-grid">
        <div className="summary-card">
          <div className="card-title">총 매출액 (Total Revenue)</div>
          <div className="card-main-value">₩ {formatNumber(stats.totalRevenue.amount)}</div>
          <div className="card-sub-text">{renderMomChange(stats.totalRevenue.mom)}</div>
        </div>
        <div className="summary-card">
          <div className="card-title">총 주문 건수 (Total Orders)</div>
          <div className="card-main-value">{formatNumber(stats.totalOrders)} 건</div>
        </div>
        <div className="summary-card">
          <div className="card-title">활성 기사 수 (Active Riders)</div>
          <div className="card-main-value">{formatNumber(stats.activeRiders)} 명</div>
        </div>
        <div className={`summary-card ${stats.paymentErrors > 0 ? 'alert' : ''}`}>
          <div className="card-title">지급 실패 건수 (Payment Error)</div>
          <div className="card-main-value">{formatNumber(stats.paymentErrors)} 건</div>
          {stats.paymentErrors > 0 && <div className="card-sub-text">확인이 필요합니다.</div>}
        </div>
      </div>
      
      {/* --- 3. 하단 컨텐츠 (테이블 + 차트) --- */}
      <div className="settlement-content-grid">
        {/* 3-1. 왼쪽: 정산 목록 테이블 */}
        <div className="table-container">
          <div className="table-header">
            <h3 className="container-title">월별 정산 내역</h3>
            <button className="btn-excel" onClick={handleExcelDownload}>엑셀 다운로드</button>
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
                  <tr><td colSpan="4">오류가 발생했습니다: {error.message}</td></tr>
                ) : settlementList && settlementList.length > 0 ? (
                  settlementList.map((item) => (
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
          
          {pagination && pagination.totalPages > 1 && (() => {
            const PAGE_GROUP_SIZE = 10;
            const { totalPages } = pagination;
            
            const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
            const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
            const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

            const pageNumbers = [];
            for (let i = startPage; i <= endPage; i++) {
              pageNumbers.push(i);
            }

            const handlePrevGroup = () => handlePageChange(startPage - PAGE_GROUP_SIZE > 0 ? startPage - PAGE_GROUP_SIZE : 1);
            const handleNextGroup = () => handlePageChange(startPage + PAGE_GROUP_SIZE <= totalPages ? startPage + PAGE_GROUP_SIZE : totalPages);

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

        {/* 3-2. 오른쪽: 차트 */}
        <div className="chart-container">
          <h3 className="container-title">최근 3개월 매출 추이</h3>
          <div className="chart-wrapper">
            {loading ? <p>차트 로딩 중...</p> : <Bar options={chartOptions} data={chartDisplayData} />}
          </div>
        </div>
      </div>
    </div>
  );
}


export default Settlement;