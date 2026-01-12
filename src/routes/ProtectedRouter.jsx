import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { isLoggedIn, isCheckingAuth } = useSelector((state) => state.auth);

    // [중요] 아직 서버로부터 로그인 유지 여부(reissue)를 확인 중이라면 아무것도 안 보여줌
    // 만약 이게 없으면 새로고침 할 때마다 순식간에 로그인 페이지로 튕겼다가 다시 돌아올 수 있습니다.
    if (isCheckingAuth) {
        return null; // 혹은 로딩 스피너 컴포넌트
    }

    // 체크가 끝났는데 로그인이 안 되어 있다면 로그인 페이지로 리다이렉트
    if (!isLoggedIn) {
        alert("로그인 후 이용해주세요.");
        return <Navigate to="/" replace />;
    }

    // 로그인 상태라면 어드민 페이지들(Outlet)을 보여줌
    return <Outlet />;
};

export default ProtectedRoute;