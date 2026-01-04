import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useKakaoLoader } from 'react-kakao-maps-sdk'; // ★ 1. 로더 추가
import './Hotel.css'; 
import { hotelCreateThunk } from '../../store/thunks/hotelThunk.js';
// ★ 2. 주소 변환 유틸 import (경로가 맞는지 확인해주세요)
import { searchAddressToCoords } from '../../api/utils/kakaoAddress.js';

function HotelCreate({ isOpen, onClose, onRefresh }) {
  const dispatch = useDispatch();

  // ★ 3. 카카오 맵 로드 (모달에서도 주소 변환을 위해 필요)
  useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY, 
    libraries: ["services"],
  });

  // 폼 초기값
  const initialFormState = {
    krName: '',
    enName: '',
    manager: '',
    phone: '',
    address: '',
    status: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value === 'true',
    }));
  };

  // ★ 4. 등록 제출 핸들러 수정
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.krName || !formData.address) {
      alert('호텔명(한글)과 주소는 필수 입력 사항입니다.');
      return;
    }

    if (!window.confirm('새로운 호텔을 등록하시겠습니까?')) return;

    try {
      // 4-1. 주소를 좌표로 변환
      // (searchAddressToCoords 함수가 {lat, lng} 객체를 반환한다고 가정)
      const coords = await searchAddressToCoords(formData.address);
      
      if (!coords) {
        alert("주소를 찾을 수 없습니다. 올바른 주소인지 확인해주세요.");
        return;
      }

      // 4-2. 전송할 데이터 객체 생성 (기존 formData + 좌표)
      // 파일 업로드가 없으므로 JSON 객체 그대로 사용하면 됩니다.
      const payload = {
        ...formData,
        lat: coords.lat, // 위도 추가
        lng: coords.lng  // 경도 추가
      };

      console.log("등록 요청 데이터:", payload); // 디버깅용

      // 4-3. 변환된 payload를 thunk로 전송
      await dispatch(hotelCreateThunk(payload)).unwrap();
      
      alert('성공적으로 등록되었습니다.');
      
      onRefresh(); 
      onClose();   

    } catch (error) {
      console.error('등록 실패:', error);
      alert('호텔 등록에 실패했습니다. (주소 변환 실패 또는 서버 오류)');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container scrollable-modal">
        <div className="modal-header">
          <h2>New Hotel Registration</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body modal-body-scroll">
            
            {/* ... 기존 입력 필드들 (변경 없음) ... */}
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
                <label>호텔명 (영문) <span className="required">*</span></label>
                <input 
                  type="text" name="enName" 
                  value={formData.enName} onChange={handleChange} 
                  placeholder="Ex: The Shilla" 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>담당자 <span className="required">*</span></label>
                <input 
                  type="text" name="manager" 
                  value={formData.manager} onChange={handleChange} 
                  placeholder="이름" 
                />
              </div>
              <div className="form-group">
                <label>전화번호 <span className="required">*</span></label>
                <input 
                  type="text" name="phone" 
                  value={formData.phone} onChange={handleChange} 
                  placeholder="02-0000-0000" 
                />
              </div>
            </div>

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