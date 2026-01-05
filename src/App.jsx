import { Outlet } from 'react-router-dom';
import './App.css';
import SideBar from './components/common/SideBar.jsx';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { reissueThunk } from './store/thunks/authThunk.js';
import { useSelector } from 'react-redux';

function App() {
  const dispatch = useDispatch();
  // 리덕스에서 로그인 여부 가져오기
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(reissueThunk());
  }, [dispatch]);

  return (
    <div className='app_container'>
      {/* 로그인 된 경우에만 사이드바를 보여줌 */}
      {isLoggedIn && <SideBar />}
      <Outlet />
    </div>
  );
}

export default App;