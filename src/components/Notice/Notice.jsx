import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Notice.css'; // 기존 CSS 사용
import { noticeCreateThunk, noticeShowThunk } from '../../store/thunks/noticeThunk.js';

function Notice() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux Store에서 공지 리스트 가져오기 (store 구조에 따라 state.notice.notices 등으로 수정 필요)
  const { show, isLoading } = useSelector((state) => state.noticeShow); 

  // 입력 폼 상태 관리
  const [role, setRole] = useState('ALL'); // ALL | DLV | PTN
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 1. 초기 데이터 로드 (더미 데이터 제거됨)
  useEffect(() => {
    dispatch(noticeShowThunk());
  }, [dispatch]);

  // 2. 공지 발송 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (!window.confirm('새로운 공지를 등록하시겠습니까?')) return;

    const newNotice = {
      targetRole: role,
      title: title,
      content: content,
      // status는 서버에서 default(true)로 생성된다고 가정
    };

    try {
      await dispatch(noticeCreateThunk(newNotice)).unwrap();
      alert(`[${role}] 대상으로 공지가 발송되었습니다.`);
      
      // 성공 후 폼 초기화 및 리스트 재조회
      setTitle('');
      setContent('');
      setRole('ALL');
      dispatch(noticeShowThunk()); // 리스트 갱신
    } catch (error) {
      console.error('등록 실패:', error);
      alert('공지 등록 실패: ' + (error?.message || '오류가 발생했습니다.'));
    }
  };

  // 3. 상세 페이지 이동 핸들러
  const handleManage = (id) => {
    navigate(`/admin/notice/${id}`);
  };

  return (
    <div className="notice-container">
      <div className="notice-title">Notice (공지 발송)</div>

      <div className="notice-content-wrapper">
        {/* 공지 작성 폼 */}
        <div className="notice-form-card">
          <h3 className="card-subtitle">Create New Notice</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">수신 대상 (Target Audience)</label>
              <div className="role-selector">
                {['ALL', 'DLV', 'PTN'].map((r) => (
                  <label key={r} className={`role-option ${role === r ? 'active' : ''}`}>
                    <input type="radio" name="role" value={r} checked={role === r} onChange={(e) => setRole(e.target.value)} />
                    {r === 'ALL' ? '전체' : r === 'DLV' ? '기사님' : '제휴처'} ({r})
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">제목 (Title)</label>
              <input 
                type="text" className="notice-input" placeholder="공지사항 제목" 
                value={title} onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">내용 (Content)</label>
              <textarea 
                className="notice-textarea" rows="6" placeholder="내용 입력..."
                value={content} onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="notice-btn-submit">공지사항 발송</button>
            </div>
          </form>
        </div>

        {/* 보낸 공지 내역 (서버 데이터 연동) */}
        <div className="notice-history-card">
          <h3 className="card-subtitle">Sent History (발송 내역)</h3>
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Management</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="4" className="text-center">로딩 중...</td></tr>
                ) : show && show.length > 0 ? (
                  show.map((notice) => (
                    <tr key={notice.id}>
                      <td><span className={`target-badge ${notice.targetRole}`}>{notice.targetRole}</span></td>
                      <td className="text-left">
                        <div className="history-title">
                          {notice.title}
                          {/* 상태 표시 뱃지 (선택 사항) */}
                          {!notice.status && <span style={{fontSize:'0.7rem', color:'green', marginLeft:'5px'}}>(진행중)</span>}
                          {notice.status && <span style={{fontSize:'0.7rem', color:'red', marginLeft:'5px'}}>(종료)</span>}
                        </div>
                        <div className="history-content-preview">{notice.content}</div>
                      </td>
                      <td className="text-date">{new Date(notice.createAt || notice.date).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-manage" onClick={() => handleManage(notice.id)}>
                          관리
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">발송된 공지사항이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notice;