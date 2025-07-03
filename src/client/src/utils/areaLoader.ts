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
  console.log('🚀 areaLoader.loadAreasData 호출됨', { filters, hasToken: !!token })
  try {
    
    // 필터 매개변수를 URL에 추가 (토큰이 있을 때만)
    const queryParams = new URLSearchParams()
    if (filters && token) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value as string)
        }
      })
    }
    
    // API 기본 URL 가져오기
    const { config } = await import('../config/environment')
    const baseUrl = config.apiBaseUrl
    
    // 먼저 기본 areas 엔드포인트 사용
    const versionParam = `v=${Date.now()}`
    const separator = queryParams.toString() ? '&' : '?'
    const url = `${baseUrl}/areas${queryParams.toString() ? `?${queryParams.toString()}` : ''}${separator}${versionParam}`
    console.log('📡 API 호출 URL:', url)
    
    // 헤더에 인증 토큰 추가 (있는 경우)
    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await fetch(url, { headers })
    
    console.log('📡 서버 응답 상태:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 서버 오류:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    const responseData = await response.json()
    console.log('📦 서버 응답 데이터:', responseData)
    
    // with-territory 엔드포인트는 배열을 직접 반환
    const areasData = Array.isArray(responseData) ? responseData : responseData.areas || responseData
    console.log('📄 영역 데이터 개수:', areasData.length)
    
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
    
    // 오류 발생 시 테스트 데이터 반환
    console.log('🎯 테스트 영역 데이터 사용')
    return [
      {
        id: 'test1',
        name: '테스트 영역 1',
        admCd: 'TEST001',
        coordinates: [
          [126.9780, 37.5665],
          [126.9880, 37.5665],
          [126.9880, 37.5765],
          [126.9780, 37.5765],
          [126.9780, 37.5665]
        ],
        properties: {},
        isActive: true,
        description: '테스트 영역'
      },
      {
        id: 'test2',
        name: '테스트 영역 2',
        admCd: 'TEST002',
        coordinates: [
          [127.0280, 37.5165],
          [127.0380, 37.5165],
          [127.0380, 37.5265],
          [127.0280, 37.5265],
          [127.0280, 37.5165]
        ],
        properties: {},
        isActive: true,
        description: '테스트 영역 2'
      }
    ]
  }
}

