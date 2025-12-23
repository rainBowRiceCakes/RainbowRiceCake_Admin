import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App.jsx";
import Order from "../components/Order.jsx";
import DashBoard from "../components/DashBoard.jsx";
import Rider from "../components/Rider.jsx";
import Partner from "../components/Partner.jsx";
import Hotel from "../components/Hotel.jsx";
import Settlement from "../components/Settlement.jsx";
import Notice from "../components/Notice.jsx";
import QnA from "../components/QnA.jsx";

// 사용자 정의 라우트 객체
const router = createBrowserRouter([
  {
    element: <App />, // App.jsx를 최상위 Layout으로 사용 (Header, Footer 포함)
    children: [
      // TODO : 초기화면 로그인화면
      // {
      //   path: '/',
      //   element: <div>로그인화면 예정</div>
      // },
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
        path: '/admin/rider', 
        element: <Rider />
      },
      { 
        path: '/admin/partner', 
        element: <Partner />
      },
      { 
        path: '/admin/hotel', 
        element: <Hotel />
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


