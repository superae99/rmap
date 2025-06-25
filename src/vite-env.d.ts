/// <reference types="vite/client" />

declare global {
  interface Window {
    kakao: any
    kakaoMapLoadCallback?: () => void
    kakaoMapErrorCallback?: () => void
  }
}