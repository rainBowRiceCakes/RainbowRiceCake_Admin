import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './Notice.css'; // index.css 변수 기반 스타일

// Thunks
import { 
  noticeDetailThunk, 
  noticeUpdateThunk, 
  noticeDeleteThunk 
} from '../../store/thunks/noticeThunk.js';

function NoticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 데이터 로딩 상태 관리 (Local State)
  const [isLoading, setIsLoading] = useState(true);

  // 폼 데이터 관리 (Local State)
  const [targetRole, setTargetRole] = useState('ALL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(true);
  const [createAt, setCreateAt] = useState('');

  // 1. 초기 데이터 로드 (Thunk 호출 -> 결과 바로 사용)
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        // unwrap()을 사용하여 slice 상태를 거치지 않고 API 응답 데이터를 바로 변수에 할당
        const data = await dispatch(noticeDetailThunk(id)).unwrap();
        console.log(data);
        // 받아온 데이터로 로컬 State 즉시 초기화
        if (data) {
          setTargetRole(data.targetRole || 'ALL');
          setTitle(data.title || '');
          setContent(data.content || '');
          // status가 boolean이 아닐 경우를 대비한 안전한 처리
          setStatus(data.status === true || data.status === 'true');
          setCreateAt(data.createdAt || data.date);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        alert('공지사항 정보를 불러오는데 실패했습니다.');
        navigate('/admin/notice'); // 실패 시 목록으로 이동
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [dispatch, id, navigate]);

  // Status 토글 핸들러
  const toggleStatus = () => {
    setStatus((prev) => !prev);
  };

  // 수정 저장 핸들러
  const handleUpdate = async () => {
    if (!window.confirm('수정사항을 저장하시겠습니까?')) return;

    const updateData = {
      id: id, // URL params의 id 사용
      targetRole,
      title,
      content,
      status
    };

    try {
      await dispatch(noticeUpdateThunk(updateData)).unwrap();
      alert('공지사항이 수정되었습니다.');
      navigate('/admin/notice');
    } catch (error) {
      console.error(error);
      alert('수정 실패: ' + (error?.message || '알 수 없는 오류'));
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    try {
      await dispatch(noticeDeleteThunk(id)).unwrap();
      alert('삭제되었습니다.');
      navigate('/admin/notice');
    } catch (error) {
      console.error(error);
      alert('삭제 실패: ' + (error?.message || '알 수 없는 오류'));
    }
  };

  // 로딩 화면
  if (isLoading) {
    return <div className="loading-container">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="notice-container">
      {/* 뒤로가기 버튼 (index.css 스타일 활용) */}
      <button className="btn-back-page" onClick={() => navigate('/admin/notice')}>
        &lt; 목록으로 돌아가기
      </button>

      <div className="notice-header">
        <h2 className="page-title">Notice Detail</h2>
        <span className="page-subtitle">공지사항 상세 관리 및 수정</span>
      </div>
      
      <div className="notice-content-wrapper">
        <div className="notice-card">
          
          <div className="card-header-row">
            <h3 className="card-title">Edit Notice #{id}</h3>
            {/* Status Toggle Button */}
            <div 
              className={`status-badge-toggle ${status ? 'inactive' : 'active'}`} 
              onClick={toggleStatus}
              title="클릭하여 상태 변경"
            >
              <span className="status-dot"></span>
              {status ? '종료 (Closed)' : '진행중 (Active)'}
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="detail-form">
            {/* Target & Date Row */}
            <div className="form-row">
              <div className="form-group half">
                <label className="form-label">수신 대상 (Target)</label>
                <select 
                  className="adm-input" 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="ALL">전체 (ALL)</option>
                  <option value="DLV">기사님 (DLV)</option>
                  <option value="PTN">제휴처 (PTN)</option>
                </select>
              </div>
              <div className="form-group half">
                <label className="form-label">작성일 (Date)</label>
                <input 
                  type="text" 
                  className="adm-input readonly" 
                  value={createAt ? new Date(createAt).toLocaleString() : ''} 
                  readOnly 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">제목 (Title)</label>
              <input 
                type="text" 
                className="adm-input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label className="form-label">내용 (Content)</label>
              <textarea 
                className="adm-textarea" 
                rows="12"
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
              ></textarea>
            </div>

            <div className="detail-actions">
              <button className="adm-btn delete" onClick={handleDelete}>삭제 (Delete)</button>
              <button className="adm-btn save" onClick={handleUpdate}>수정 저장 (Save)</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NoticeDetail;