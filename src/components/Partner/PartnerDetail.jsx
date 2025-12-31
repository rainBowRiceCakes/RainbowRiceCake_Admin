import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './Partner.css'; 
import { partnerDetailThunk, partnerUpdateThunk, postLogoImageUploadThunk } from '../../store/thunks/partnerThunk.js';

function PartnerDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  // 데이터 상태
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 이미지 관련 상태
  const [previewUrl, setPreviewUrl] = useState(null); // 미리보기 URL
  const [file, setFile] = useState(null); // 실제 업로드할 파일 객체

  // 1. 상세 데이터 조회 (ID 기준)
  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        // ID로 최신 데이터 조회
        const result = await dispatch(partnerDetailThunk(id)).unwrap();
        setEditData(result.data);
        
        // 기존 이미지가 있다면 미리보기에 세팅
        if (result.data.logoImg) {
          setPreviewUrl(result.data.logoImg); 
        }
      } catch (error) {
        alert("제휴처 정보를 불러올 수 없습니다.");
        navigate('/admin/partner');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, []);

  // 2. 텍스트 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // 3. 상태(Status) 변경 핸들러 ('RES', 'REQ', 'REJ')
  const handleStatusChange = (e) => {
    setEditData(prev => ({ ...prev, status: e.target.value }));
  };

  // 4. 이미지 파일 변경 핸들러
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // 미리보기 URL 생성
    }
  };

  // 5. 수정 완료 핸들러 (FormData 사용 - Multer 대응)
  const handleUpdate = async () => {
    if (!window.confirm(`${editData.krName} 정보를 수정하시겠습니까?`)) return;

    try {
      const resultUpload = await dispatch(postLogoImageUploadThunk(file)).unwrap();
      // state를 직접 수정하기보다 복사본(payload)을 만들어 전송하는 것이 안전.
      const payload = { ...editData };

      payload.image = resultUpload.data.path;

      // 불필요한 필드 제거
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.deletedAt;

      // TODO: address를 lan,lng으로 변경하는 처리 필요

      // API 전송
      await dispatch(partnerUpdateThunk(payload)).unwrap();
        
      alert('수정이 완료되었습니다.');
      navigate('/admin/partner');
      
    } catch (e) {
      console.error(e);
      alert("수정 실패: " + (e.message || "오류가 발생했습니다."));
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!editData) return null;

  return (
    <div className="partner-container">
      <button className="btn-back-page" onClick={() => navigate('/admin/partner')}>&lt; 목록으로 돌아가기</button>

      <div className="partner-detail-header">
        <h2>제휴 매장 상세 정보 수정</h2>
      </div>

      <div className="partner-detail-card">
        <div className="detail-grid">
          
          {/* =================================================
              1. 읽기 전용 (수정 불가) 영역
              - id, userId, createdAt, updatedAt, deletedAt
             ================================================= */}
          <div className="form-group">
            <label>Partner ID (수정 불가)</label>
            <input type="text" value={editData.id} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>User ID (수정 불가)</label>
            <input type="text" value={editData.userId} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>유저명</label>
            <input type="text" value={editData.partner_user.name || '-'} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>생성일</label>
            <input type="text" value={editData.createdAt || '-'} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>수정일</label>
            <input type="text" value={editData.updatedAt || '-'} disabled className="input-disabled" />
          </div>
          {/* 삭제일은 값이 있을 때만 표시 */}
          {editData.deletedAt && (
             <div className="form-group full-width">
                <label style={{color:'red'}}>삭제일</label>
                <input type="text" value={editData.deletedAt} disabled className="input-disabled" />
             </div>
          )}

          <hr className="divider full-width" />

          {/* =================================================
              2. 수정 가능 영역 (Editable)
              - logoImg, businessNum, names, manager, phone, address, status
             ================================================= */}
          
          {/* [이미지 업로드] */}
          <div className="form-group full-width">
            <label>매장 로고 (Logo Image)</label>
            <div className="image-upload-wrapper">
              {previewUrl && (
                <div className="img-preview">
                  <img src={previewUrl} alt="Logo Preview" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          {/* [사업자 번호] - 수정 가능 목록에 포함됨 */}
          <div className="form-group full-width">
             <label>사업자 번호 (Business Num)</label>
             <input 
               type="text" 
               name="businessNum" 
               value={editData.businessNum} 
               onChange={handleInputChange} 
               className="input-editable" 
             />
          </div>

          {/* [매장명] */}
          <div className="form-group full-width">
             <label>매장명 (한글)</label>
             <input type="text" name="krName" value={editData.krName} onChange={handleInputChange} className="input-editable" />
          </div>
          <div className="form-group full-width">
             <label>매장명 (영문)</label>
             <input type="text" name="enName" value={editData.enName} onChange={handleInputChange} className="input-editable" />
          </div>

          {/* [담당자/전화번호] */}
          <div className="form-group">
            <label>담당자 (Manager)</label>
            <input type="text" name="manager" value={editData.manager} onChange={handleInputChange} className="input-editable" />
          </div>
          <div className="form-group">
            <label>전화번호</label>
            <input type="text" name="phone" value={editData.phone} onChange={handleInputChange} className="input-editable" />
          </div>

          {/* [주소] */}
          <div className="form-group full-width">
            <label>주소 (Address)</label>
            <input type="text" name="address" value={editData.address} onChange={handleInputChange} className="input-editable" />
          </div>

          {/* [상태 변경] - 3가지 상태 (RES, REQ, REJ) */}
          <div className="form-group full-width">
            <label>운영 상태 (Status)</label>
            <div className="status-selector">
              {/* 승인 */}
              <label className={`radio-label res ${editData.status === 'RES' ? 'active' : ''}`}>
                <input 
                  type="radio" name="status" value="RES" 
                  checked={editData.status === 'RES'} onChange={handleStatusChange} 
                />
                승인 (Approved)
              </label>

              {/* 대기 */}
              <label className={`radio-label req ${editData.status === 'REQ' ? 'active' : ''}`}>
                <input 
                  type="radio" name="status" value="REQ" 
                  checked={editData.status === 'REQ'} onChange={handleStatusChange} 
                />
                대기 (Pending)
              </label>

              {/* 반려 */}
              <label className={`radio-label rej ${editData.status === 'REJ' ? 'active' : ''}`}>
                <input 
                  type="radio" name="status" value="REJ" 
                  checked={editData.status === 'REJ'} onChange={handleStatusChange} 
                />
                반려 (Rejected)
              </label>
            </div>
          </div>

        </div>

        <div className="detail-actions">
          <button className="btn-cancel" onClick={() => navigate('/admin/partner')}>취소</button>
          <button className="btn-save" onClick={handleUpdate}>수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default PartnerDetail;