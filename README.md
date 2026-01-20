# 🌈 DGD Admin Page

**DGD Admin 바로가기 👉 [https://app3.green-meerkat.kro.kr/](https://app3.green-meerkat.kro.kr/)**

<br/>

## 📖 프로젝트 소개

**DGD Admin**은 'DGD' 배송 서비스의 효율적인 관리를 위한 어드민 대시보드 웹 애플리케이션입니다. React와 Vite를 기반으로 구축되었으며, 관리자는 이 페이지를 통해 서비스의 모든 데이터를 중앙에서 관리하고 모니터링할 수 있습니다.

<br/>

## ✨ 주요 기능

-   **📊 대시보드**: 일별, 주별, 월별 주문 및 매출 현황을 차트로 시각화하여 비즈니스 성과를 한눈에 파악할 수 있습니다.
-   **👤 회원 관리**: 서비스에 가입된 모든 회원의 정보를 조회, 수정 및 관리합니다.
-   **🏨 호텔 관리**: 서비스와 협력하는 호텔 정보를 등록하고 상세 내용을 관리합니다.
-   **📋 주문 관리**: 접수된 모든 주문 내역을 실시간으로 추적하고 상태를 변경하며, 신규 주문을 생성할 수 있습니다.
-   **🤝 파트너 관리**: 제휴맺은 파트너사의 정보를 관리하고, 정산요청을 보냅니다.
-   **🛵 라이더 관리**: 배송을 담당하는 라이더 정보를 등록하고 관리합니다.
-   **💰 정산 및 송장 관리**: 라이더와의 정산 내역과 송장 정보를 체계적으로 관리합니다.
-   **📢 공지사항 및 Q&A 관리**: 사용자에게 전달할 공지사항을 작성하고, 고객의 문의(Q&A)에 신속하게 응대합니다.

<br/>

## 🛠️ 기술 스택

### Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

<br/>

## 🔧 설치 및 실행

1.  **저장소 복제**
    ```shell
    git clone https://github.com/your-username/DGD_Admin.git
    cd DGD_Admin
    ```

2.  **의존성 설치**
    ```shell
    npm install
    ```

3.  **개발 서버 실행**
    ```shell
    npm run dev
    ```

<br/>

## 📁 디렉토리 구조

```
E:\wook\workspace\Team_RC\admin_RC\DGD_Admin
├───public/               # 정적 파일 (로고 등)
└───src/
    ├───api/              # API 요청 로직 (Axios 인스턴스, 유틸리티)
    ├───components/       # 기능별 컴포넌트 (대시보드, 회원, 주문 등)
    ├───routes/           # 라우팅 설정 (React Router)
    ├───store/            # 전역 상태 관리 (Redux Toolkit)
    │   ├───slices/       # Redux State 슬라이스
    │   └───thunks/       # 비동기 Thunk 액션
    ├───App.jsx           # 메인 애플리케이션 컴포넌트
    └───main.jsx          # 애플리케이션 진입점
```