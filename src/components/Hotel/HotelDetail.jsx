import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './Hotel.css';
import { hotelDetailThunk, hotelUpdateThunk } from '../../store/thunks/hotelThunk.js';

function HotelDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // [삭제됨] const location = useLocation(); 
  const { id } = useParams(); // URL 파라미터에서 ID 가져오기

  // [수정됨] location.state 확인 없이 초기값은 null (로딩 상태)
  const [editData, setEditData] = useState(null);

  // [수정됨] 페이지 진입 시 무조건 ID로 최신 데이터 조회
  useEffect(() => {
    async function fetchData() {
      try {
        // ID를 이용해 백엔드에서 데이터 fetch
        const result = await dispatch(hotelDetailThunk(id)).unwrap();
        setEditData(result.data); // 받아온 데이터로 state 업데이트
      } catch (error) {
        alert("데이터를 불러오지 못했습니다. 목록으로 돌아갑니다.");
        navigate('/admin/hotel');
      }
    }
    fetchData();
  }, [dispatch, id, navigate]);

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
  const handleUpdate = async () => {
    if (!window.confirm(`${editData.krName} 정보를 수정하시겠습니까?`)) return;

    try {
      // state를 직접 수정하기보다 복사본(payload)을 만들어 전송하는 것이 안전.
      const payload = { ...editData };
      
      // 불필요한 필드 제거
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.deletedAt;

      // address를 lan,lng으로 변경하는 처리 필요
      payload.lat = 33.3333
      payload.lng = 124.4444
      await dispatch(hotelUpdateThunk(payload)).unwrap();
      
      alert('수정이 완료되었습니다.');
      navigate('/admin/hotel'); // 목록으로 복귀

    } catch (error) {
      console.error('수정 실패:', error);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  // 데이터가 로딩 전이면 로딩 화면 표시
  if (!editData) return <div>Loading...</div>;

  return (
    <div className="hotel-container">
      <button className="btn-back-page" onClick={() => navigate('/admin/hotel')}>← 목록으로 돌아가기</button>
      
      <div className="hotel-detail-header">
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