import { useState } from 'react';
import './QnA.css';

// 요청하신 8개 컬럼에 맞춘 더미 데이터
const mockQnA = [
  { 
    id: 1, 
    title: '배송 기사님이 연락이 안 됩니다', 
    content: '예약 시간 30분 지났는데 연락 두절입니다. 확인해주세요.', 
    qna_img: 'https://via.placeholder.com/300x200?text=No+Contact', // 이미지 있음
    status: false, // false: 답변 대기
    res: null, 
    user_id: 'user_123', 
    email: null 
  },
  { 
    id: 2, 
    title: '비회원인데 영수증 발급 가능한가요?', 
    content: '이메일로 영수증 보내주실 수 있는지 문의드립니다.', 
    qna_img: null, // 이미지 없음
    status: true, // true: 답변 완료
    res: '네, 입력하신 이메일로 전자영수증 발송해드렸습니다.', 
    user_id: null, 
    email: 'guest@example.com' 
  },
  { 
    id: 3, 
    title: '결제 취소 요청', 
    content: '잘못 예약했습니다. 취소 부탁드려요.', 
    qna_img: null,
    status: false, 
    res: null, 
    user_id: 'rider_kim', 
    email: null 
  },
  { 
    id: 4, 
    title: '짐 사이즈 기준 문의', 
    content: '28인치 캐리어는 L사이즈인가요?', 
    qna_img: 'https://via.placeholder.com/150',
    status: true, 
    res: '네, 28인치 이상은 L사이즈로 선택해주시면 됩니다.', 
    user_id: null, 
    email: 'traveler@test.com' 
  },
];

function QnA() {
  const [view, setView] = useState('list'); // 'list' | 'detail'
  const [selectedItem, setSelectedItem] = useState(null); // 선택된 항목
  const [filter, setFilter] = useState('all'); // 'all' | 'waiting'
  const [responseText, setResponseText] = useState(''); // 어드민 답변 입력값

  // --- [로직] 필터링 ---
  const filteredList = mockQnA.filter(item => {
    if (filter === 'waiting') return item.status === false; // 답변 대기만
    return true; // 전체
  });

  // --- [로직] 상세페이지 이동 ---
  const handleRowClick = (item) => {
    setSelectedItem(item);
    setResponseText(item.res || ''); // 기존 답변이 있으면 불러오기
    setView('detail');
  };

  // --- [로직] 답변 등록 ---
  const handleSubmitAnswer = () => {
    if (!responseText.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    // TODO: 백엔드 API 연동 (PATCH)
    // const payload = {
    //   id: selectedItem.id,
    //   res: responseText,
    //   status: true
    // };

    alert(`[ID: ${selectedItem.id}] 문의에 대한 답변이 등록되었습니다.`);
    console.log('Update DB:', { id: selectedItem.id, res: responseText, status: true });
    
    // 목록으로 복귀
    setSelectedItem(null);
    setResponseText('');
    setView('list');
  };

  // --- [렌더링] 작성자 표시 헬퍼 (User ID 우선, 없으면 Email) ---
  const renderWriter = (item) => {
    if (item.user_id) return <span className="writer-tag user">회원: {item.user_id}</span>;
    if (item.email) return <span className="writer-tag guest">비회원: {item.email}</span>;
    return <span className="writer-tag unknown">알 수 없음</span>;
  };

  // ==========================================
  // VIEW: 상세 페이지 (Detail)
  // ==========================================
  if (view === 'detail' && selectedItem) {
    return (
      <div className="qna-container">
        <div className="qna-detail-header">
          <button className="btn-back" onClick={() => setView('list')}>← 목록으로 돌아가기</button>
          <div className="detail-status">
            {selectedItem.status ? (
              <span className="status-badge complete">답변 완료</span>
            ) : (
              <span className="status-badge waiting">답변 대기</span>
            )}
          </div>
        </div>

        <div className="qna-detail-card">
          {/* 질문 내용 */}
          <div className="question-section">
            <h2 className="q-title">{selectedItem.title}</h2>
            <div className="q-meta-info">
              {renderWriter(selectedItem)}
            </div>
            
            <div className="q-content-box">
              <p>{selectedItem.content}</p>
              
              {/* 이미지가 있을 경우에만 렌더링 */}
              {selectedItem.qna_img && (
                <div className="q-img-wrapper">
                  <img src={selectedItem.qna_img} alt="첨부 이미지" />
                </div>
              )}
            </div>
          </div>

          <hr className="divider" />

          {/* 답변 입력 영역 */}
          <div className="answer-section">
            <h3>Admin Response</h3>
            <textarea 
              className="answer-input"
              rows="6"
              placeholder="문의에 대한 답변을 입력하세요..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              // 이미 답변된 건이라도 수정 가능하게 하려면 disabled 제거
              // disabled={selectedItem.status === true} 
            />
            <div className="answer-actions">
              <button className="btn-black" onClick={handleSubmitAnswer}>
                {selectedItem.status ? '답변 수정' : '답변 등록 (완료 처리)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: 목록 페이지 (List)
  // ==========================================
  return (
    <div className="qna-container">
      <div className="qna-title">QnA Management (문의 관리)</div>
      
      {/* 헤더 (토글 필터) */}
      <div className="qna-head">
        <div className="qna-toggle-group">
          <button 
            className={`toggle-btn ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => setFilter('all')}
          >
            전체 문의
          </button>
          <button 
            className={`toggle-btn ${filter === 'waiting' ? 'active' : ''}`} 
            onClick={() => setFilter('waiting')}
          >
            답변 대기
          </button>
        </div>
        
        {/* 간단한 검색창 (UI만 존재) */}
        <div className="qna-search-box">
          <span>🔍</span>
          <input type="text" placeholder="제목, 작성자 검색" />
        </div>
      </div>

      {/* 테이블 */}
      <div className="qna-table-wrapper">
        <table className="qna-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Title</th>
              <th>Writer (ID / Email)</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)} className="clickable-row">
                <td className="fw-bold">{item.id}</td>
                <td>
                  {item.status ? (
                    <span className="status-dot complete" title="답변완료"></span> 
                  ) : (
                    <span className="status-dot waiting" title="대기중"></span>
                  )}
                  {item.status ? '답변 완료' : '답변 대기'}
                </td>
                <td className="text-left fw-bold">{item.title}</td>
                <td>
                  {/* user_id가 있으면 ID출력, 없으면 Email 출력 */}
                  {item.user_id ? item.user_id : <span className="text-email">{item.email}</span>}
                </td>
                <td>
                  {item.qna_img ? <span className="img-icon">📷</span> : <span className="text-gray">-</span>}
                </td>
              </tr>
            ))}
            {filteredList.length === 0 && (
              <tr><td colSpan="5" className="no-data">문의 내역이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QnA;