import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // 개발 서버 Proxy 정의
  server: {
    proxy: {
      // 경로가 `/api`로 시작하는 요청을 대상으로 proxy 설정
      '/api': {
        target: `http://localhost:3000`, // Request 대상 서버 주소 TODO: env설정 후 수정 할 것
        changeOrigin: true, // Request Header Host 필드 값을 대상 서버 호스트로 변경
        secure: false, // SSL 인증서 검증 무시
        ws: true // WebSoket 프로토콜 사용
      },
      // 경로가 `/storage`로 시작하는 요청을 대상으로 proxy 설정
      '/storage': {
        target: `http://localhost:3000`, // Request 대상 서버 주소 TODO: env설정 후 수정 할 것
        changeOrigin: true, // Request Header Host 필드 값을 대상 서버 호스트로 변경
        secure: false, // SSL 인증서 검증 무시
        ws: true // WebSoket 프로토콜 사용
      }
    }
  }
})