import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './Partner.css'; 
import { partnerCreateThunk } from '../../store/thunks/partnerThunk'; // 경로 확인 필요

function PartnerCreate({ isOpen, onClose, onRefresh }) {
  const dispatch = useDispatch();

  // 초기값 설정
  const initialFormState = {
    businessNum: '',
    krName: '',
    enName: '',
    manager: '',
    phone: '',
    address: '',
    status: 'RES', // 기본값: 승인(RES)
    lat: 37.5665,  // 기본 위도 (필요시 주소 API 연동)
    lng: 126.9780, // 기본 경도
    userId: 1      // 임시 관리자 ID (실제론 로그인 유저 ID)
  };

  const [formData, setFormData] = useState(initialFormState);
  const [file, setFile] = useState(null); // 파일 객체
  const [previewUrl, setPreviewUrl] = useState(null); // 미리보기

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setFile(null);
      setPreviewUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ★ 상태 변경 핸들러 (String 값 그대로 사용)
  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, status: e.target.value }));
  };

  // 파일 핸들러
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.krName || !formData.address || !formData.businessNum) {
      alert('매장명, 주소, 사업자번호는 필수입니다.');
      return;
    }

    if (!window.confirm('새로운 제휴 매장을 등록하시겠습니까?')) return;

    try {
      const submitFormData = new FormData();

      // 1. 텍스트 데이터 -> JSON Blob 변환 (PartnerDetail과 동일 방식)
      const partnerData = {
        ...formData,
        // 필요하다면 숫자 변환 등 전처리 수행
        // userId: Number(formData.userId) 
      };

      const jsonBlob = new Blob([JSON.stringify(partnerData)], { type: "application/json" });
      submitFormData.append("requestDto", jsonBlob);

      // 2. 파일 데이터
      if (file) {
        submitFormData.append("logoImg", file);
      } else {
        // (선택사항) 이미지가 필수라면 여기서 막거나, 기본 이미지를 처리해야 함
        // alert("로고 이미지는 필수입니다."); return; 
      }

      // 3. 전송
      await dispatch(partnerCreateThunk(submitFormData)).unwrap();
      
      alert('성공적으로 등록되었습니다.');
      onRefresh(); // 목록 새로고침
      onClose();   // 모달 닫기

    } catch (error) {
      console.error('등록 실패:', error);
      alert('등록 실패: ' + (error || '알 수 없는 오류'));
    }
  };

  // 배경 클릭 닫기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      {/* 모달 컨테이너: 최대 높이 설정 필요 */}
      <div className="modal-container scrollable-modal">
        <div className="modal-header">
          <h2>New Partner Registration</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {/* ★ 여기가 스크롤 영역입니다 */}
          <div className="modal-body modal-body-scroll">
            
            {/* 로고 이미지 */}
            <div className="form-row">
              <div className="form-group full">
                <label>매장 로고 (Image)</label>
                <div className="image-upload-wrapper">
                    {previewUrl && (
                        <div className="img-preview">
                             <img src={previewUrl} alt="Preview" />
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>
            </div>

            {/* 사업자 번호 */}
            <div className="form-row">
               <div className="form-group full">
                <label>사업자 번호 <span className="required">*</span></label>
                <input type="text" name="businessNum" value={formData.businessNum} onChange={handleChange} placeholder="000-00-00000" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full">
                <label>매장명 (한글) <span className="required">*</span></label>
                <input type="text" name="krName" value={formData.krName} onChange={handleChange} placeholder="예: 올리브영 강남점" required />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full">
                <label>매장명 (영문)</label>
                <input type="text" name="enName" value={formData.enName} onChange={handleChange} placeholder="Ex: OliveYoung Gangnam" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>담당자</label>
                <input type="text" name="manager" value={formData.manager} onChange={handleChange} placeholder="이름" />
              </div>
              <div className="form-group">
                <label>전화번호</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="02-0000-0000" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full">
                <label>주소 <span className="required">*</span></label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="전체 주소 입력" required />
              </div>
            </div>

            {/* ★ 3가지 상태 선택 (RES, REQ, REJ) */}
            <div className="form-row">
              <div className="form-group full">
                <label>운영 상태</label>
                <div className="status-selector">
                  {/* 승인 */}
                  <label className={`radio-label res ${formData.status === 'RES' ? 'active' : ''}`}>
                    <input type="radio" name="status" value="RES" checked={formData.status === 'RES'} onChange={handleStatusChange} />
                    승인
                  </label>
                  {/* 대기 */}
                  <label className={`radio-label req ${formData.status === 'REQ' ? 'active' : ''}`}>
                    <input type="radio" name="status" value="REQ" checked={formData.status === 'REQ'} onChange={handleStatusChange} />
                    대기
                  </label>
                  {/* 반려 */}
                  <label className={`radio-label rej ${formData.status === 'REJ' ? 'active' : ''}`}>
                    <input type="radio" name="status" value="REJ" checked={formData.status === 'REJ'} onChange={handleStatusChange} />
                    반려
                  </label>
                </div>
              </div>
            </div>

          </div> {/* modal-body 끝 */}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-save">등록 하기</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PartnerCreate;