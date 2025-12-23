import { useState } from 'react';
import './Notice.css';

function Notice() {
  // 상태 관리
  const [role, setRole] = useState('ALL'); // ALL | DLV | PTN
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 보낸 공지 내역 리스트 (더미 데이터 초기값 포함)
  const [sentNotices, setSentNotices] = useState([
    { id: 1, target: 'ALL', title: '서버 점검 안내', content: '새벽 2시부터 점검이 있습니다.', date: '2025-06-20 14:00' },
    { id: 2, target: 'DLV', title: '우천 시 안전 운행 당부', content: '빗길 미끄러짐 주의 바랍니다.', date: '2025-06-21 09:30' },
  ]);

  // 공지 발송 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 전송할 데이터 객체 생성
    const newNotice = {
      id: sentNotices.length + 1, // 간단한 ID 생성
      target: role,
      title: title,
      content: content,
      date: new Date().toLocaleString(), // 현재 시간 포맷
    };

    // 1. API 전송 로직 (여기에 백엔드 호출 코드 들어감)
    console.log('공지 전송 데이터:', newNotice);
    
    // 2. 화면 리스트에 추가 (최신순으로 배치)
    setSentNotices([newNotice, ...sentNotices]);

    alert(`[${role}] 대상으로 공지가 발송되었습니다.`);

    // 폼 초기화
    setTitle('');
    setContent('');
    setRole('ALL');
  };

  // 삭제 핸들러 (옵션 기능)
  const handleDelete = (id) => {
    if (window.confirm('이 공지 내역을 삭제하시겠습니까?')) {
      setSentNotices(sentNotices.filter(notice => notice.id !== id));
    }
  };

  return (
    <div className="notice-container">
      
      {/* 1. 페이지 타이틀 */}
      <div className="notice-title">Notice (공지 발송)</div>

      <div className="notice-content-wrapper">
        {/* 2. 공지 작성 폼 (Form Card) */}
        <div className="notice-form-card">
          <h3 className="card-subtitle">Create New Notice</h3>
          <form onSubmit={handleSubmit}>
            
            {/* 수신 대상 선택 */}
            <div className="form-group">
              <label className="form-label">수신 대상 (Target Audience)</label>
              <div className="role-selector">
                <label className={`role-option ${role === 'ALL' ? 'active' : ''}`}>
                  <input type="radio" name="role" value="ALL" checked={role === 'ALL'} onChange={(e) => setRole(e.target.value)} />
                  전체 (ALL)
                </label>
                <label className={`role-option ${role === 'DLV' ? 'active' : ''}`}>
                  <input type="radio" name="role" value="DLV" checked={role === 'DLV'} onChange={(e) => setRole(e.target.value)} />
                  기사님 (DLV)
                </label>
                <label className={`role-option ${role === 'PTN' ? 'active' : ''}`}>
                  <input type="radio" name="role" value="PTN" checked={role === 'PTN'} onChange={(e) => setRole(e.target.value)} />
                  제휴처 (PTN)
                </label>
              </div>
            </div>

            {/* 제목 입력 */}
            <div className="form-group">
              <label className="form-label">제목 (Title)</label>
              <input 
                type="text" 
                className="notice-input" 
                placeholder="공지사항 제목을 입력하세요" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 내용 입력 */}
            <div className="form-group">
              <label className="form-label">내용 (Content)</label>
              <textarea 
                className="notice-textarea" 
                rows="6" 
                placeholder="전달할 내용을 상세히 입력하세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>

            {/* 전송 버튼 */}
            <div className="form-actions">
              <button type="submit" className="notice-btn-submit">
                공지사항 발송
              </button>
            </div>
          </form>
        </div>

        {/* 3. 보낸 공지 내역 (History List) - 새로 추가된 부분 */}
        <div className="notice-history-card">
          <h3 className="card-subtitle">Sent History (발송 내역)</h3>
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sentNotices.map((notice) => (
                  <tr key={notice.id}>
                    <td><span className="target-badge">{notice.target}</span></td>
                    <td className="text-left">
                      <div className="history-title">{notice.title}</div>
                      <div className="history-content-preview">{notice.content}</div>
                    </td>
                    <td className="text-date">{notice.date}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDelete(notice.id)}>삭제</button>
                    </td>
                  </tr>
                ))}
                {sentNotices.length === 0 && (
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