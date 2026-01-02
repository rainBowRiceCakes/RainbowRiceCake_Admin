// utils/kakaoMap.js

export function searchAddressToCoords(address) {
  // Promise를 리턴해야 await를 쓸 수 있습니다.
  return new Promise((resolve, reject) => {
    
    // 1. 유효성 검사
    if (!address) {
      reject(new Error("주소가 비어있습니다."));
      return;
    }
    
    // 2. 카카오 로드 확인
    if (!window.kakao?.maps?.services) {
      reject(new Error("Kakao Maps Service not loaded"));
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    // 3. API 호출
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result?.[0]) {
        // 성공 시 resolve 호출 -> await의 결과값이 됨
        resolve({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        });
      } else {
        // 실패 시 reject 호출 -> try-catch의 catch로 빠짐
        reject(new Error("주소 변환에 실패했습니다."));
      }
    });
  });
}