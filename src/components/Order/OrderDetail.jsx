import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './Order.css'; 
import { orderDetailThunk, orderUpdateThunk } from '../../store/thunks/orderThunk.js';

function OrderDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 상세 데이터 조회
  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const result = await dispatch(orderDetailThunk(id)).unwrap();
        setEditData(result.data);
      } catch (error) {
        alert("주문 정보를 불러올 수 없습니다.");
        navigate('/admin/order');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [dispatch, id, navigate]);

  // 2. 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // 3. 상태 변경 핸들러
  const handleStatusChange = (e) => {
    setEditData(prev => ({ ...prev, status: e.target.value }));
  };

  // 4. 수정 완료 핸들러
  const handleUpdate = async () => {
    if (!window.confirm(`주문(ID:${editData.id}) 정보를 수정하시겠습니까?`)) return;

    try {
      const payload = {
        id: editData.id,
        status: editData.status,
        price: Number(editData.cntS * 5000 + editData.cntM * 8000 + editData.cntL * 10000),
        cntS: Number(editData.cntS || 0),
        cntM: Number(editData.cntM || 0),
        cntL: Number(editData.cntL || 0),
      };

      await dispatch(orderUpdateThunk(payload)).unwrap();
      
      alert('수정이 완료되었습니다.');
      navigate('/admin/order');

    } catch (e) {
      console.error(e);
      alert("수정 실패: " + (e.message || "오류가 발생했습니다."));
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!editData) return <div>데이터가 없습니다.</div>;

  return (
    <div className="order-container relative-container"> 
      {/* ★ [수정] 통일된 스타일의 목록으로 돌아가기 버튼 (.btn-back-page 사용) */}
      <button className="btn-back-page" onClick={() => navigate('/admin/order')}>
        ← 목록으로
      </button>

      <div className="order-detail-header">
        <h2>예약 상세 정보 (Order Detail)</h2>
      </div>

      <div className="order-detail-card">
        
        {/* --- 섹션 1: 기본 정보 (Read Only) --- */}
        <h3 className="section-title">기본 정보</h3>
        <div className="detail-grid">
          
          <div className="form-group">
            <label>Order ID</label>
            <input type="text" value={editData.id} disabled className="input-disabled" />
          </div>
          
          <div className="form-group">
            <label>주문 일시</label>
            <input type="text" value={editData.createdAt} disabled className="input-disabled" />
          </div>

          <div className="form-group">
             <label>출발지 (Partner)</label>
             <input type="text" value={`${editData.order_partner?.krName} (${editData.order_partner?.address})`} disabled className="input-disabled" />
          </div>

          <div className="form-group">
             <label>도착지 (Hotel)</label>
             <input type="text" value={`${editData.order_hotel?.krName} (${editData.order_hotel?.address})`} disabled className="input-disabled" />
          </div>
          
          <div className="form-group full-width">
             <label>담당 기사 (Rider)</label>
             <input 
               type="text" 
               value={editData.order_rider?.rider_user?.name ? `${editData.order_rider.rider_user.name} (ID: ${editData.order_rider.id})` : '미배정'} 
               disabled 
               className="input-disabled" 
             />
          </div>
        </div>

        {/* --- 섹션 2: 수정 가능 정보 --- */}
        <h3 className="section-title mt-40">주문 관리</h3>
        <div className="detail-grid">
          
          {/* 상태 변경 */}
          <div className="form-group">
            <label>진행 상태 (Status)</label>
            <select 
              name="status" 
              value={editData.status} 
              onChange={handleStatusChange}
              className="select-editable"
            >
              <option value="waiting">대기 중 (waiting)</option>
              <option value="match">배차 완료 (match)</option>
              <option value="pickup">픽업 완료 (pickup)</option>
              <option value="complete">배송 완료 (complete)</option>
              <option value="cancel">취소 (cancel)</option>
            </select>
          </div>

          {/* 가격 수정 (자동계산 보여주기 + 수정 가능하게 변경 시 value 수정 필요) */}
          <div className="form-group">
            <label>결제 금액 (Price)</label>
            <input 
              type="number" 
              name="price" 
              value={editData.cntS * 5000 + editData.cntM * 8000 + editData.cntL * 10000} 
              className="input-editable" 
              disabled
            />
          </div>

          {/* ★ [수정] 짐 수량 (반응형 그리드 적용) */}
          <div className="form-group full-width">
            <label className="mb-10">짐 수량 (Luggage Count)</label>
            <div className="luggage-grid">
              <div className="luggage-item">
                <span>Small (cntS)</span>
                <input type="number" name="cntS" value={editData.cntS || 0} onChange={handleInputChange} className="input-editable" />
              </div>
              <div className="luggage-item">
                <span>Medium (cntM)</span>
                <input type="number" name="cntM" value={editData.cntM || 0} onChange={handleInputChange} className="input-editable" />
              </div>
              <div className="luggage-item">
                <span>Large (cntL)</span>
                <input type="number" name="cntL" value={editData.cntL || 0} onChange={handleInputChange} className="input-editable" />
              </div>
            </div>
          </div>

        </div>

        {/* 버튼 영역 */}
        <div className="detail-actions">
          <button className="btn-cancel" onClick={() => navigate('/admin/order')}>취소</button>
          <button className="btn-save" onClick={handleUpdate}>수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;