import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useKakaoLoader } from 'react-kakao-maps-sdk'; // ★ 1. 로더 추가
import './Partner.css'; 
import { partnerDeleteThunk, partnerDetailThunk, partnerUpdateThunk, postLogoImageUploadThunk } from '../../store/thunks/partnerThunk.js';
import InvoiceSendModal from '../invoice/Invoice.jsx'; // (경로 확인 필요)
// ★ 2. 주소 변환 유틸 import
import { searchAddressToCoords } from '../../api/utils/kakaoAddress.js';
import ImgView from '../../api/utils/imgView.jsx';

function PartnerDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  // ★ 3. 카카오 맵 로드
  useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY, 
    libraries: ["services"],
  });

  // 데이터 상태
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 이미지 관련 상태
  const [previewUrl, setPreviewUrl] = useState(null); 
  const [file, setFile] = useState(null); 
  // 인보이스 모달 상태
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  
  const [imgViewOpen, setImgViewOpen] = useState(false);
  const [imgViewSrc, setImgViewSrc] = useState("");
  const [imgViewAlt, setImgViewAlt] = useState("");

  const openImgView = (src, alt = "image") => {
    if (!src) return;
    setImgViewSrc(src);
    setImgViewAlt(alt);
    setImgViewOpen(true);
  };

  const closeImgView = () => setImgViewOpen(false);

  // 1. 상세 데이터 조회
  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const result = await dispatch(partnerDetailThunk(id)).unwrap();
        setEditData(result.data);
        
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
  }, [dispatch, id, navigate]);

  // 2. 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // 3. 상태 변경 핸들러
  const handleStatusChange = (e) => {
    setEditData(prev => ({ ...prev, status: e.target.value }));
  };

  // 4. 이미지 파일 변경 핸들러
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); 
    }
  };

  // ★ 5. 수정 완료 핸들러 (좌표 변환 추가)
  const handleUpdate = async () => {
    if (!window.confirm(`${editData.krName} 정보를 수정하시겠습니까?`)) return;

    try {
      // 5-1. 주소 -> 좌표 변환
      const coords = await searchAddressToCoords(editData.address);
      
      if (!coords) {
        alert("주소를 좌표로 변환할 수 없습니다. 주소를 다시 확인해주세요.");
        return;
      }

      const payload = { ...editData };

      // 5-2. 이미지 업로드 (파일이 변경된 경우만)
      if(file) {
        const resultUpload = await dispatch(postLogoImageUploadThunk(file)).unwrap();
        payload.logoImg = resultUpload.data.path;
      }

      // 5-3. 변환된 좌표 데이터 추가
      payload.lat = coords.lat;
      payload.lng = coords.lng;

      // 불필요한 필드 제거
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.deletedAt;
      // 백엔드 구조에 따라 partner_user 객체가 있으면 에러가 날 수 있으므로 제거 권장
      delete payload.partner_user; 

      console.log("Partner Update Payload:", payload); // 디버깅용

      // 5-4. API 전송
      await dispatch(partnerUpdateThunk(payload)).unwrap();
        
      alert('수정이 완료되었습니다.');
      navigate('/admin/partner');
      
    } catch (e) {
      console.error(e);
      alert("수정 실패: " + (e.message || "오류가 발생했습니다."));
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    try {
      await dispatch(partnerDeleteThunk(id)).unwrap();
      alert('삭제되었습니다.');
      navigate('/admin/partner');
    } catch (error) {
      console.error(error);
      alert('삭제 실패: ' + (error?.message || '알 수 없는 오류'));
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
          
          {/* 읽기 전용 영역 */}
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
            <input type="text" value={editData.partner_user?.name || '-'} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>생성일</label>
            <input type="text" value={editData.createdAt || '-'} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>수정일</label>
            <input type="text" value={editData.updatedAt || '-'} disabled className="input-disabled" />
          </div>
          {editData.deletedAt && (
             <div className="form-group full-width">
                <label style={{color:'red'}}>삭제일</label>
                <input type="text" value={editData.deletedAt} disabled className="input-disabled" />
             </div>
          )}

          <hr className="divider full-width" />

          {/* 수정 가능 영역 */}
          <div className="form-group full-width">
            <label>매장 로고 (Logo Image)</label>
            <div className="image-upload-wrapper">
              {previewUrl && (
                <div className="img-preview" onClick={() => openImgView(previewUrl)}>
                  <img src={previewUrl} alt="Logo Preview" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="form-group full-width">
             <label>사업자 번호 (Business Num)</label>
             <input type="text" name="businessNum" value={editData.businessNum} onChange={handleInputChange} className="input-editable" />
          </div>

          <div className="form-group full-width">
             <label>매장명 (한글)</label>
             <input type="text" name="krName" value={editData.krName} onChange={handleInputChange} className="input-editable" />
          </div>
          <div className="form-group full-width">
             <label>매장명 (영문)</label>
             <input type="text" name="enName" value={editData.enName} onChange={handleInputChange} className="input-editable" />
          </div>

          <div className="form-group">
            <label>담당자 (Manager)</label>
            <input type="text" name="manager" value={editData.manager} onChange={handleInputChange} className="input-editable" />
          </div>
          <div className="form-group">
            <label>전화번호</label>
            <input type="text" name="phone" value={editData.phone} onChange={handleInputChange} className="input-editable" />
          </div>

          <div className="form-group full-width">
            <label>주소 (Address)</label>
            <input type="text" name="address" value={editData.address} onChange={handleInputChange} className="input-editable" />
          </div>

          <div className="form-group full-width">
            <label>운영 상태 (Status)</label>
            <div className="status-selector">
              <label className={`radio-label res ${editData.status === 'RES' ? 'active' : ''}`}>
                <input type="radio" name="status" value="RES" checked={editData.status === 'RES'} onChange={handleStatusChange} />
                승인 (Approved)
              </label>
              <label className={`radio-label req ${editData.status === 'REQ' ? 'active' : ''}`}>
                <input type="radio" name="status" value="REQ" checked={editData.status === 'REQ'} onChange={handleStatusChange} />
                대기 (Pending)
              </label>
              <label className={`radio-label rej ${editData.status === 'REJ' ? 'active' : ''}`}>
                <input type="radio" name="status" value="REJ" checked={editData.status === 'REJ'} onChange={handleStatusChange} />
                반려 (Rejected)
              </label>
            </div>
          </div>

        </div>

        <div className="detail-actions">
          <button 
            className="btn-cancel" 
            style={{ 
              marginRight: 'auto', 
              marginLeft: '10px',
              borderColor: '#27AE60', 
              color: '#27AE60', 
              fontWeight: 'bold' 
            }}
            onClick={() => setIsInvoiceModalOpen(true)}
          >
            📧 청구서 발송
          </button>
          <button className="adm-btn delete" onClick={handleDelete}>삭제 (Delete)</button>
          <button className="btn-save" onClick={handleUpdate}>수정 완료</button>
        </div>
      </div>

      {isInvoiceModalOpen && (
        <InvoiceSendModal 
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          partnerId={editData.id}
          partnerName={editData.krName}
        />
      )}
      <ImgView 
        isOpen={imgViewOpen}
        onClose={closeImgView}
        src={imgViewSrc}
        alt={imgViewAlt}
      />
    </div>
  );
}

export default PartnerDetail;