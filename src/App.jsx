import { Outlet } from 'react-router-dom';
import './App.css';
import SideBar from './components/common/SideBar.jsx';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { reissueThunk } from './store/thunks/authThunk.js';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(reissueThunk());
  }, [dispatch]);

  return(

    <>
      <div className='app_container'>
        <SideBar />
        <Outlet />
      </div>
    </>
  )
}

export default App;