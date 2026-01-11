import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './Hotel.css';
import { hotelDeleteThunk, hotelDetailThunk, hotelUpdateThunk } from '../../store/thunks/hotelThunk.js';
import { searchAddressToCoords } from '../../api/utils/kakaoAddress.js';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import AddressModal from '../common/AddressModal.jsx'; // AddressModal 임포트

function HotelDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY,
    libraries: ["services"],
  });
  
  const { id } = useParams();

  const [editData, setEditData] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); // 주소 모달 상태

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await dispatch(hotelDetailThunk(id)).unwrap();
        const { address, ...rest } = result.data;
        setEditData({
          ...rest,
          address: address || '',
          postcode: '',
          detailAddress: ''
        });
      } catch (error) {
        alert("데이터를 불러오지 못했습니다. 목록으로 돌아갑니다.");
        navigate('/admin/hotel');
      }
    }
    fetchData();
  }, [dispatch, id, navigate]);

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
    setEditData(prev => ({ ...prev, status: e.target.value === 'true' }));
  };

  // 주소 검색 완료 핸들러
  const handleAddressComplete = (data) => {
    setEditData(prev => ({
      ...prev,
      postcode: data.postcode,
      address: data.address,
    }));
    setIsAddressModalOpen(false);
  };

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
      payload.address = fullAddress;
      payload.lat = coords.lat;
      payload.lng = coords.lng;
      
      delete payload.postcode;
      delete payload.detailAddress;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.deletedAt;
      
      await dispatch(hotelUpdateThunk(payload)).unwrap();
      
      alert('수정이 완료되었습니다.');
      navigate('/admin/hotel');

    } catch (error) {
      console.error('수정 실패:', error);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    try {
      await dispatch(hotelDeleteThunk(id)).unwrap();
      alert('삭제되었습니다.');
      navigate('/admin/hotel');
    } catch (error) {
      console.error(error);
      alert('삭제 실패: ' + (error?.message || '알 수 없는 오류'));
    }
  };

  if (!editData) return <div>Loading...</div>;

  return (
    <div className="hotel-container">
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onComplete={handleAddressComplete}
      />

      <button className="btn-back-page" onClick={() => navigate('/admin/hotel')}>&lt; 목록으로 돌아가기</button>
      
      <div className="hotel-detail-header">
        <h2>호텔 상세 정보 수정</h2>
      </div>

      <div className="hotel-detail-card">
        <div className="detail-grid">
          <div className="form-group">
            <label>Hotel ID (수정 불가)</label>
            <input type="text" value={editData.id} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>생성일</label>
            <input type="text" value={editData.createdAt || '-'} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>수정일</label>
            <input type="text" value={editData.updatedAt || '-'} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>삭제일</label>
            <input type="text" value={editData.deletedAt || '-'} disabled className="input-disabled" />
          </div>

          <div className="form-group full-width">
            <label>호텔명 (한글)</label>
            <input type="text" name="krName" value={editData.krName} onChange={handleInputChange} className="input-editable" />
          </div>
          <div className="form-group full-width">
            <label>호텔명 (영문)</label>
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
            <label>주소</label>
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
            <label>운영 상태</label>
            <div className="status-selector">
              <label className={`radio-label ${editData.status ? 'active' : ''}`}>
                <input type="radio" name="status" value="true" checked={editData.status === true} onChange={handleStatusChange} />
                활동 중 (Active)
              </label>
              <label className={`radio-label ${!editData.status ? 'inactive' : ''}`}>
                <input type="radio" name="status" value="false" checked={editData.status === false} onChange={handleStatusChange} />
                비활동 (Inactive)
              </label>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <button className="adm-btn delete" onClick={handleDelete}>삭제 (Delete)</button>
          <button className="btn-save" onClick={handleUpdate}>수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default HotelDetail;