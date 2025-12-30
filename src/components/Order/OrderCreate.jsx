import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Order.css'; // 기존 CSS 공유
import { orderCreateThunk } from '../../store/thunks/orderThunk.js';
import { partnerShowThunk } from '../../store/thunks/partnerThunk.js';
import { hotelShowThunk } from '../../store/thunks/hotelThunk.js';

function OrderCreate({ isOpen, onClose, onRefresh }) {
  const dispatch = useDispatch();

  // ★ Redux에서 파트너, 호텔 목록 가져오기
  const partnerShow = useSelector((state) => state.partnerShow.show); 
  const hotelShow = useSelector((state) => state.hotelShow.show);

  // 폼 초기값
  const initialFormState = {
    partnerId: '',
    hotelId: '',
    name: '',
    email: '',
    cntS: 0,
    cntM: 0,
    cntL: 0,
    price: 0
  };

  const [formData, setFormData] = useState(initialFormState);
  
  // 검색 드롭다운 상태 관리
  const [partnerSearch, setPartnerSearch] = useState('');
  const [hotelSearch, setHotelSearch] = useState('');
  const [showPartnerList, setShowPartnerList] = useState(false);
  const [showHotelList, setShowHotelList] = useState(false);

  // 외부 클릭 감지용 Ref
  const partnerRef = useRef(null);
  const hotelRef = useRef(null);

  // 모달 열릴 때 초기화 및 데이터 로딩
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setPartnerSearch('');
      setHotelSearch('');
      
      // 목록이 비어있다면 불러오기 (혹은 매번 불러오기)
      dispatch(partnerShowThunk());
      dispatch(hotelShowThunk());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dispatch]);

  // 가격 자동 계산 (짐 개수 변경 시)
  useEffect(() => {
    const total = (Number(formData.cntS) * 5000) + 
                  (Number(formData.cntM) * 8000) + 
                  (Number(formData.cntL) * 10000);
    setFormData(prev => ({ ...prev, price: total }));
  }, [formData.cntS, formData.cntM, formData.cntL]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (partnerRef.current && !partnerRef.current.contains(event.target)) {
        setShowPartnerList(false);
      }
      if (hotelRef.current && !hotelRef.current.contains(event.target)) {
        setShowHotelList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 파트너 선택 로직 ---
  const handlePartnerSelect = (item) => {
    setFormData(prev => ({ ...prev, partnerId: item.id }));
    setPartnerSearch(item.krName);
    setShowPartnerList(false);
  };

  // --- 호텔 선택 로직 ---
  const handleHotelSelect = (item) => {
    setFormData(prev => ({ ...prev, hotelId: item.id }));
    setHotelSearch(item.krName);
    setShowHotelList(false);
  };

  // --- 제출 ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.partnerId || !formData.hotelId || !formData.name) {
      alert('출발지(Partner), 도착지(Hotel), 고객명은 필수입니다.');
      return;
    }

    if (!window.confirm('새로운 예약을 등록하시겠습니까?')) return;

    try {
      // 숫자 변환 후 전송
      const payload = {
        ...formData,
        partnerId: Number(formData.partnerId),
        hotelId: Number(formData.hotelId),
        cntS: Number(formData.cntS),
        cntM: Number(formData.cntM),
        cntL: Number(formData.cntL),
        // price는 이미 계산되어 있음
      };

      await dispatch(orderCreateThunk(payload)).unwrap();
      
      alert('예약이 등록되었습니다.');
      onRefresh();
      onClose();

    } catch (error) {
      console.error('등록 실패:', error);
      alert('예약 등록 실패');
    }
  };

  // 필터링된 리스트
  const filteredPartners = partnerShow?.filter(p => p.krName.toLowerCase().includes(partnerSearch.toLowerCase())) || [];
  const filteredHotels = hotelShow?.filter(h => h.krName.toLowerCase().includes(hotelSearch.toLowerCase())) || [];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container scrollable-modal">
        <div className="modal-header">
          <h2>직접 주문 등록</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body modal-body-scroll">
            
            {/* 1. 출발지 (Partner) 검색 */}
            <div className="form-row">
              <div className="form-group full" ref={partnerRef}>
                <label>출발지 (Partner) <span className="required">*</span></label>
                <div className="search-dropdown-container">
                  <input 
                    type="text" 
                    placeholder="매장명 검색..." 
                    value={partnerSearch}
                    onChange={(e) => { setPartnerSearch(e.target.value); setShowPartnerList(true); }}
                    onFocus={() => setShowPartnerList(true)}
                    className="input-editable"
                  />
                  {showPartnerList && (
                    <ul className="dropdown-list">
                      {filteredPartners.map(p => (
                        <li key={p.id} onClick={() => handlePartnerSelect(p)}>
                          <span className="hotel-name">{p.krName}</span>
                          <span className="hotel-addr">{p.address}</span>
                        </li>
                      ))}
                      {filteredPartners.length === 0 && <li className="no-result">결과 없음</li>}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* 2. 도착지 (Hotel) 검색 */}
            <div className="form-row">
              <div className="form-group full" ref={hotelRef}>
                <label>도착지 (Hotel) <span className="required">*</span></label>
                <div className="search-dropdown-container">
                  <input 
                    type="text" 
                    placeholder="호텔명 검색..." 
                    value={hotelSearch}
                    onChange={(e) => { setHotelSearch(e.target.value); setShowHotelList(true); }}
                    onFocus={() => setShowHotelList(true)}
                    className="input-editable"
                  />
                  {showHotelList && (
                    <ul className="dropdown-list">
                      {filteredHotels.map(h => (
                        <li key={h.id} onClick={() => handleHotelSelect(h)}>
                          <span className="hotel-name">{h.krName}</span>
                          <span className="hotel-addr">{h.address}</span>
                        </li>
                      ))}
                      {filteredHotels.length === 0 && <li className="no-result">결과 없음</li>}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* 3. 고객 정보 */}
            <div className="form-row">
              <div className="form-group">
                <label>고객명 <span className="required">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="홍길동" required />
              </div>
              <div className="form-group">
                <label>이메일</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" />
              </div>
            </div>

            {/* 4. 짐 수량 (자동 가격 계산) */}
            <div className="form-row">
              <div className="form-group full">
                <label style={{display:'block', marginBottom:'8px'}}>짐 수량</label>
                <div className="luggage-grid">
                  <div className="luggage-item">
                    <span>Small</span>
                    <input type="number" name="cntS" value={formData.cntS} onChange={handleChange} min="0"/>
                  </div>
                  <div className="luggage-item">
                    <span>Medium</span>
                    <input type="number" name="cntM" value={formData.cntM} onChange={handleChange} min="0"/>
                  </div>
                  <div className="luggage-item">
                    <span>Large</span>
                    <input type="number" name="cntL" value={formData.cntL} onChange={handleChange} min="0"/>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. 예상 가격 (Read Only) */}
             <div className="form-row">
              <div className="form-group full">
                <label>예상 결제 금액 (Price)</label>
                <input 
                  type="text" 
                  value={`₩ ${formData.price.toLocaleString()}`} 
                  disabled 
                  className="input-disabled"
                  style={{ textAlign: 'right', fontWeight: 'bold' }}
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-save">예약 등록</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderCreate;