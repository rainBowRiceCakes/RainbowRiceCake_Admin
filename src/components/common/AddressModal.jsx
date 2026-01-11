import DaumPostcodeEmbed from 'react-daum-postcode';
import './AddressModal.css';

const AddressModal = ({ isOpen, onClose, onComplete }) => {
  if (!isOpen) {
    return null;
  }

  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    // 부모에게 전달할 데이터 객체
    const result = {
      postcode: data.zonecode,
      address: fullAddress,
    };
    
    onComplete(result);
  };

  return (
    <div className="address-modal-background">
      <div className="address-modal-content">
        <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: '100%' }} />
        <button className="btn-close-modal" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default AddressModal;
