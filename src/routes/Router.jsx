import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App.jsx";
import Order from "../components/Order/Order.jsx";
import DashBoard from "../components/DashBoard.jsx";
import Rider from "../components/Rider/Rider.jsx";
import Partner from "../components/Partner/Partner.jsx";
import Hotel from "../components/Hotel/Hotel.jsx";
import Settlement from "../components/Settlement.jsx";
import Notice from "../components/Notice/Notice.jsx";
import QnA from "../components/QnA.jsx";
import HotelDetail from "../components/Hotel/HotelDetail.jsx";
import PartnerDetail from "../components/Partner/PartnerDetail.jsx";
import RiderDetail from "../components/Rider/RiderDetail.jsx";
import Login from "../components/common/Login.jsx";
import OrderDetail from "../components/Order/OrderDetail.jsx";
import User from "../components/User/User.jsx";
import UserDetail from "../components/User/UserDetail.jsx";
import NoticeDetail from "../components/Notice/NoticeDetail.jsx";

// 사용자 정의 라우트 객체
const router = createBrowserRouter([
  {
    element: <App />, // App.jsx를 최상위 Layout으로 사용 (Header, Footer 포함)
    children: [
      {
        path: '/',
        element: <Login />
      },
      {
        path: '/admin/dashboard',
        // path: '/dashboard',
        element: <DashBoard />
      },   
      { 
        path: '/admin/order', 
        element: <Order />
      },
      { 
        path: '/admin/order/:id', 
        element: <OrderDetail />
      },
      { 
        path: '/admin/user', 
        element: <User />
      },
      { 
        path: '/admin/user/:id', 
        element: <UserDetail />
      },
      { 
        path: '/admin/rider', 
        element: <Rider />
      },
      { 
        path: '/admin/rider/:id', 
        element: <RiderDetail />
      },
      { 
        path: '/admin/partner', 
        element: <Partner />
      },
      { 
        path: '/admin/partner/:id', 
        element: <PartnerDetail />
      },
      { 
        path: '/admin/hotel', 
        element: <Hotel />
      },
      { 
        path: '/admin/hotel/:id',
        element: <HotelDetail />
      },
      { 
        path: '/admin/settlement', 
        element: <Settlement />
      },
      { 
        path: '/admin/notice', 
        element: <Notice />
      },
      { 
        path: '/admin/notice/:id', 
        element: <NoticeDetail />
      },
      { 
        path: '/admin/qna', 
        element: <QnA />
      },

      {
        path: '*',
        element: <div>404 Not Found</div>
      },

      ]
    }
]);

function Router() {
  return <RouterProvider router={router} />
}

export default Router;


