export interface ProcessedArea {
  id: string
  name: string
  admCd: string
  coordinates: number[][]
  properties: any
  isActive: boolean
  description?: string
  salesTerritory?: {
    territoryId: number
    branchName: string
    officeName: string
    managerName: string
    managerEmployeeId: string
    sido: string
    gungu: string
    admNm: string
  } | null
}

// 데이터베이스에서 영역 데이터 로드 (로그인 사용자만 필터 적용)
export const loadAreasData = async (filters?: any, token?: string): Promise<ProcessedArea[]> => {
  try {
    console.log('🗃️ 데이터베이스에서 영역 데이터 로딩 중...')
    
    // 필터 매개변수를 URL에 추가 (토큰이 있을 때만)
    const queryParams = new URLSearchParams()
    if (filters && token) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value as string)
        }
      })
    }
    
    // 메모리 문제 해결을 위해 기본 areas 엔드포인트 사용 (페이징 제거됨)
    const url = `/api/areas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    console.log('🔍 API 호출:', url)
    
    // 헤더에 인증 토큰 추가 (있는 경우)
    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const responseData = await response.json()
    
    // 페이징된 응답 처리
    const areasData = responseData.areas || responseData
    console.log(`✅ ${areasData.length}개 영역 로드 완료 (전체: ${responseData.total || areasData.length}개)`)
    
    // 디버깅: 서버에서 받은 원본 데이터 확인
    if (areasData.length > 0) {
      console.log('🔍 서버에서 받은 첫 번째 영역 원본 데이터:', areasData[0])
      console.log('🔍 isActive 값:', areasData[0].isActive)
      console.log('🔍 salesTerritory 값:', areasData[0].salesTerritory)
    }
    
    // 카카오맵에 사용할 형태로 변환
    const processedAreas: ProcessedArea[] = areasData
      .filter((area: any) => area.coordinates)
      .map((area: any) => {
        // 좌표 데이터 파싱 (Area 모델의 {lat, lng} 형식 처리)
        let coordinates: number[][] = []
        try {
          const coordsData = typeof area.coordinates === 'string' 
            ? JSON.parse(area.coordinates) 
            : area.coordinates
            
          // {lat, lng} 형식을 [lng, lat] 배열로 변환 (KakaoMap 형식)
          if (Array.isArray(coordsData) && coordsData.length > 0) {
            if (typeof coordsData[0] === 'object' && 'lat' in coordsData[0] && 'lng' in coordsData[0]) {
              // {lat, lng} 형식을 [lng, lat]로 변환
              coordinates = coordsData.map((coord: any) => [coord.lng, coord.lat])
            } else {
              // 이미 배열 형식 (순서 확인 필요)
              coordinates = coordsData
            }
          }
        } catch (error) {
          console.warn(`좌표 파싱 실패 for area ${area.id}:`, error)
          return null
        }
        
        // 유효한 좌표인지 검증
        if (!Array.isArray(coordinates) || coordinates.length < 3) {
          return null
        }
        
        return {
          id: area.admCd || area.id.toString(),
          name: area.name,
          admCd: area.admCd || '',
          coordinates,
          properties: typeof area.properties === 'string' 
            ? JSON.parse(area.properties || '{}') 
            : (area.properties || {}),
          isActive: area.isActive, // isActive 필드 추가
          description: area.description,
          salesTerritory: area.salesTerritory // salesTerritory 정보 추가
        }
      })
      .filter(Boolean) // null 값 제거
    
    console.log(`✅ ${processedAreas.length}개 영역 처리 완료`)
    
    // 첫 번째 영역의 좌표 샘플 로그
    if (processedAreas.length > 0) {
      console.log('📍 첫 번째 영역 좌표 샘플:', processedAreas[0].coordinates.slice(0, 3))
    }
    
    return processedAreas
  } catch (error) {
    console.error('❌ Areas 데이터 로드 실패:', error)
    return []
  }
}

