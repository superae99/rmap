import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { config } from './config/environment'
import './styles/global.css'

// 카카오맵 API 동적 로드 (서버에서 제공하는 안전한 스크립트 사용)
const loadKakaoMapScript = async () => {
  return new Promise(async (resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao)
      return
    }

    try {
      // 서버에서 카카오맵 스크립트 URL 가져오기
      const response = await fetch(`${config.apiBaseUrl}/kakao/script`)
      if (!response.ok) {
        throw new Error('서버에서 카카오맵 스크립트 정보를 가져올 수 없습니다')
      }
      
      const { scriptUrl } = await response.json()

      // 카카오맵 스크립트 로드
      const script = document.createElement('script')
      script.src = scriptUrl
      script.async = true
      script.onload = () => {
        console.log('Kakao script loaded successfully')
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            console.log('Kakao maps initialized successfully')
            resolve(window.kakao)
          })
        } else {
          reject(new Error('카카오 객체를 찾을 수 없습니다'))
        }
      }
      script.onerror = (error) => {
        console.error('Script loading error:', error)
        reject(new Error('카카오맵 API 로드 실패'))
      }
      document.head.appendChild(script)
    } catch (error) {
      reject(error)
    }
  })
}

// 카카오맵 API 로드 후 React 앱 렌더링
loadKakaoMapScript()
  .then(() => {
    console.log('✅ 카카오맵 API 로드 성공, React 앱 렌더링 시작')
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  })
  .catch((error) => {
    console.error('카카오맵 API 로드 실패:', error)
    console.log('⚠️ 카카오맵 API 실패했지만 React 앱 렌더링 시작')
    // API 로드 실패해도 앱은 렌더링
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  })