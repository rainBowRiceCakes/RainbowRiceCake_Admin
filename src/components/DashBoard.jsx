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
import { useNavigate } from 'react-router-dom';
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

// --- 오늘 vs 어제 주문 수 차트 ---
export const OrderComparisonChart = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw}건`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#555', font: { size: 12, weight: 'bold' } },
      },
      y: {
        grid: { color: '#f0f0f0' },
        ticks: { display: true, stepSize: 5, color: '#888' }, // Y축 숫자 표시
        beginAtZero: true,
        max: 15,
      },
    },
  };

  const data = {
    labels: ['오늘', '어제', '증가 주문 수'],
    datasets: [
      {
        label: '주문 수',
        data: [12, 9, 3],
        backgroundColor: [
          '#9fa8da', // 오늘 (연보라)
          '#f4e04d', // 어제 (노랑)
          '#b0b8ef', // 증가분 (회색빛 보라)
        ],
        borderRadius: 4,
        barThickness: 35, // 막대를 좀 더 두껍게
      },
    ],
  };

  return <Bar options={options} data={data} />;
};


function DashBoard() {
  const navigate = useNavigate();
  
  function handleOrderClick() {
    navigate('/admin/order');
  }

  const dispatch = useDispatch();

  // Redux Store에서 데이터와 로딩 상태를 구독
  const { urgentOrders, chartData, loading } = useSelector((state) => state.dashboard);

  console.log('Redux ChartData:', chartData);

  useEffect(() => { 
    // [초기 로딩] 컴포넌트 마운트 시 데이터 요청
    const loadData = async () => {
      // Promise.all을 사용하여 병렬로 요청하면 더 빠릅니다.
      await Promise.all([
        dispatch(dashboardStatsThunk())
      ]);
    };
    loadData();
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
            <div className="dash-sum-value">12건</div>
          </div>
          <div className="dash-sum">
            <div className="dash-sum-title">진행 중 배송</div>
            <div className="dash-sum-value">5건</div>
          </div>
          <div className="dash-sum">
            <div className="dash-sum-title">오늘의 완료 배송</div>
            <div className="dash-sum-value">5건</div>
          </div>
        </div>

        {/* 중단 영역 */}
        <div className="dash-row">
        {/* --- [중단] 테이블 섹션 --- */}
        <div className="dash-box dash-col-wide">
          <div className="dash-box-header">
            <h3 className="dash-section-title">최근 주문 & 배송 현황</h3>
          </div>

          <table className="dash-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>주문번호</th>
                <th style={{ width: '15%' }}>상태</th>
                <th style={{ width: '30%' }}>요청 시간</th>
                <th style={{ width: '25%' }}>수하물 정보</th>
                <th style={{ width: '15%', textAlign: 'center' }}>사진 확인</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. 배송 완료 (일반) */}
              <tr>
                <td className="fw-bold">#58492</td>
                <td><span className="status-badge success">배송 완료</span></td>
                <td className="text-urgent">4/18 12:00-13:30</td> {/* 긴급(빨강) 예시 */}
                <td>백팩 1개</td>
                <td className="text-center"><div className="photo-icon success">✔</div></td>
              </tr>
              
              {/* 2. 배송중 */}
              <tr>
                <td className="fw-bold">#58491</td>
                <td><span className="status-badge warning">배송중</span></td>
                <td>4/19 14:00-15:30</td>
                <td>24인치 1개</td>
                <td className="text-center"><div className="photo-icon warning"></div></td>
              </tr>

              {/* 3. 배송 지연 */}
              <tr>
                <td className="fw-bold">#58490</td>
                <td><span className="status-badge danger">배송 지연</span></td>
                <td>4/19 12:00-12:25</td>
                <td>골프백 1개</td>
                <td className="text-center"><div className="photo-icon danger"></div></td>
              </tr>

              {/* 4. 배송 완료 */}
              <tr>
                <td className="fw-bold">#58489</td>
                <td><span className="status-badge success">배송 완료</span></td>
                <td>4/18 12:00-13:30</td>
                <td>화장품 1개</td>
                <td className="text-center"><div className="photo-icon success">✔</div></td>
              </tr>

              {/* 5. 배송중 */}
              <tr>
                <td className="fw-bold">#58488</td>
                <td><span className="status-badge warning">배송중</span></td>
                <td>4/18 12:00-13:30</td>
                <td>쇼핑백 1개</td>
                <td className="text-center"><div className="photo-icon warning"></div></td>
              </tr>
            </tbody>
          </table>

          {/* 하단 더보기 링크 */}
          <div className="dash-table-footer">
            <div className="view-all-link" onClick={handleOrderClick}>배송 내역 전체 보기 →</div>
          </div>
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

      {/* 하단 영역 */}
      <div className="dash-row">
        {/* 하단 좌측 영역 */}
        <div className="dash-box dash-col-wide">
          <h3 className="dash-section-title">오늘 한 눈에</h3>
          <div className="dash-summary-grid">
            <div className="summary-item">
              <div className="summary-label">오늘 피크 시간</div>
              <div className="summary-value">12:00 ~ 13:30</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">픽업 배송 소요 시간</div>
              <div className="summary-value">32분</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">지연 우려 주문</div>
              <div className="summary-value">1건</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">재요청/이슈 발생</div>
              <div className="summary-value">0건</div>
            </div>
          </div>
        </div>

        {/* 오늘 vs 어제 차트 적용 */}
        <div className="dash-col-narrow">
          <div className="chart-box">
            <h3 className="chart-title">오늘 vs 어제 주문 수</h3>
            <div className="chart-wrapper">
              <OrderComparisonChart />
            </div>
          </div>
        </div>
      </div>

      </div>
    </>
  );
};

export default DashBoard;