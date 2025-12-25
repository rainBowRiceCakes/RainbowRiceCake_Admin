import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Hotel.css'; // 스타일은 기존 CSS 재사용
import { useDispatch } from 'react-redux';
import { hotelPostThunk } from '../../store/thunks/hotelThunk.js';

function HotelDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams(); // URL 파라미터에서 ID 가져오기

  // 넘겨받은 데이터가 있으면 사용, 없으면 초기값(새로고침 대비)
  const [editData, setEditData] = useState(location.state?.hotel || null);

  // 만약 새로고침해서 location.state가 날아갔다면, ID로 다시 조회하는 로직 필요
  useEffect(() => {
    if (!editData) {
      // TODO: 여기서 id를 이용해 백엔드에서 다시 데이터를 fetch 해야 합니다.
      // dispatch(getHotelDetailThunk(id))...
      alert("데이터를 불러오지 못했습니다. 목록으로 돌아갑니다.");
      navigate('/admin/hotel');
    }
  }, [editData, id, navigate]);

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // 상태 변경 핸들러
  const handleStatusChange = (e) => {
    setEditData(prev => ({ ...prev, status: e.target.value === 'true' }));
  };

  // 수정 완료 핸들러
  const handleUpdate = () => {
    if (!window.confirm(`${editData.krName} 정보를 수정하시겠습니까?`)) return;
    delete editData.createdAt
    delete editData.updatedAt
    delete editData.deletedAt

    // TODO : 이곳에서 도로명주소 -> 위도/경도 추가하는 처리 필요
    // formData.lat = 
    // formData.lng = 

    dispatch(hotelPostThunk(editData));
    alert('수정이 완료되었습니다.');
    
    navigate('/admin/hotel'); // 목록으로 복귀
  };

  // 데이터가 로딩 전이면 아무것도 보여주지 않음
  if (!editData) return <div>Loading...</div>;

  return (
    <div className="hotel-container">
      <div className="hotel-detail-header">
        <button className="btn-back" onClick={() => navigate('/admin/hotel')}>← 목록으로 돌아가기</button>
        <h2>호텔 상세 정보 수정</h2>
      </div>

      <div className="hotel-detail-card">
        <div className="detail-grid">
          {/* 1. 수정 불가능한 정보 */}
          <div className="form-group">
            <label>Hotel ID (수정 불가)</label>
            <input type="text" value={editData.id} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>생성일</label>
            <input type="text" value={editData.createAt || '-'} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>수정일</label>
            <input type="text" value={editData.updatedAt || '-'} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>삭제일</label>
            <input type="text" value={editData.deletedAt || '-'} disabled className="input-disabled" />
          </div>

          {/* 2. 수정 가능한 정보 */}
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

          <div className="form-group full-width">
            <label>주소</label>
            <input type="text" name="address" value={editData.address} onChange={handleInputChange} className="input-editable" />
          </div>

          {/* 상태 변경 */}
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
          <button className="btn-cancel" onClick={() => navigate('/admin/hotel')}>취소</button>
          <button className="btn-save" onClick={handleUpdate}>수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default HotelDetail;