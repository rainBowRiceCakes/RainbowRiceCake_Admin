import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './Hotel.css'; // 스타일은 기존 CSS 공유
// ★ 호텔 생성용 Thunk (실제 파일 경로에 맞게 수정하세요)
import { hotelCreateThunk } from '../../store/thunks/hotelThunk.js';

function HotelCreate({ isOpen, onClose, onRefresh }) {
  const dispatch = useDispatch();

  // 폼 초기값
  const initialFormState = {
    krName: '',
    enName: '',
    manager: '',
    phone: '',
    address: '',
    status: true, // 기본값: 활동 중
  };

  const [formData, setFormData] = useState(initialFormState);

  // 모달이 열릴 때마다 폼 초기화 (선택 사항)
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
    }
  }, [isOpen]);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 상태(Radio) 핸들러
  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value === 'true',
    }));
  };

  // 등록 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.krName || !formData.address) {
      alert('호텔명(한글)과 주소는 필수 입력 사항입니다.');
      return;
    }

    if (!window.confirm('새로운 호텔을 등록하시겠습니까?')) return;

    try {
      // TODO : 이곳에서 도로명주소 -> 위도/경도 추가하는 처리 필요
      // formData.lat = 
      // formData.lng = 
      
      await dispatch(hotelCreateThunk(formData)).unwrap();
      
      alert('성공적으로 등록되었습니다.');
      
      onRefresh(); // 부모 컴포넌트의 리스트 새로고침
      onClose();   // 모달 닫기

    } catch (error) {
      console.error('등록 실패:', error);
      alert('호텔 등록에 실패했습니다.');
    }
  };

  const handleOverlayClick = (e) => {
    // 클릭된 요소(e.target)가 이벤트가 걸린 요소(e.currentTarget, 즉 overlay)와 같을 때만 닫기
    // 이렇게 해야 내부의 흰색 박스를 클릭했을 때는 닫히지 않습니다.
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      {/* ★ [수정됨] 스크롤용 클래스 추가 */}
      <div className="modal-container scrollable-modal">
        <div className="modal-header">
          <h2>New Hotel Registration</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {/* ★ [수정됨] 스크롤용 클래스 추가 */}
          <div className="modal-body modal-body-scroll">
            
            {/* 호텔명 입력 */}
            <div className="form-row">
              <div className="form-group full">
                <label>호텔명 (한글) <span className="required">*</span></label>
                <input 
                  type="text" name="krName" 
                  value={formData.krName} onChange={handleChange} 
                  placeholder="예: 신라호텔" required 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full">
                <label>호텔명 (영문)</label>
                <input 
                  type="text" name="enName" 
                  value={formData.enName} onChange={handleChange} 
                  placeholder="Ex: The Shilla" 
                />
              </div>
            </div>

            {/* 담당자 / 전화번호 */}
            <div className="form-row">
              <div className="form-group">
                <label>담당자</label>
                <input 
                  type="text" name="manager" 
                  value={formData.manager} onChange={handleChange} 
                  placeholder="이름" 
                />
              </div>
              <div className="form-group">
                <label>전화번호</label>
                <input 
                  type="text" name="phone" 
                  value={formData.phone} onChange={handleChange} 
                  placeholder="02-0000-0000" 
                />
              </div>
            </div>

            {/* 주소 */}
            <div className="form-row">
              <div className="form-group full">
                <label>주소 <span className="required">*</span></label>
                <input 
                  type="text" name="address" 
                  value={formData.address} onChange={handleChange} 
                  placeholder="전체 주소 입력" required 
                />
              </div>
            </div>

            {/* 상태 선택 */}
            <div className="form-row">
              <div className="form-group full">
                <label>운영 상태</label>
                <div className="status-selector">
                  <label className={`radio-label ${formData.status ? 'active' : ''}`}>
                    <input 
                      type="radio" name="status" value="true" 
                      checked={formData.status === true} onChange={handleStatusChange} 
                    />
                    활동 중
                  </label>
                  <label className={`radio-label ${!formData.status ? 'inactive' : ''}`}>
                    <input 
                      type="radio" name="status" value="false" 
                      checked={formData.status === false} onChange={handleStatusChange} 
                    />
                    비활동
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-save">등록 하기</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HotelCreate;