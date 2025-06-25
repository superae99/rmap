import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { config } from './config/environment'

// 카카오맵 API 동적 로드 (서버에서 제공하는 안전한 스크립트 사용)
const loadKakaoMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao)
      return
    }

    // 서버에서 카카오맵 스크립트 로드를 위한 콜백 설정
    window.kakaoMapLoadCallback = () => {
      window.kakao.maps.load(() => {
        resolve(window.kakao)
      })
    }
    
    window.kakaoMapErrorCallback = () => {
      reject(new Error('카카오맵 API 로드 실패'))
    }

    // 서버에서 제공하는 카카오맵 스크립트 로드
    const script = document.createElement('script')
    script.src = `${config.apiBaseUrl}/kakao/script`
    script.onerror = () => reject(new Error('서버에서 카카오맵 스크립트를 가져올 수 없습니다'))
    document.head.appendChild(script)
  })
}

// 카카오맵 API 로드 후 React 앱 렌더링
loadKakaoMapScript()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  })
  .catch((error) => {
    console.error('카카오맵 API 로드 실패:', error)
    // API 로드 실패해도 앱은 렌더링
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  })