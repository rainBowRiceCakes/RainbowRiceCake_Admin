import { Outlet } from 'react-router-dom';
import './App.css';
import SideBar from './components/common/SideBar.jsx';

function App() {
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