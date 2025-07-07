import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { config } from './config/environment'
import './styles/global.css'

// 카카오맵 API 로드 (document.write 이슈 방지를 위한 동기적 로딩)
const loadKakaoMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.kakao && window.kakao.maps) {
      resolve()
      return
    }

    // 카카오맵 스크립트를 동기적으로 로드
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=dba0d31ab76b6914810ca4df710daf80&autoload=false&libraries=services'
    
    script.onload = () => {
      // 카카오 객체 확인 후 지도 라이브러리 로드
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          resolve()
        })
      } else {
        reject(new Error('카카오 객체를 찾을 수 없습니다'))
      }
    }
    
    script.onerror = () => {
      reject(new Error('카카오맵 스크립트 로드 실패'))
    }
    
    // head에 스크립트 추가
    document.head.appendChild(script)
  })
}

// 앱 초기화
const initializeApp = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

// 카카오맵 로드 후 앱 시작
loadKakaoMapScript()
  .then(() => {
    initializeApp()
  })
  .catch((error) => {
    console.warn('카카오맵 로드 실패, 앱을 시작합니다:', error)
    initializeApp()
  })