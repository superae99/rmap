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
    
    // 필터 매개변수를 URL에 추가 (로그인된 사용자는 필터 사용 가능)
    const queryParams = new URLSearchParams()
    if (filters && token) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value as string)
        }
      })
      console.log('🔍 영역 필터 적용됨:', Object.fromEntries(queryParams))
    } else {
      console.log('🔍 영역 필터 없음 - 전체 데이터 로드')
    }
    
    // API 기본 URL 가져오기
    const { config } = await import('../config/environment')
    const baseUrl = config.apiBaseUrl
    
    // sales_territories와 조인된 데이터를 위해 with-sales-territory 엔드포인트 사용
    const url = `${baseUrl}/areas/with-sales-territory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
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
    
    // with-territory 엔드포인트는 배열을 직접 반환
    const areasData = Array.isArray(responseData) ? responseData : responseData.areas || responseData
    
    // 디버깅: 서버에서 받은 원본 데이터 확인
    if (areasData.length > 0) {
    }
    
    // 카카오맵에 사용할 형태로 변환
    const processedAreas: ProcessedArea[] = areasData
      .filter((area: any) => area.coordinates)
      .map((area: any) => {
        // GeoJSON 좌표 데이터 파싱
        let coordinates: number[][] = []
        try {
          const coordsData = typeof area.coordinates === 'string' 
            ? JSON.parse(area.coordinates) 
            : area.coordinates
            
          if (Array.isArray(coordsData) && coordsData.length > 0) {
            // GeoJSON Polygon: [[[lng, lat], ...]] 형태인 경우 첫 번째 ring 사용
            if (Array.isArray(coordsData[0]) && Array.isArray(coordsData[0][0])) {
              coordinates = coordsData[0] // 외부 ring만 사용
            }
            // GeoJSON LineString 또는 단순 배열: [[lng, lat], ...] 형태
            else if (Array.isArray(coordsData[0]) && typeof coordsData[0][0] === 'number') {
              coordinates = coordsData
            }
            // 레거시 {lat, lng} 객체 형식 지원
            else if (typeof coordsData[0] === 'object' && 'lat' in coordsData[0] && 'lng' in coordsData[0]) {
              coordinates = coordsData.map((coord: any) => [coord.lng, coord.lat])
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
        
        // properties에서 실제 행정구역명 추출
        const properties = typeof area.properties === 'string' 
          ? JSON.parse(area.properties || '{}') 
          : (area.properties || {})
        
        // name이 비어있으면 properties에서 행정구역명 가져오기
        let displayName = area.name
        if (!displayName || displayName.trim() === '') {
          // properties에서 가능한 이름 필드들 확인
          displayName = properties.ADM_NM || 
                       properties.adm_nm ||
                       properties.name ||
                       properties.DONG_NM ||
                       properties.dong_nm ||
                       area.salesTerritory?.admNm ||
                       `구역 ${area.admCd || area.id}`
          
        }
        
        return {
          id: area.admCd || area.id.toString(),
          name: displayName,
          admCd: area.admCd || '',
          coordinates,
          properties,
          isActive: area.isActive, // isActive 필드 추가
          description: area.description,
          salesTerritory: area.salesTerritory // salesTerritory 정보 추가
        }
      })
      .filter(Boolean) // null 값 제거
    
    
    // 첫 번째 영역의 좌표 샘플 로그
    if (processedAreas.length > 0) {
    }
    
    return processedAreas
  } catch (error) {
    console.error('❌ Areas 데이터 로드 실패:', error)
    return []
  }
}

