import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import './Partner.css'; 
import { partnerDeleteThunk, partnerDetailThunk, partnerUpdateThunk, postLogoImageUploadThunk } from '../../store/thunks/partnerThunk.js';
import InvoiceSendModal from '../invoice/Invoice.jsx';
import { searchAddressToCoords } from '../../api/utils/kakaoAddress.js';
import ImgView from '../../api/utils/imgView.jsx';
import AddressModal from '../common/AddressModal.jsx'; // AddressModal 임포트

function PartnerDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY, 
    libraries: ["services"],
  });

  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null); 
  const [file, setFile] = useState(null); 
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); // 주소 모달 상태
  
  const [imgViewOpen, setImgViewOpen] = useState(false);
  const [imgViewSrc, setImgViewSrc] = useState("");
  const [imgViewAlt, setImgViewAlt] = useState("");

  // 상세 데이터 조회
  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const result = await dispatch(partnerDetailThunk(id)).unwrap();
        const { address, ...rest } = result.data;
        // 주소 관련 필드를 UI 상태로 추가
        setEditData({
          ...rest,
          address: address || '', // 기존 주소
          postcode: '',
          detailAddress: ''
        });
        
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

  const openImgView = (src, alt = "image") => {
    if (!src) return;
    setImgViewSrc(src);
    setImgViewAlt(alt);
    setImgViewOpen(true);
  };
  const closeImgView = () => setImgViewOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const cleaned = value.replace(/[^\d]/g, '');
      let formatted = cleaned;

      if (cleaned.startsWith('02') && cleaned.length > 2) {
        // 서울 지역번호 형식 (2-4-4)
        if (cleaned.length <= 6) {
          formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
        } else {
          formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
        }
      } else if (!cleaned.startsWith('02') && cleaned.length > 3) {
        // 그 외 번호 형식
        if (cleaned.length <= 7) {
          // 중간 번호 3자리 또는 4자리 입력 중
          formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        } else if (cleaned.length <= 10) {
          // 10자리 번호: 3-3-4 형식
          formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else {
          // 11자리 번호: 3-4-4 형식
          formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
        }
      }
      setEditData(prev => ({ ...prev, phone: formatted }));
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStatusChange = (e) => {
    setEditData(prev => ({ ...prev, status: e.target.value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); 
    }
  };

  // 주소 검색 완료 핸들러 (AddressModal로부터 데이터를 받음)
  const handleAddressComplete = (data) => {
    setEditData(prev => ({
      ...prev,
      postcode: data.postcode,
      address: data.address,
    }));
    setIsAddressModalOpen(false); // 모달 닫기
  };

  // 수정 완료 핸들러
  const handleUpdate = async () => {
    if (!window.confirm(`${editData.krName} 정보를 수정하시겠습니까?`)) return;

    try {
      const fullAddress = `${editData.address} ${editData.detailAddress || ''}`.trim();
      const coords = await searchAddressToCoords(fullAddress);
      
      if (!coords) {
        alert("주소를 좌표로 변환할 수 없습니다. 주소를 다시 확인해주세요.");
        return;
      }

      const payload = { ...editData };

      if(file) {
        const resultUpload = await dispatch(postLogoImageUploadThunk(file)).unwrap();
        payload.logoImg = resultUpload.data.path;
      }

      payload.address = fullAddress;
      payload.lat = coords.lat;
      payload.lng = coords.lng;

      delete payload.postcode;
      delete payload.detailAddress;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.deletedAt;
      delete payload.partner_user; 

      await dispatch(partnerUpdateThunk(payload)).unwrap();
        
      alert('수정이 완료되었습니다.');
      navigate('/admin/partner');
      
    } catch (e) {
      console.error(e);
      alert("수정 실패: " + (e.message || "오류가 발생했습니다."));
    }
  };

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
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onComplete={handleAddressComplete}
      />

      <button className="btn-back-page" onClick={() => navigate('/admin/partner')}>&lt; 목록으로 돌아가기</button>

      <div className="partner-detail-header">
        <h2>제휴 매장 상세 정보 수정</h2>
      </div>

      <div className="partner-detail-card">
        <div className="detail-grid">
          
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
             <input type="text" name="businessNum" value={editData.businessNum || ''} onChange={handleInputChange} className="input-editable" />
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

          <div className="form-group-address full-width">
            <label>주소 (Address)</label>
            <div className="address-row">
              <input 
                type="text" 
                name="postcode" 
                value={editData.postcode || ''} 
                placeholder="우편번호" 
                readOnly 
                className="input-disabled" 
              />
              <button onClick={() => setIsAddressModalOpen(true)} className="btn-search-address">우편번호 검색</button>
            </div>
            <div className="address-row">
              <input 
                type="text" 
                name="address" 
                value={editData.address || ''} 
                placeholder="주소" 
                readOnly 
                className="input-disabled"
              />
            </div>
            <div className="address-row">
              <input 
                type="text" 
                name="detailAddress" 
                value={editData.detailAddress || ''} 
                placeholder="상세주소 입력" 
                onChange={handleInputChange} 
                className="input-editable"
              />
            </div>
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