import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './QnA.css'; 
import { qnaDeleteThunk, qnaDetailThunk, qnaUpdateThunk } from '../../store/thunks/qnaThunk';

function QnADetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ★ Slice 구독 대신 로컬 State 사용
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 답변 입력 상태
  const [responseText, setResponseText] = useState('');

  // 1. 초기 데이터 로드 (unwrap 사용)
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // ★ dispatch 후 결과값을 변수에 바로 할당 (Slice 거치지 않음)
        const result = await dispatch(qnaDetailThunk(id)).unwrap();
        // 데이터 세팅
        console.log(result)
        setDetailData(result);
        
        // 기존 답변이 있다면 입력창에 채워넣기
        if (result.res) {
          setResponseText(result.res);
        }
      } catch (error) {
        console.error("상세 정보 로드 실패:", error);
        alert("데이터를 불러올 수 없습니다.");
        navigate('/admin/qna');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [dispatch, id, navigate]);

  // 2. 답변 등록/수정 핸들러
  const handleSubmitAnswer = async () => {
    if (!responseText.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    if (!window.confirm('답변을 등록(수정)하시겠습니까?')) return;

    // 업데이트할 데이터 구성
    const updatePayload = {
      id: detailData.id,
      res: responseText,
      status: true, // 답변이 등록되면 완료 상태로 변경
    };
    try {
      // ★ 수정 요청도 unwrap으로 결과 확인
      await dispatch(qnaUpdateThunk(updatePayload)).unwrap();
      
      alert('답변이 성공적으로 등록되었습니다.');
      navigate('/admin/qna'); // 목록으로 이동
    } catch (error) {
      console.error('Update failed:', error);
      alert('답변 등록에 실패했습니다: ' + (error.message || '오류 발생'));
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    try {
      await dispatch(qnaDeleteThunk(id)).unwrap();
      alert('삭제되었습니다.');
      navigate('/admin/qna');
    } catch (error) {
      console.error(error);
      alert('삭제 실패: ' + (error?.message || '알 수 없는 오류'));
    }
  };

  if (loading) return <div className="qna-detail-wrapper"><div style={{padding:'40px', textAlign:'center'}}>Loading...</div></div>;
  if (!detailData) return null;

  return (
    <div className="qna-detail-wrapper">
      <button className="btn-back-page" onClick={() => navigate('/admin/qna')}>
        &lt; 목록으로 돌아가기
      </button>

      <div className="qna-detail-card">
        {/* 상단 상태 뱃지 */}
        <div className="detail-status">
          {detailData.status ? (
            <span className="status-badge complete">답변 완료</span>
          ) : (
            <span className="status-badge waiting">답변 대기</span>
          )}
        </div>

        {/* 질문 내용 섹션 */}
        <div className="question-section">
          <h2 className="q-title">{detailData.title}</h2>
          
          <div className="q-meta-info">
            {/* 작성자 정보 */}
            <span className={`writer-tag ${detailData.userId ? 'user' : 'guest'}`}>
              작성자: {detailData.userId || '비회원'}
            </span>
            
            {/* 작성일 */}
            <span style={{marginLeft: '10px'}}>
              작성일: {detailData.createdAt ? new Date(detailData.createdAt).toLocaleString() : '-'}
            </span>

            {/* ID (PK) */}
            <span style={{marginLeft: '10px', color: '#aaa'}}>
              (No. {detailData.id})
            </span>
            
            {/* updatedAt, deletedAt은 요구사항에 따라 제외됨 */}
          </div>
          
          <div className="q-content-box">
            {/* 이미지 렌더링 (경로 존재 시) */}
            {detailData.qnaImg && (
              <div className="q-img-wrapper">
                {/* 서버에서 저장된 경로(path)를 src에 바인딩 */}
                {/* 필요시 앞에 도메인(http://localhost:8080 등) 추가 로직 필요 */}
                <img 
                  src={detailData.qnaImg} 
                  alt="첨부 이미지" 
                  style={{maxWidth: '100%', borderRadius: '8px'}}
                />
              </div>
            )}
            
            {/* 질문 내용 */}
            <p style={{whiteSpace: 'pre-wrap', marginTop: '10px'}}>{detailData.content}</p>
          </div>
        </div>

        <hr className="divider" />

        {/* 답변 입력 섹션 */}
        <div className="answer-section">
          <h3>Admin Response</h3>
          <textarea 
            className="answer-input"
            rows="6"
            placeholder="문의에 대한 답변을 입력해주세요..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
          />
          <div className="answer-actions">
            <button className="adm-btn delete" onClick={handleDelete}>삭제 (Delete)</button>
            <button className="btn-black" onClick={handleSubmitAnswer}>
              {detailData.status ? '답변 수정' : '답변 등록 (완료 처리)'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default QnADetail;