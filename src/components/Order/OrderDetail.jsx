import { useState, useEffect, useRef } from 'react'; // useRef 추가
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Order.css'; 
import { orderDeleteThunk, orderDetailThunk, orderUpdateThunk } from '../../store/thunks/orderThunk.js';
import { hotelShowThunk } from '../../store/thunks/hotelThunk.js';

function OrderDetail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orderCode } = useParams();

  // Redux Data
  const { show } = useSelector((state) => state.hotelShow);

  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ★ [추가] 호텔 검색을 위한 상태들
  const [searchTerm, setSearchTerm] = useState(''); // 검색어
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 표시 여부
  const dropdownRef = useRef(null); // 외부 클릭 감지용

  // 1. 초기 데이터 로딩
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const orderResult = await dispatch(orderDetailThunk(orderCode)).unwrap();
        const data = orderResult.data;
        
        setEditData({
          ...data,
          hotelId: data.order_hotel?.id 
        });

        // ★ 초기 검색어 설정 (현재 설정된 호텔 이름으로)
        if (data.order_hotel?.krName) {
          setSearchTerm(data.order_hotel.krName);
        }

        dispatch(hotelShowThunk());
      } catch (error) {
        alert("정보를 불러올 수 없습니다.");
        navigate('/admin/order');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dispatch, orderCode, navigate]);

  // ★ [추가] 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // 일반 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // 상태 변경 핸들러
  const handleStatusChange = (e) => {
    setEditData(prev => ({ ...prev, status: e.target.value }));
  };

  // ★ [추가] 호텔 검색어 입력 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true); // 타이핑 시작하면 목록 열기
    
    // 사용자가 타이핑 중일 때는 ID를 잠시 비워두거나, 기존 유지 (선택은 클릭으로만 확정)
  };

  // ★ [추가] 호텔 선택 핸들러
  const handleSelectHotel = (hotel) => {
    setEditData(prev => ({ ...prev, hotelId: hotel.id })); // ID 저장
    setSearchTerm(hotel.krName); // 화면엔 이름 표시
    setIsDropdownOpen(false);    // 목록 닫기
  };

  const handleUpdate = async () => {
    if (!window.confirm(`주문번호:${editData.orderCode} 정보를 수정하시겠습니까?`)) return;
    
    // 유효성 검사: 호텔이 선택되지 않았을 경우
    if (!editData.hotelId) {
        alert("도착지 호텔을 목록에서 선택해주세요.");
        return;
    }

    try {
      const calculatedPrice = Number(editData.cntS || 0) * 5000 
                            + Number(editData.cntM || 0) * 8000 
                            + Number(editData.cntL || 0) * 10000;

      const payload = {
        orderCode: editData.orderCode,
        status: editData.status,
        name: editData.name,
        email: editData.email,
        price: calculatedPrice,
        cntS: Number(editData.cntS || 0),
        cntM: Number(editData.cntM || 0),
        cntL: Number(editData.cntL || 0),
        hotelId: Number(editData.hotelId),
      };

      await dispatch(orderUpdateThunk(payload)).unwrap();
      alert('수정이 완료되었습니다.');
      navigate('/admin/order');
    } catch (e) {
      console.error(e);
      alert("수정 실패");
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!editData) return <div>데이터가 없습니다.</div>;

    // 삭제 핸들러
    const handleDelete = async () => {
      if (!window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
      
      try {
        await dispatch(orderDeleteThunk(orderCode)).unwrap();
        alert('삭제되었습니다.');
        navigate('/admin/order');
      } catch (error) {
        console.error(error);
        alert('삭제 실패: ' + (error?.message || '알 수 없는 오류'));
      }
    };

  // ★ 호텔 필터링 로직
  const filteredHotels = show ? show.filter(hotel => 
    hotel.krName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="order-container relative-container"> 
      <div className="order-detail-header">
        <h2>예약 상세 정보 (Order Detail)</h2>
        <button className="btn-back-page" onClick={() => navigate('/admin/order')}>
          &lt; 목록으로 돌아가기
        </button>
      </div>

      <div className="order-detail-card">
        
        <h3 className="section-title">기본 정보 (Read Only)</h3>
        <div className="detail-grid">
           <div className="form-group"><label>Order Code</label><input type="text" value={editData.orderCode} disabled className="input-disabled"/></div>
           <div className="form-group"><label>주문 일시</label><input type="text" value={editData.createdAt} disabled className="input-disabled"/></div>
           <div className="form-group"><label>출발지</label><input type="text" value={editData.order_partner?.krName} disabled className="input-disabled"/></div>
           <div className="form-group"><label>Price</label><input type="text" value={editData.cntS * 5000 + editData.cntM * 8000 + editData.cntL * 10000} disabled className="input-disabled"/></div>
           <div className="form-group full-width"><label>기사</label><input type="text" value={editData.order_rider?.rider_user?.name || '미배정'} disabled className="input-disabled"/></div>
        </div>


         <h3 className="section-title mt-40">고객 정보</h3>
         <div className="detail-grid">
             <div className="form-group"><label>이름</label><input type="text" name="name" value={editData.name || ''} onChange={handleInputChange} className="input-editable"/></div>
             <div className="form-group"><label>이메일</label><input type="text" name="email" value={editData.email || ''} onChange={handleInputChange} className="input-editable"/></div>
         </div>


        <h3 className="section-title mt-40">주문 상태 및 물품 관리</h3>
        <div className="detail-grid">
          
          {/* ★ [핵심 수정] 검색 가능한 호텔 선택창 */}
          <div className="form-group search-dropdown-container" ref={dropdownRef}>
            <label>도착지 Hotel 검색 (변경 가능)</label>
            
            {/* 1. 검색 입력창 */}
            <input 
              type="text" 
              placeholder="호텔명 또는 주소 검색..." 
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setIsDropdownOpen(true)} // 클릭 시 목록 열기
              className="input-editable"
            />
            
            {/* 2. 자동완성 목록 (조건부 렌더링) */}
            {isDropdownOpen && (
              <ul className="dropdown-list">
                {filteredHotels.length > 0 ? (
                  filteredHotels.map(hotel => (
                    <li key={hotel.id} onClick={() => handleSelectHotel(hotel)}>
                      <span className="hotel-name">{hotel.krName}</span>
                      <span className="hotel-addr">{hotel.address}</span>
                    </li>
                  ))
                ) : (
                  <li className="no-result">검색 결과가 없습니다.</li>
                )}
              </ul>
            )}
            
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              선택된 ID: {editData.hotelId || '없음'}
            </div>
          </div>

          <div className="form-group">
            <label>주문 상태 (Status)</label>
            <select name="status" value={editData.status} onChange={handleStatusChange} className="select-editable">
              <option value="req">요청됨 (req)</option>
              <option value="mat">기사 배정 (mat)</option>
              <option value="pick">픽업 완료 (pick)</option>
              <option value="com">배송 완료 (com)</option>
            </select>
          </div>

          {/* 짐 수량 (Luggage Count) */}
          <div className="form-group full-width">
            <label className="mb-10">짐 수량 (Luggage Count)</label>
            <div className="luggage-grid">
              <div className="luggage-item"><span>Small</span><input type="number" name="cntS" value={editData.cntS || 0} onChange={handleInputChange} className="input-editable" /></div>
              <div className="luggage-item"><span>Medium</span><input type="number" name="cntM" value={editData.cntM || 0} onChange={handleInputChange} className="input-editable" /></div>
              <div className="luggage-item"><span>Large</span><input type="number" name="cntL" value={editData.cntL || 0} onChange={handleInputChange} className="input-editable" /></div>
            </div>
          </div>

        </div>

        <div className="detail-actions">
          <button className="adm-btn delete" onClick={handleDelete}>삭제 (Delete)</button>
          <button className="btn-save" onClick={handleUpdate}>수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;