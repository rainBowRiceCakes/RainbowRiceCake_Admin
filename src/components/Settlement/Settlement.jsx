import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker'; // DatePicker 컴포넌트 추가
import 'react-datepicker/dist/react-datepicker.css'; // react-datepicker CSS 추가
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
}
from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Settlement.css';
import { excelDown } from '../../api/utils/excelDown.js';
import { 
  settlementShowThunk, 
  settlementSumUpThunk, 
  settlementThreeMonthThunk,
  getSettlementDetailThunk, // 새로 추가
  retrySettlementThunk, // 새로 추가
} from '../../store/thunks/settlementThunk.js';

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
  RES: { text: '정산 완료', className: 'status-res' },
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

  // 재시도 모달 관련 상태
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [selectedSettlementId, setSelectedSettlementId] = useState(null);
  const [bankCodeInput, setBankCodeInput] = useState('');
  const [bankAccountInput, setBankAccountInput] = useState('');
  const [memoInput, setMemoInput] = useState('');


  // Redux store에서 데이터 가져오기
  const { 
    settlements: paginatedData, // 이제 서버가 페이지네이션한 데이터를 직접 사용
    pagination,
    summary,
    chartData,
    loading, 
    error,
    settlementDetail, // 새로 추가
  } = useSelector((state) => state.settlement);

  const totalPages = pagination?.totalPages || 1;
  const backendChartData = chartData || { labels: [], data: [] };

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

  // 데이터 요청 Effect (월, 페이지, 검색어 변경 시)
  useEffect(() => {
    const [year, month] = selectedMonth.split('-');

    // 정산 목록 요청 (서버 사이드 페이지네이션)
    dispatch(settlementShowThunk({ 
      month: selectedMonth, 
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm
    }));
    
    // 월 변경 시에만 요약 및 차트 데이터 갱신
    dispatch(settlementSumUpThunk({ year, month }));
    dispatch(settlementThreeMonthThunk());

  }, [dispatch, selectedMonth, currentPage, debouncedSearchTerm]);


  // settlementDetail이 로드되면 모달 입력 필드 초기화
  useEffect(() => {
    if (settlementDetail && showRetryModal) {
      setBankCodeInput(settlementDetail.settlement_rider?.bank || '');
      setBankAccountInput(settlementDetail.settlement_rider?.bankNum || '');
      setMemoInput(''); // 메모는 항상 초기화
    }
  }, [settlementDetail, showRetryModal]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setCurrentPage(1); // 월 변경 시 1페이지로 리셋
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // MoM 렌더링 함수
  const renderMomChange = (mom) => {
    // API 응답 전이나 데이터가 없을 경우(null)
    if (mom === null || mom === undefined) {
      return <span className="mom-neutral">- vs Last Month</span>;
    }
    
    // 0% 변화는 중립으로 표시
    if (mom === 0) {
      return <span className="mom-neutral">0% vs Last Month</span>;
    }

    const isPositive = mom > 0;
    return (
      <span className={isPositive ? 'mom-positive' : 'mom-negative'}>
        {isPositive ? '▲' : '▼'} {Math.abs(mom)}% vs Last Month
      </span>
    );
  };
  
  // 엑셀 다운로드 핸들러 (현재 페이지 기준)
  const handleExcelDownload = () => {
    // 이제 paginatedData가 현재 페이지의 데이터이므로, 별도 필터링 없이 사용
    if (!paginatedData || paginatedData.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }
    const columns = [
      { header: '기사명', key: 'riderName', width: 15 },
      { header: '총 정산금', key: 'totalAmount', width: 20 },
      { header: '정산월', key: 'period', width: 20 },
      { header: '상태', key: 'statusText', width: 15 },
    ];
    const excelData = paginatedData.map(item => ({
      riderName: item.settlement_rider?.rider_user?.name || '알 수 없음',
      totalAmount: item.totalAmount,
      period: `${item.year}-${String(item.month).padStart(2, '0')}`,
      statusText: STATUS_MAP[item.status]?.text || item.status,
    }));
    excelDown(excelData, `Settlement_${selectedMonth}_page${currentPage}`, columns);
  };

  // 재시도 모달 열기
  const handleOpenRetryModal = (id) => {
    setSelectedSettlementId(id);
    dispatch(getSettlementDetailThunk(id)); // 상세 정보 불러오기
    setShowRetryModal(true);
  };

  // 재시도 모달 닫기
  const handleCloseRetryModal = () => {
    setShowRetryModal(false);
    setSelectedSettlementId(null);
    setBankCodeInput('');
    setBankAccountInput('');
    setMemoInput('');
  };

  // 재시도 제출
  const handleRetrySubmit = async () => {
    if (!selectedSettlementId) return;

    try {
      await dispatch(retrySettlementThunk({ 
        id: selectedSettlementId, 
        bankCode: bankCodeInput, 
        bankAccount: bankAccountInput, 
        memo: memoInput 
      })).unwrap(); // unwrap을 사용하여 Promise를 풀고 성공/실패 처리
      alert('정산 재시도 요청이 성공적으로 처리되었습니다.');
      handleCloseRetryModal();
      // 재시도 성공 후 목록 새로고침
      dispatch(settlementShowThunk({ 
        month: selectedMonth, 
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm
      }));
    } catch (err) {
      alert(`정산 재시도 실패: ${err}`);
      console.error('Retry settlement failed:', err);
    }
  };


  // --- Chart.js 데이터 및 옵션 ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: {beginAtZero: true, ticks: { callback: (value) => value >= 10000 ? `${(value / 10000).toLocaleString()}만` : value.toLocaleString() } } },
  };

  const chartDisplayData = {
    labels: backendChartData.labels && backendChartData.labels.length > 0 
      ? backendChartData.labels 
      : ['데이터 없음'],
    datasets: [{
      label: '월별 매출액',
      data: backendChartData.data && backendChartData.data.length > 0 
        ? backendChartData.data 
        : [0],
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
          <DatePicker
            selected={new Date(selectedMonth)}
            onChange={(date) => {
              // Date 객체를 'YYYY-MM' 형식의 문자열로 변환
              const year = date.getFullYear();
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              handleMonthChange({ target: { value: `${year}-${month}` } });
            }}
            dateFormat="yyyy-MM"
            showMonthYearPicker
            className="month-picker-input" // 기존 클래스명을 그대로 적용
            id="month-picker" // ID 추가
          />
        </div>
      </div>

      {/* --- 메인 콘텐츠 레이아웃 (카드 + 테이블/차트) --- */}
      <div className="settlement-main-layout">
        {/* --- 2. 요약 카드 --- */}
        <div className="summary-cards-grid">
        <div className="summary-card">
          <div className="card-title">총 매출액 (Total Revenue)</div>
          <div className="card-main-value">₩ {formatNumber(summary.totalRevenue)}</div>
          <div className="card-sub-text">{renderMomChange(summary.totalRevenueMoM)}</div>
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
                  <th>재정산</th>{/* 새로운 액션 컬럼 */}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5">목록 로딩 중...</td></tr>
                ) : error ? (
                  <tr><td colSpan="5">오류가 발생했습니다.</td></tr>
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
                      <td>
                        {item.status === 'REJ' && (
                          <button 
                            className="btn-action btn-retry" 
                            onClick={() => handleOpenRetryModal(item.id)}
                          >
                            재정산 요청
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5">해당 월의 정산 내역이 없습니다.</td></tr>
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

      {/* 재정산 요청 모달 */}
      {showRetryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>정산 재시도 요청</h2>
            {loading ? (
              <p>상세 정보 로딩 중...</p>
            ) : error ? (
              <p className="error-message">오류: {error}</p>
            ) : settlementDetail ? (
              <form onSubmit={(e) => { e.preventDefault(); handleRetrySubmit(); }}>
                <p><strong>정산 ID:</strong> {settlementDetail.id}</p>
                <p><strong>기사명:</strong> {settlementDetail.settlement_rider?.rider_user?.name}</p>
                <p><strong>총 정산금:</strong> ₩{formatNumber(settlementDetail.totalAmount)}</p>
                
                <div className="form-group">
                  <label htmlFor="bankCode">은행 코드:</label>
                  <input
                    type="text"
                    id="bankCode"
                    value={bankCodeInput}
                    onChange={(e) => setBankCodeInput(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bankAccount">계좌번호:</label>
                  <input
                    type="text"
                    id="bankAccount"
                    value={bankAccountInput}
                    onChange={(e) => setBankAccountInput(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="memo">메모 (선택 사항):</label>
                  <textarea
                    id="memo"
                    value={memoInput}
                    onChange={(e) => setMemoInput(e.target.value)}
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseRetryModal}>취소</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>재시도</button>
                </div>
              </form>
            ) : (
              <p>정산 상세 정보를 불러올 수 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Settlement;