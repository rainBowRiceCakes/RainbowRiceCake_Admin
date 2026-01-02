import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './QnA.css';
import { qnaShowThunk } from '../../store/thunks/qnaThunk';

function QnA() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State 구독 (store 이름은 qnaShow로 가정)
  // 응답 데이터 구조가 { data: [...] } 인지 바로 배열 [...] 인지 확인 필요.
  // 여기서는 thunk 리턴이 response.data (전체 객체) 라고 가정하고, 실제 목록은 .data 프로퍼티에 있다고 봅니다.
  const { show, loading } = useSelector((state) => state.qnaShow); 

  const [filter, setFilter] = useState('all'); // 'all' | 'waiting'

  // 1. 초기 데이터 로드
  useEffect(() => {
    dispatch(qnaShowThunk());
  }, [dispatch]);

  // 2. 필터링 로직
  // show가 배열인지 확인 후 필터 적용
  const listData = Array.isArray(show) ? show : (show?.data || []);
  
  const filteredList = listData.filter(item => {
    if (filter === 'waiting') return item.status === false; // 답변 대기만
    return true; // 전체
  });

  // 상세 페이지 이동
  const handleDetailClick = (id) => {
    navigate(`/admin/qna/${id}`);
  };

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
        
        {/* 검색창 (UI만 유지, 기능 구현 시 필터 로직 추가 필요) */}
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
              <th>답변상태</th>
              <th>제목</th>
              <th>유저명</th>
              <th>Image 여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="6" style={{textAlign:'center', padding:'40px'}}>로딩 중...</td></tr>
            ) : filteredList.length > 0 ? (
              filteredList.map(item => (
                <tr key={item.id} className="clickable-row">
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
                    {item.question_user.name ? item.question_user.name : <span className="text-gray">비회원</span>}
                  </td>
                  <td>
                    {/* qnaImg가 null이 아니고 빈 문자열도 아닐 때 아이콘 표시 */}
                    {item.qnaImg ? <span className="img-icon">📷</span> : <span className="text-gray">-</span>}
                  </td>
                  <td>
                    <button 
                      className="btn-black" 
                      style={{padding: '6px 12px', fontSize:'12px'}}
                      onClick={(e) => { e.stopPropagation(); handleDetailClick(item.id); }}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="no-data">문의 내역이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QnA;