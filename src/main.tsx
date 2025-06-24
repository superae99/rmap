import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { config } from './config/environment'

// 카카오맵 API 동적 로드
const loadKakaoMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao)
      return
    }

    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${config.kakaoApiKey}&libraries=services,clusterer,drawing&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve(window.kakao)
      })
    }
    script.onerror = () => reject(new Error('카카오맵 API 로드 실패'))
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