/**
 * 주문번호 생성 함수 (YYYYMMDD + 랜덤 5자리)
 * 예: 2026010509281
 */
export const generateOrderNo = () => {
  const now = new Date();
  
  // 1. 날짜 정보 추출 (YYYYMMDD)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(now.getDate()).padStart(2, '0');
  
  // 2. 랜덤 숫자 5자리 (00000 ~ 99999)
  // Math.random()은 0 이상 1 미만의 난수 생성
  // 100000을 곱해서 5자리 범위를 만듦
  const randomPart = String(Math.floor(Math.random() * 100000)).padStart(5, '0');

  // 3. 문자열 결합
  return `${year}${month}${day}${randomPart}`;
};