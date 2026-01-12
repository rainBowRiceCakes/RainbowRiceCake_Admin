import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // ★ useSelector 추가
import './Login.css';

// ★ 경로가 맞는지 확인해주세요 (store/thunks/authThunk.js)
import { loginThunk } from '../../store/thunks/authThunk'; 

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth); // ★ 로그인 상태 가져오기

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // ★ 이미 로그인된 상태라면 대시보드로 리디렉션
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/admin/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      await dispatch(loginThunk(formData)).unwrap();
      navigate('/admin/dashboard'); 
      
    } catch (error) {
      console.error('로그인 실패:', error);
      const msg = error?.msg || error?.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';
      alert(msg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Admin Login</h1>
          <p>관리자 페이지 접속을 위해 로그인해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">ID</label>
            <input 
              type="text" 
              id="email"
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="아이디를 입력하세요" 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="비밀번호를 입력하세요" 
            />
          </div>

          <button type="submit" className="btn-login">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;