import React, { useState } from 'react';
import './Notice.css';

function Notice() {
  // 상태 관리
  const [role, setRole] = useState('ALL'); // ALL | DLV | PTN
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 공지 발송 핸들러
  const handleSubmit = (e) => {
    e.preventDefault(); // 페이지 새로고침 방지

    // 간단한 유효성 검사
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 전송할 데이터 객체 (API 요청용)
    const noticeData = {
      target_role: role, // 'ALL', 'DLV', 'PTN'
      title: title,
      content: content,
      created_at: new Date().toISOString(),
    };

    console.log('공지 전송 데이터:', noticeData);
    alert(`[${role}] 대상으로 공지가 발송되었습니다.`);

    // 폼 초기화
    setTitle('');
    setContent('');
    setRole('ALL');
  };

  return (
    <div className="notice-container">
      
      {/* 1. 페이지 타이틀 */}
      <div className="notice-title">Notice (공지 발송)</div>

      {/* 2. 공지 작성 폼 (Form Card) */}
      <div className="notice-form-card">
        <form onSubmit={handleSubmit}>
          
          {/* 수신 대상 선택 (Role) */}
          <div className="form-group">
            <label className="form-label">수신 대상 (Target Audience)</label>
            <div className="role-selector">
              {/* 전체 (ALL) */}
              <label className={`role-option ${role === 'ALL' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="ALL" 
                  checked={role === 'ALL'} 
                  onChange={(e) => setRole(e.target.value)} 
                />
                전체 (ALL)
              </label>

              {/* 기사님 (DLV) */}
              <label className={`role-option ${role === 'DLV' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="DLV" 
                  checked={role === 'DLV'} 
                  onChange={(e) => setRole(e.target.value)} 
                />
                기사님 (DLV)
              </label>

              {/* 제휴처 (PTN) */}
              <label className={`role-option ${role === 'PTN' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="PTN" 
                  checked={role === 'PTN'} 
                  onChange={(e) => setRole(e.target.value)} 
                />
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
              rows="10" 
              placeholder="전달할 내용을 상세히 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>

          {/* 전송 버튼 */}
          <div className="form-actions">
            <button type="submit" className="notice-btn-submit">
              공지사항 발송 (Send Notice)
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Notice;