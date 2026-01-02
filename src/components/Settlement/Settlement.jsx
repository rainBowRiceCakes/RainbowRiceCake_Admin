import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Settlement.css';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- 더미 데이터 ---
// 1. 차트 데이터 (월별 순수익 추이 예시)
const chartData = {
  labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
  datasets: [
    {
      label: '월별 순수익 (단위: 만원)',
      data: [35, 42, 55, 48, 60, 75],
      backgroundColor: '#000000', // Uber Black
      borderRadius: 4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: '#F0F0F0' } },
    x: { grid: { display: false } },
  },
};

// 2. 테이블 데이터 (정산 요청 목록)
const mockSettlements = [
  { id: 'SET-5001', rider: '김철수', amount: 150000, bank: '신한은행', account: '110-123-456789', reqDate: '2025-06-20', status: 'REQUESTED' },
  { id: 'SET-5002', rider: '이영희', amount: 320000, bank: '카카오뱅크', account: '3333-01-234567', reqDate: '2025-06-19', status: 'COMPLETED' },
  { id: 'SET-5003', rider: '박민수', amount: 85000, bank: '국민은행', account: '001-24-000999', reqDate: '2025-06-21', status: 'REQUESTED' },
  { id: 'SET-5004', rider: '최지훈', amount: 540000, bank: '우리은행', account: '1002-888-777777', reqDate: '2025-06-18', status: 'COMPLETED' },
  { id: 'SET-5005', rider: '정수진', amount: 210000, bank: '농협', account: '302-0000-1111-11', reqDate: '2025-06-21', status: 'REQUESTED' },
  { id: 'SET-5006', rider: '홍길동', amount: 90000, bank: '하나은행', account: '620-111111-222', reqDate: '2025-06-15', status: 'COMPLETED' },
];

function Settlement() {
  const [viewType, setViewType] = useState('all'); // all | requested
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // 필터링 로직
  const filteredData = mockSettlements.filter((item) => {
    const statusMatch = viewType === 'all' ? true : item.status === 'REQUESTED';
    const nameMatch = item.rider.includes(searchTerm);
    return statusMatch && nameMatch;
  });

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="settlement-container">
      
      {/* 1. 페이지 타이틀 */}
      <div className="settlement-title">Settlement (정산 관리)</div>

      {/* 2. 상단 카드 영역 (수정됨) */}
      <div className="settlement-cards">
        <div className="settlement-card">
          <div className="card-label">이번 달 총 거래액</div>
          <div className="card-value">₩ 15,400,000</div>
        </div>
        <div className="settlement-card">
          <div className="card-label">기사 지급 예정액</div>
          <div className="card-value red">₩ 445,000</div>
        </div>
        <div className="settlement-card">
          <div className="card-label">매상 순수익 (Net Profit)</div>
          <div className="card-value blue">₩ 2,150,000</div>
        </div>
        <div className="settlement-card">
          <div className="card-label">미정산 건수</div>
          <div className="card-value">3 건</div>
        </div>
      </div>

      {/* 3. 중단 차트 영역 */}
      <div className="settlement-chart-section">
        <h3 className="chart-header">Monthly Net Profit Trend</h3>
        <div className="chart-wrapper">
          <Bar options={chartOptions} data={chartData} />
        </div>
      </div>

      {/* 4. 하단 테이블 헤더 */}
      <div className="settlement-main-head">
        <div className="settlement-toggle-container">
          <button 
            className={`settlement-toggle-btn ${viewType === 'all' ? 'active' : ''}`} 
            onClick={() => { setViewType('all'); setCurrentPage(1); }}
          >
            전체 내역
          </button>
          <button 
            className={`settlement-toggle-btn ${viewType === 'requested' ? 'active' : ''}`} 
            onClick={() => { setViewType('requested'); setCurrentPage(1); }}
          >
            지급 요청 (Pending)
          </button>
        </div>

        <div className="settlement-action-group">
          <div className="settlement-search-box">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="기사명 검색" 
              className="settlement-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="settlement-btn-outline">엑셀 다운로드</button>
          <button className="settlement-btn-black">일괄 지급 승인</button>
        </div>
      </div>

      {/* 5. 테이블 영역 */}
      <div className="settlement-main-content">
        <table className="settlement-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Rider Name</th>
              <th>Amount</th>
              <th>Bank / Account</th>
              <th>Req Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id}>
                <td className="fw-bold">{item.id}</td>
                <td>{item.rider}</td>
                <td>₩{item.amount.toLocaleString()}</td>
                <td>
                  <div className="bank-info">
                    <span className="bank-name">{item.bank}</span>
                    <span className="account-num">{item.account}</span>
                  </div>
                </td>
                <td>{item.reqDate}</td>
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {item.status === 'REQUESTED' ? '지급 요청' : '지급 완료'}
                  </span>
                </td>
                <td>
                  {item.status === 'REQUESTED' ? (
                    <button className="settlement-btn-small blue">승인</button>
                  ) : (
                    <span className="text-gray">-</span>
                  )}
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

export default Settlement;