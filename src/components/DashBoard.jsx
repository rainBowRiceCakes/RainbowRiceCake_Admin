import './DashBoard.css'

function DashBoard() {
  return (
    <>
      <div className="dash-container">
        <div className="dash-title">Dashboard(대시보드)</div>
        <div className="dash-sum-container">
          <div className="dash-sum">
            <div className="dash-sum-title">오늘의 주문 수</div>
            <div className="dash-sum-value">nn건</div>
          </div>
          <div className="dash-sum">
            <div className="dash-sum-title">활동 중 기사님</div>
            <div className="dash-sum-value">nn명</div>
          </div>
          <div className="dash-sum">
            <div className="dash-sum-title">Pending</div>
            <div className="dash-sum-value">n건</div>
          </div>
        </div>
        <div className="dash-map-container">지도예정 영역</div>
      </div>
    </>
  );
};

export default DashBoard;