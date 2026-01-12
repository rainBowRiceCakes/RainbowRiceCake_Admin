import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { sendInvoiceThunk } from '../../store/thunks/invoiceThunk.js';
import './Invoice.css';

function InvoiceSendModal({ isOpen, onClose, partnerId, partnerName }) {
  const dispatch = useDispatch();

  // 기본값 설정: "지난달" (보통 지난달 정산을 하므로 편의상 설정)
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  const [year, setYear] = useState(prevMonth.getFullYear());
  const [month, setMonth] = useState(prevMonth.getMonth() + 1);
  const [isSending, setIsSending] = useState(false);

  // 전송 핸들러
  const handleSend = async () => {
    if (!partnerId) {
      alert("파트너 정보가 없습니다.");
      return;
    }

    if (!window.confirm(`[${partnerName}]님께\n${year}년 ${month}월 정산 청구서를 발송하시겠습니까?`)) {
      return;
    }

    try {
      setIsSending(true);
      
      // Thunk 실행 (unwrap을 써서 결과를 바로 catch)
      await dispatch(sendInvoiceThunk({ partnerId, year, month })).unwrap();
      
      alert("✅ 성공적으로 메일이 발송되었습니다.");
      onClose(); // 성공하면 모달 닫기
    } catch (error) {
      console.error(error);
      // 에러 메시지 출력
      const errMsg = error.message || "서버 오류가 발생했습니다.";
      alert("❌ 발송 실패: " + errMsg);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-container">
        
        {/* 헤더 */}
        <div className="invoice-modal-header">
          <h2>📧 청구서 발송 (Invoice)</h2>
          <button className="btn-close-modal" onClick={onClose}>&times;</button>
        </div>

        {/* 본문 */}
        <div className="invoice-modal-body">
          <div className="invoice-desc">
            <strong>{partnerName}</strong> 님에게 이메일로 정산 내역을 전송합니다.<br/>
            발송할 정산 연도와 월을 선택해주세요.
          </div>
          
          <div className="invoice-form-row">
            <div className="invoice-form-group">
              <label>연도 (Year)</label>
              <input 
                type="number" 
                className="invoice-input"
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
            <div className="invoice-form-group">
              <label>월 (Month)</label>
              <select 
                className="invoice-select"
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="invoice-modal-footer">
          <button className="btn-invoice-cancel" onClick={onClose} disabled={isSending}>
            취소
          </button>
          <button className="btn-invoice-send" onClick={handleSend} disabled={isSending}>
            {isSending ? '발송 중...' : '이메일 발송'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default InvoiceSendModal;