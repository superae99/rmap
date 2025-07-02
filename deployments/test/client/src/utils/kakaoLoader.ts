// 카카오맵 API 로더 (main.tsx에서 로드된 스크립트 확인)
export const loadKakaoMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 카카오맵이 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
      resolve()
      return
    }
    
    // 카카오맵 로딩 대기
    const checkKakaoMap = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
        resolve()
        return
      }
      
      // 계속 대기
      setTimeout(checkKakaoMap, 100)
    }
    
    // 초기 확인
    checkKakaoMap()
    
    // 최대 10초 후 타임아웃
    setTimeout(() => {
      if (!window.kakao || !window.kakao.maps) {
        reject(new Error('카카오맵 로드 타임아웃'))
      }
    }, 10000)
  })
}

// 전역 타입 선언
declare global {
  interface Window {
    kakao: any
  }
}