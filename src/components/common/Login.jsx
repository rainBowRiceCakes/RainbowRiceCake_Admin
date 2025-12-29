import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // ★ 추가
import './Login.css';

// ★ 경로가 맞는지 확인해주세요 (store/thunks/authThunk.js)
import { loginThunk } from '../../store/thunks/authThunk'; 

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ★ 추가

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

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
      // ★ Redux Thunk 호출
      // unwrap()을 사용하면 Promise가 resolve된 값(payload)을 바로 받거나, 
      // reject된 경우 catch 블록으로 에러를 던집니다.
      await dispatch(loginThunk(formData)).unwrap();
      
      // authSlice의 extraReducers에 의해 이미:
      // state.isLoggedIn = true;
      // state.accessToken = ...; 
      // 상태가 업데이트 되었습니다.

      // 이제 메인 페이지로 이동
      navigate('/admin/dashboard'); 
      
    } catch (error) {
      console.error('로그인 실패:', error);
      // 에러 메시지가 객체인 경우와 문자열인 경우 대응
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