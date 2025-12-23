import { useEffect, useState } from 'react';
import './Sidebar.css'; // 위에서 만든 CSS 파일 import
import { useLocation, useNavigate } from 'react-router-dom';

// 메뉴 설정
const MENU_ITEMS = [
  { id: 'dashboard', name: 'Dashboard(대시보드)', path: '/admin/dashboard' },
  { id: 'order', name: 'Orders(예약)', path: '/admin/order' },
  { id: 'rider', name: 'Riders(기사)', path: '/admin/rider' },
  { id: 'partner', name: 'Partners(제휴매장)', path: '/admin/partner' },
  { id: 'hotel', name: 'Hotels(제휴호텔)', path: '/admin/hotel' },
  { id: 'settlement', name: 'Settlements(정산)', path: '/admin/settlement' },
  { id: 'notice', name: 'Notices(공지발송)', path: '/admin/notice' },
  { id: 'qna', name: 'QnA(질문목록)', path: '/admin/qna' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 URL 확인 훅
  
  // 현재 선택된 메뉴를 저장하는 상태 (기본값: Dashboard)
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // 새로고침 해도 현재 URL에 맞춰서 메뉴 하이라이트 유지하기
  useEffect(() => {
    // 현재 URL(location.pathname)과 일치하는 메뉴 찾기
    const currentMenu = MENU_ITEMS.find(menu => location.pathname.startsWith(menu.path));
    if (currentMenu) {
      setActiveMenu(currentMenu.id);
    } else setActiveMenu("Dashboard");
    
  }, [location.pathname]);

  // 로고 클릭 핸들러
  const handleLogoClick = () => {
    navigate('/admin/dashboard')
    setActiveMenu('dashboard')
  }
  // 메뉴 클릭 핸들러
  const handleMenuClick = (menu) => {
    navigate(menu.path)
    setActiveMenu(menu.id);
    // 추후 여기에 페이지 이동 로직(navigate) 추가
  };

  return (
    <div className="sidebar-container">
      <div className="side-flexbox">
        {/* 로고 영역 */}
        <div className="side-title" onClick={() => handleLogoClick()}>RainBowRiceCake</div>
        
        {/* 5. 배열을 map으로 반복 렌더링 (코드가 확 줄어듭니다) */}
        {MENU_ITEMS.map((menu) => (
          <div 
            key={menu.id}
            className={`side-menu ${activeMenu === menu.id ? "active" : ""}`} 
            onClick={() => handleMenuClick(menu)}
          >
            {menu.name}
          </div>
        ))}
      </div>

      <div className="side-info">
        <div className="side-admin">반갑습니다 OO관리자님</div>
        <div className="side-logout" onClick={() => navigate('/')}>로그아웃</div>
      </div>
    </div>
  );
};

export default Sidebar;