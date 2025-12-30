import React, { useState, useEffect } from 'react';
import './User.css'; 
import { useDispatch } from 'react-redux';
import { userCreateThunk } from '../../store/thunks/userThunk.js';

function UserCreate({ isOpen, onClose, onRefresh }) {
  const dispatch = useDispatch();
  
  const initialForm = {
    name: '',
    email: '',
  };

  const [formData, setFormData] = useState(initialForm);

  // 모달 열릴 때 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ★ 수정된 제출 핸들러 (Async/Await 적용)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("이름과 이메일을 입력해주세요.");
      return;
    }

    if (!window.confirm("회원을 등록하시겠습니까?")) return;

    try {
      // 1. DB API 요청 (JSON 전송)
      // unwrap()을 사용해야 요청 실패 시 catch 블록으로 넘어갑니다.
      // formData는 이미 자바스크립트 객체이므로 Axios가 자동으로 JSON으로 변환하여 전송합니다.
      await dispatch(userCreateThunk(formData)).unwrap();

      // 2. 성공 시 처리
      alert("성공적으로 등록되었습니다.");
      onRefresh(); // 부모 컴포넌트(User.jsx)의 목록 새로고침
      onClose();   // 모달 닫기

    } catch (error) {
      // 3. 실패 시 처리
      console.error('등록 에러:', error);
      alert("등록 실패: " + (error.message || "알 수 없는 오류가 발생했습니다."));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container scrollable-modal">
        <div className="modal-header">
          <h2>New User Registration</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body modal-body-scroll">
            
            <div className="form-row">
              <div className="form-group full">
                <label>이름 (Name) <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="사용자 이름 입력" 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full">
                <label>이메일 (Email) <span className="required">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="user@example.com" 
                  required 
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-save">회원 등록</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserCreate;