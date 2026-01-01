import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './Partner.css'; 
// ★ 이미지 업로드용 Thunk 추가 import
import { partnerCreateThunk, postLogoImageUploadThunk } from '../../store/thunks/partnerThunk'; 

function PartnerCreate({ isOpen, onClose, onRefresh }) {
  const dispatch = useDispatch();

  // 초기값 설정
  const initialFormState = {
    userId: '',      // ★ User ID 입력 필드 추가
    businessNum: '',
    krName: '',
    enName: '',
    manager: '',
    phone: '',
    address: '',
    status: 'RES', 
    lat: 37.5665,  
    lng: 126.9780, 
  };

  const [formData, setFormData] = useState(initialFormState);
  const [file, setFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null); 

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // ★ 수정된 제출 핸들러 (JSON 전송 + 이미지 선 업로드)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.userId || !formData.krName || !formData.address || !formData.businessNum) {
      alert('UserID, 매장명, 주소, 사업자번호는 필수입니다.');
      return;
    }

    if (!window.confirm('새로운 제휴 매장을 등록하시겠습니까?')) return;

    try {
      let imagePath = null;

      // 1. 이미지가 있다면 먼저 업로드
      if (file) {
        // postLogoImageUploadThunk는 PartnerDetail에서 사용했던 것과 동일한 것으로 가정
        const uploadResult = await dispatch(postLogoImageUploadThunk(file)).unwrap();
        // 서버 응답 구조에 맞춰 경로 추출 (예: result.data.path)
        imagePath = uploadResult.data.path; 
      }

      // 2. 최종 전송할 JSON 데이터 구성
      const payload = {
        ...formData,
        userId: Number(formData.userId), // 숫자로 변환
        logoImg: imagePath || null,      // 업로드된 이미지 경로 (없으면 null)
      };

      // 3. 파트너 등록 요청 (JSON)
      await dispatch(partnerCreateThunk(payload)).unwrap();
      
      alert('성공적으로 등록되었습니다.');
      onRefresh(); 
      onClose();   

    } catch (error) {
      console.error('등록 실패:', error);
      alert('등록 실패: ' + (error.message || '알 수 없는 오류'));
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
      <div className="modal-container scrollable-modal">
        <div className="modal-header">
          <h2>New Partner Registration</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body modal-body-scroll">
            
            {/* ★ [수정됨] 로고 이미지와 User ID를 한 줄에 배치 */}
            <div className="form-row">
              {/* 왼쪽: 로고 이미지 (절반) */}
              <div className="form-group">
                <label>매장 로고 (Image)</label>
                <div className="image-upload-wrapper small-box">
                    {previewUrl && (
                        <div className="img-preview">
                             <img src={previewUrl} alt="Preview" />
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              {/* 오른쪽: User ID 입력 (절반) */}
              <div className="form-group">
                <label>User ID (회원 번호) <span className="required">*</span></label>
                <input 
                  type="number" 
                  name="userId" 
                  value={formData.userId} 
                  onChange={handleChange} 
                  placeholder="User ID 입력" 
                  required 
                  style={{ height: '45px' }} /* 높이를 이미지 박스와 얼추 맞춤 */
                />
                <p style={{fontSize:'12px', color:'#999', marginTop:'5px'}}>
                   * 등록할 파트너 계정의 User PK를 입력하세요.
                </p>
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