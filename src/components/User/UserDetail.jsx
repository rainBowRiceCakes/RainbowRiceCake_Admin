import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './User.css'; 

// ★ Thunk Import (userThunk.js에 해당 함수들이 정의되어 있어야 합니다)
import { userDeleteThunk, userDetailThunk, userUpdateThunk } from '../../store/thunks/userThunk.js';

function UserDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 상세 데이터 조회 (서버 요청)
  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const result = await dispatch(userDetailThunk(id)).unwrap();
        console.log(result)
        // 백엔드 응답 구조에 따라 result.data 혹은 result를 사용
        setEditData(result.data); 
      } catch (error) {
        console.error("데이터 조회 실패:", error);
        alert("회원 정보를 불러올 수 없습니다.");
        navigate('/admin/user');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchDetail();
    }
  }, [dispatch, id, navigate]);

  // 2. 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // 3. 수정 완료 핸들러 (서버 요청)
  const handleUpdate = async () => {
    if(!window.confirm("회원 정보를 수정하시겠습니까?")) return;

    try {
      // ★ 백엔드 API 호출: PUT /api/users (또는 특정 경로)
      // editData 전체를 보내거나 필요한 필드만 추려서 전송
      await dispatch(userUpdateThunk(editData)).unwrap();

      alert("수정이 완료되었습니다.");
      navigate('/admin/user'); // 목록으로 이동
    } catch (error) {
      console.error("수정 실패:", error);
      alert("수정 실패: " + (error.message || "알 수 없는 오류가 발생했습니다."));
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    if (!window.confirm('rider정보와 partner정보도 함께 삭제됩니다.')) return;
    
    try {
      await dispatch(userDeleteThunk(id)).unwrap();
      alert('삭제되었습니다.');
      navigate('/admin/user');
    } catch (error) {
      console.error(error);
      alert('삭제 실패: ' + (error?.message || '알 수 없는 오류'));
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!editData) return <div>데이터가 없습니다.</div>;

  return (
    <div className="user-container relative-container">
      
      <div className="user-detail-header">
        <h2>회원 상세 정보 (User Detail)</h2>
        <button className="btn-back-page" onClick={() => navigate('/admin/user')}>
          &lt; 목록으로 돌아가기
        </button>
      </div>

      <div className="user-detail-card">
        {/* Read Only Section */}
        <h3 className="section-title">기본 정보 (Read Only)</h3>
        <div className="detail-grid">
          <div className="form-group">
            <label>User ID</label>
            <input type="text" value={editData.id} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>가입일</label>
            <input 
              type="text" 
              // 날짜 포맷팅 (데이터가 있을 때만)
              value={editData.createdAt ? new Date(editData.createdAt).toLocaleString() : '-'} 
              disabled 
              className="input-disabled" 
            />
          </div>
          <div className="form-group full-width">
            <label>권한 (Role)</label>
            <input 
              type="text" 
              value={editData.role ? editData.role.toUpperCase() : ''} 
              disabled 
              className="input-disabled" 
            />
          </div>
        </div>

        {/* Editable Section */}
        <h3 className="section-title mt-40">회원 정보 관리</h3>
        <div className="detail-grid">
          <div className="form-group">
            <label>이름 (Name)</label>
            <input 
              type="text" 
              name="name" 
              value={editData.name || ''} 
              onChange={handleChange} 
              className="input-editable" 
            />
          </div>
          <div className="form-group">
            <label>이메일 (Email)</label>
            <input 
              type="email" 
              name="email" 
              value={editData.email || ''} 
              onChange={handleChange} 
              className="input-editable" 
            />
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

export default UserDetail;