import './DashBoard.css'
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useDispatch, useSelector } from 'react-redux';
import { dashboardStatsThunk } from '../store/thunks/dashboadThunk';
import { useEffect } from 'react';

// 플러그인 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// --- 최근 배송 건수 차트 ---
export const RecentDeliveryChart = ({ dataValues, labels }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 25, left: 0, right: 0, bottom: 0 }
    },
    plugins: {
      legend: { display: false },
      // 요청하신 툴팁 설정 적용
      tooltip: {
        enabled: true, // 툴팁 활성화
        callbacks: {
          label: (context) => `${context.raw}건`,
        },
      },
      // 막대 위 숫자 표시 (기존 디자인 유지)
      datalabels: {
        display: true,
        color: '#000',
        anchor: 'end',
        align: 'end',
        offset: -5,
        font: { weight: 'bold', size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        // 요청하신 폰트 및 컬러 스타일 적용
        ticks: { color: '#555', font: { size: 12, weight: 'bold' } },
        border: { display: false }
      },
      y: {
        grid: { color: '#f0f0f0' },
        // 데이터 최대값이 16이므로 max를 20으로, stepSize를 4로 조정하여 가독성 확보
        ticks: { display: true, stepSize: 4, color: '#888' }, 
        beginAtZero: true,
        max: 20, 
      },
    },
  };

  const data = {
    labels: labels || [],
    datasets: [
      {
        data: dataValues || [],
        backgroundColor: '#9fa8da', // 이미지 속 연한 보라색
        barThickness: 20, // 막대 두께 조절
        borderRadius: 0, // 직각 막대
      },
    ],
  };

  return <Bar options={options} data={data} />;
};


function DashBoard() {
  const dispatch = useDispatch();

  // 상태 구독
  const { chartData, summary, loading, urgentOrders } = useSelector((state) => state.dashboard);

  useEffect(() => {
    // 페이지 진입 시 데이터 요청
    dispatch(dashboardStatsThunk());
  }, [dispatch]);
  
  return (
    <>
      <div className="dash-container">
        {/* 헤더 영역 */}
        <div className="dash-title">Dashboard</div>

        {/* 상단 영역 */}
        <div className="dash-sum-container">
          <div className="dash-sum">
            <div className="dash-sum-title">오늘의 배송 요청</div>
            {/* <div className="dash-sum-value">{summary.todayRequests}</div> */}
            <div className="dash-sum-value">
              {loading ? '...' : `${summary.todayRequests}건`}
            </div>
          </div>
          <div className="dash-sum">
            <div className="dash-sum-title">진행 중 배송</div>
            {/* <div className="dash-sum-value">{summary.inProgress}</div> */}
            <div className="dash-sum-value">
              {loading ? '...' : `${summary.inProgress}건`}
            </div>
          </div>
          <div className="dash-sum">
            <div className="dash-sum-title">오늘의 완료 배송</div>
            {/* <div className="dash-sum-value">{summary.todayCompleted}</div> */}
            <div className="dash-sum-value">
              {loading ? '...' : `${summary.todayCompleted}건`}
            </div>
          </div>
        </div>

        {/* 중단 영역 */}
        <div className="dash-row">
          <div className="dash-box dash-col-wide">
            <div className="dash-box-header">
              <h3 className="dash-section-title">긴급 주문 현황</h3>
            </div>

          <table className="dash-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>출발지</th>
                <th>도착지</th>
                <th>상태</th>
                <th>지연 시간</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="5">로딩 중...</td></tr>
              ) : urgentOrders && urgentOrders.length > 0 ? (
                urgentOrders.map((order) => (
                  <tr key={order.id} className="urgent-row">
                    {/* 주문번호 */}
                    <td>{order.orderCode ? order.orderCode : '-'}</td>
                    
                    {/* 출발지 */}
                    <td>{order.partnerName}</td>

                    {/* 도착지 */}
                    <td>{order.hotelName}</td>
                    
                    {/* 상태 (req) */}
                    <td>{order.status === 'req' ? '대기' : order.status}</td>

                    {/* 지연 시간 (현재시간 - created_at) */}
                    <td className="delay-time-text">{order.delayTime} 지연</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                    현재 긴급한 주문이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        {/* 최근 배송 건수 차트 적용 */}
        <div className="dash-col-narrow">
          <div className="chart-box">
            <h3 className="chart-title">최근 배송 건수</h3>
            <div className="chart-wrapper">
              <RecentDeliveryChart
                labels={chartData?.labels || []}      // chartData가 없으면 빈 배열 전달
                dataValues={chartData?.counts || []}  // chartData가 없으면 빈 배열 전달
              />
            </div>
          </div>
        </div>
        </div>

      </div>
    </>
  );
};

export default DashBoard;