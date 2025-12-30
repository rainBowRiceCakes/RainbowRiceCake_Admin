import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // ★ Redux 훅 추가
import './Sidebar.css'; 

// ★ authSlice에서 만든 초기화 액션 import (경로 확인 필요)
import { clearAuth } from '../../store/slices/authSlice.js';

// 메뉴 설정
const MENU_ITEMS = [
  { id: 'dashboard', name: 'Dashboard(대시보드)', path: '/admin/dashboard' },
  { id: 'order', name: 'Orders(주문)', path: '/admin/order' },
  { id: 'user', name: 'Users(유저)', path: '/admin/user' },
  { id: 'rider', name: 'Riders(기사)', path: '/admin/rider' },
  { id: 'partner', name: 'Partners(제휴매장)', path: '/admin/partner' },
  { id: 'hotel', name: 'Hotels(제휴호텔)', path: '/admin/hotel' },
  { id: 'settlement', name: 'Settlements(정산)', path: '/admin/settlement' },
  { id: 'notice', name: 'Notices(공지발송)', path: '/admin/notice' },
  { id: 'qna', name: 'QnA(질문목록)', path: '/admin/qna' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch(); // ★ Dispatch 생성

  // ★ Redux Store에서 로그인 상태와 유저 정보 가져오기
  const { isLoggedIn, name } = useSelector((state) => state.auth);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // URL 변경 감지
  useEffect(() => {
    const currentMenu = MENU_ITEMS.find(menu => location.pathname.startsWith(menu.path));
    if (currentMenu) {
      setActiveMenu(currentMenu.id);
    } else {
      // admin 경로가 아니면 대시보드 기본값 혹은 비활성 처리
      setActiveMenu("dashboard"); 
    }
  }, [location.pathname]);

  // 로고 클릭
  const handleLogoClick = () => {
    navigate('/admin/dashboard');
    setActiveMenu('dashboard');
  };

  // 메뉴 클릭
  const handleMenuClick = (menu) => {
    navigate(menu.path);
    setActiveMenu(menu.id);
  };

  // ★ 로그아웃 핸들러
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      dispatch(clearAuth()); // 1. Redux 상태 초기화
      navigate('/');         // 2. 로그인 화면으로 이동
    }
  };

  // ★ 로그인 버튼 핸들러 (비로그인 상태일 때)
  const handleLoginRedirect = () => {
    navigate('/');
  };

  return (
    <div className="sidebar-container">
      <div className="side-flexbox">
        {/* 로고 영역 */}
        <div className="side-title" onClick={handleLogoClick}>RainBowRiceCake</div>
        
        {/* 메뉴 목록 */}
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

      {/* ★ 하단 정보 영역 (조건부 렌더링) */}
      <div className="side-info">
        {isLoggedIn ? (
          // 로그인 상태일 때
          <>
            <div className="side-admin">
              반갑습니다 <strong>{name || '관리자'}</strong>님
            </div>
            <div className="side-logout" onClick={handleLogout}>
              로그아웃
            </div>
          </>
        ) : (
          // 비로그인 상태일 때 (혹은 토큰 만료)
          <>
            <div className="side-admin">로그인이 필요합니다</div>
            <div className="side-logout" onClick={handleLoginRedirect}>
              로그인
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;