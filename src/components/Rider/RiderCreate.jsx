import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './Rider.css'; // 스크롤 CSS (.modal-body-scroll) 필요
import { riderCreateThunk } from '../../store/thunks/riderThunk.js';

function RiderCreate({ isOpen, onClose, onRefresh }) {
  const dispatch = useDispatch();

  const initialFormState = {
    userId: '', // 입력받음
    name: '',   // 기사 이름 (필요 시 추가)
    phone: '',
    bank: '',
    bankNum: '',
    address: '',
    // status 등은 백엔드 기본값 사용하거나 필요시 추가
  };

  const [formData, setFormData] = useState(initialFormState);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setFile(null);
      setPreviewUrl(null);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.address) {
      alert("User ID와 주소는 필수입니다.");
      return;
    }

    if (!window.confirm('새로운 기사를 등록하시겠습니까?')) return;

    try {
      const submitData = new FormData();

      // 1. JSON Data
      const riderData = { ...formData };
      const jsonBlob = new Blob([JSON.stringify(riderData)], { type: "application/json" });
      submitData.append("requestDto", jsonBlob);

      // 2. File Data
      if (file) {
        submitData.append("licenseImg", file);
      }

      await dispatch(riderCreateThunk(submitData)).unwrap();
      
      alert('등록되었습니다.');
      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert('등록 실패');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container scrollable-modal">
        <div className="modal-header">
          <h2>New Rider Registration</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body modal-body-scroll">
            
            {/* 면허증 이미지 */}
            <div className="form-row">
              <div className="form-group full">
                <label>면허증 사진 (License Image) <span className="required">*</span></label>
                <div className="image-upload-wrapper">
                  {previewUrl && <div className="img-preview"><img src={previewUrl} alt="Preview" /></div>}
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full">
                <label>User ID <span className="required">*</span></label>
                <input type="text" name="userId" value={formData.userId} onChange={handleChange} placeholder="User PK 입력" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>연락처 <span className="required">*</span></label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" />
              </div>
               <div className="form-group">
                <label>주소 <span className="required">*</span></label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="주소 입력" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>은행명 <span className="required">*</span></label>
                <input type="text" name="bank" value={formData.bank} onChange={handleChange} placeholder="예: 신한은행" />
              </div>
              <div className="form-group">
                <label>계좌번호 <span className="required">*</span></label>
                <input type="text" name="bankNum" value={formData.bankNum} onChange={handleChange} placeholder="계좌번호 입력" />
              </div>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-save">등록 하기</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RiderCreate;