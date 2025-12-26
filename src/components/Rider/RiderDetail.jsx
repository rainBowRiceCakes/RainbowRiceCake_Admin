import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './Rider.css'; 
import { postLicenseImageUploadThunk, riderDetailThunk, riderUpdateThunk } from '../../store/thunks/riderThunk.js';

function RiderDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const result = await dispatch(riderDetailThunk(id)).unwrap();
        setEditData(result.data);
        if (result.data.licenseImg) {
          setPreviewUrl(result.data.licenseImg); 
        }
      } catch (error) {
        alert("기사 정보를 불러올 수 없습니다.");
        navigate('/admin/rider');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [dispatch, id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Status 핸들러
  const handleStatusChange = (e) => {
    setEditData(prev => ({ ...prev, status: e.target.value }));
  };

  // ★ isWorking 토글 핸들러
  const handleWorkingToggle = () => {
    setEditData(prev => ({ ...prev, isWorking: !prev.isWorking }));
  };

  const handleUpdate = async () => {
    if (!window.confirm(`${editData.name} 정보를 수정하시겠습니까?`)) return;

    try {
      const resultUpload = await dispatch(postLicenseImageUploadThunk(file)).unwrap();
      // state를 직접 수정하기보다 복사본(payload)을 만들어 전송하는 것이 안전.
      const payload = { ...editData };

      payload.image = resultUpload.data.path;

      // 불필요한 필드 제거
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.deletedAt;

      // TODO: address를 lan,lng으로 변경하는 처리 필요

      // API 전송
      await dispatch(riderUpdateThunk(payload)).unwrap();
        
      alert('수정이 완료되었습니다.');
      navigate('/admin/rider');
    } catch (e) {
      console.error(e);
      alert('수정 실패');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!editData) return null;

  return (
    <div className="rider-container">
      <div className="rider-detail-header">
        <button className="btn-back" onClick={() => navigate('/admin/rider')}>← 목록으로</button>
        <h2>기사 상세 정보 수정</h2>
      </div>

      <div className="rider-detail-card">
        <div className="detail-grid">
          
          {/* Read Only */}
          <div className="form-group">
            <label>ID (불가)</label>
            <input type="text" value={editData.id} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>User ID (불가)</label>
            <input type="text" value={editData.userId} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>가입일</label>
            <input type="text" value={editData.createdAt || '-'} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>수정일</label>
            <input type="text" value={editData.updatedAt || '-'} disabled className="input-disabled" />
          </div>

          <hr className="divider full-width" />

          {/* Editable */}
          
          {/* 면허증 이미지 */}
          <div className="form-group full-width">
            <label>면허증 (License Image)</label>
            <div className="image-upload-wrapper">
              {previewUrl && <div className="img-preview"><img src={previewUrl} alt="License" /></div>}
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="form-group">
            <label>기사명</label>
            <input type="text" name="name" value={editData.rider_user.name} onChange={handleInputChange} className="input-editable" />
          </div>
           <div className="form-group">
            <label>연락처</label>
            <input type="text" name="phone" value={editData.phone} onChange={handleInputChange} className="input-editable" />
          </div>

          <div className="form-group full-width">
            <label>주소</label>
            <input type="text" name="address" value={editData.address} onChange={handleInputChange} className="input-editable" />
          </div>

          <div className="form-group">
            <label>은행</label>
            <input type="text" name="bank" value={editData.bank} onChange={handleInputChange} className="input-editable" />
          </div>
          <div className="form-group">
            <label>계좌번호</label>
            <input type="text" name="bankNum" value={editData.bankNum} onChange={handleInputChange} className="input-editable" />
          </div>

          <div className="form-group full-width">
            <label>픽업 가능 시간 (Pickup At)</label>
            <input type="text" name="pickupAt" value={editData.pickupAt || ''} onChange={handleInputChange} placeholder="예: 09:00 - 18:00" className="input-editable" />
          </div>

          {/* ★ isWorking 토글 스위치 */}
          <div className="form-group full-width">
            <label>출근 상태 (isWorking)</label>
            <div className="toggle-wrapper" onClick={handleWorkingToggle}>
              <div className={`toggle-switch ${editData.isWorking ? 'on' : 'off'}`}>
                <div className="toggle-handle"></div>
              </div>
              <span className="toggle-label">{editData.isWorking ? '출근 (ON)' : '퇴근 (OFF)'}</span>
            </div>
          </div>

          {/* Status (3 Buttons) */}
          <div className="form-group full-width">
            <label>승인 상태 (Status)</label>
            <div className="status-selector">
              <label className={`radio-label res ${editData.status === 'RES' ? 'active' : ''}`}>
                <input type="radio" value="RES" checked={editData.status === 'RES'} onChange={handleStatusChange} />
                승인
              </label>
              <label className={`radio-label req ${editData.status === 'REQ' ? 'active' : ''}`}>
                <input type="radio" value="REQ" checked={editData.status === 'REQ'} onChange={handleStatusChange} />
                대기
              </label>
              <label className={`radio-label rej ${editData.status === 'REJ' ? 'active' : ''}`}>
                <input type="radio" value="REJ" checked={editData.status === 'REJ'} onChange={handleStatusChange} />
                거절
              </label>
            </div>
          </div>

        </div>

        <div className="detail-actions">
          <button className="btn-cancel" onClick={() => navigate('/admin/rider')}>취소</button>
          <button className="btn-save" onClick={handleUpdate}>수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default RiderDetail;