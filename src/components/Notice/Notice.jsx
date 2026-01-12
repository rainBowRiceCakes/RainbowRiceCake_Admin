import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Notice.css'; 
import { noticeCreateThunk, noticeShowThunk } from '../../store/thunks/noticeThunk.js';

function Notice() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux Store에서 공지 리스트 가져오기 (서버 사이드)
  const { notices, pagination, loading } = useSelector((state) => state.noticeShow); 

  // 입력 폼 상태 관리 (공지 생성용)
  const [role, setRole] = useState('ALL'); // ALL | DLV | PTN
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 페이지네이션 상태 관리 (공지 목록용)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 요청에 따라 5개로 고정
  const PAGE_GROUP_SIZE = 5; // 요청에 따라 5개로 고정

  // 데이터 요청
  const fetchNotices = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    dispatch(noticeShowThunk(params));
  }, [dispatch, currentPage, itemsPerPage]);

  // 초기 데이터 로드 및 페이지 변경 시 실행
  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // 공지 발송 핸들러
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
    };

    try {
      await dispatch(noticeCreateThunk(newNotice)).unwrap();
      alert(`[${role}] 대상으로 공지가 발송되었습니다.`);
      
      setTitle('');
      setContent('');
      setRole('ALL');
      setCurrentPage(1); // 새 글 작성 시 1페이지로 이동 및 목록 새로고침
      fetchNotices(); // 목록 새로고침
    } catch (error) {
      console.error('등록 실패:', error);
      alert('공지 등록 실패: ' + (error?.message || '오류가 발생했습니다.'));
    }
  };

  // 상세 페이지 이동 핸들러
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

        {/* 보낸 공지 내역 */}
        <div className="notice-history-card">
          <h3 className="card-subtitle">Sent History (발송 내역)</h3>
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>권한</th>
                  <th>제목</th>
                  <th>등록날짜</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center">로딩 중...</td></tr>
                ) : notices && notices.length > 0 ? (
                  notices.map((notice) => (
                    <tr key={notice.id}>
                      <td><span className={`target-badge ${notice.targetRole}`}>{notice.targetRole}</span></td>
                      <td className="text-left">
                        <div className="history-title">
                          {notice.title}
                          {!notice.status && <span style={{fontSize:'0.7rem', color:'green', marginLeft:'5px'}}>(진행중)</span>}
                          {notice.status && <span style={{fontSize:'0.7rem', color:'red', marginLeft:'5px'}}>(종료)</span>}
                        </div>
                        <div className="history-content-preview">{notice.content}</div>
                      </td>
                      <td className="text-date">{(notice.createdAt ? notice.createdAt.slice(0, 10) : '-')}</td>
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

          {/* 페이지네이션 (그룹 적용 - 서버 측) */}
          {pagination && pagination.totalPages > 1 && (() => {
            const totalPages = pagination.totalPages;
            
            const handlePageChange = (newPage) => {
              if (newPage >= 1 && newPage <= totalPages) {
                setCurrentPage(newPage);
              }
            };

            const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
            
            let startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
            let endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

            const pageNumbers = [];
            for (let i = startPage; i <= endPage; i++) {
              pageNumbers.push(i);
            }

            const handlePrevGroup = () => {
              const newPage = startPage - PAGE_GROUP_SIZE;
              handlePageChange(newPage < 1 ? 1 : newPage);
            };

            const handleNextGroup = () => {
              const newPage = startPage + PAGE_GROUP_SIZE;
              handlePageChange(newPage > totalPages ? totalPages : newPage);
            };

            return (
              <div className="pagination">
                <button onClick={handlePrevGroup} disabled={startPage === 1}>&lt;&lt;</button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
                {pageNumbers.map(num => (
                  <button 
                    key={num} 
                    className={currentPage === num ? 'active' : ''}
                    onClick={() => handlePageChange(num)}
                  >
                    {num}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
                <button onClick={handleNextGroup} disabled={endPage === totalPages}>&gt;&gt;</button>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}

export default Notice;