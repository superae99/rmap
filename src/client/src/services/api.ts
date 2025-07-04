import { config } from '../config/environment'

const API_URL = config.apiBaseUrl

// 전역 디버그 함수 등록 (브라우저 콘솔에서 사용 가능)
declare global {
  interface Window {
    debugLogs: string[]
    showDebugLogs: () => void
    clearDebugLogs: () => void
  }
}

// 브라우저 콘솔에서 디버그 로그를 확인할 수 있는 함수
window.showDebugLogs = () => {
  if (!window.debugLogs || window.debugLogs.length === 0) {
    console.log('저장된 디버그 로그가 없습니다.')
    return
  }
  console.group('📋 저장된 모든 디버그 로그')
  window.debugLogs.forEach((log, index) => console.log(`${index + 1}. ${log}`))
  console.groupEnd()
}

window.clearDebugLogs = () => {
  window.debugLogs = []
  console.log('디버그 로그가 초기화되었습니다.')
}

// API 요청 헬퍼 함수
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  
  // 디버깅: 쿠키 정보 출력
  console.log('🍪 Request cookies:', document.cookie || '(쿠키 없음)')
  console.log('🌐 Request URL:', `${API_URL}${endpoint}`)
  console.log('🔧 Request method:', options.method || 'GET')
  console.log('🔧 Credentials:', 'include')
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // 쿠키를 포함하여 요청
  })
  
  console.log('📡 Response status:', response.status, response.statusText)
  console.log('📡 Response headers:')
  response.headers.forEach((value, key) => {
    console.log(`  ${key}: ${value}`)
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      console.error('❌ 401 Unauthorized - 쿠키 인증 실패')
      console.log('현재 쿠키:', document.cookie || '(쿠키 없음)')
      // 인증 실패 시 에러만 throw (App.tsx에서 처리)
      throw new Error('Unauthorized')
    }
    console.error('❌ API 에러:', response.status, response.statusText)
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

// 인증 API
export const authAPI = {
  login: async (account: string, password: string) => {
    // 디버깅 로그를 그룹화하여 관리
    console.group('🔐 로그인 프로세스 시작')
    console.log('계정:', account)
    console.log('API URL:', API_URL)
    console.log('현재 도메인:', window.location.hostname)
    console.log('요청 전 쿠키:', document.cookie || '(쿠키 없음)')
    
    // 로그 보존을 위해 window 객체에 저장
    if (!window.debugLogs) window.debugLogs = []
    window.debugLogs.push(`🔐 로그인 시도: ${account} at ${new Date().toISOString()}`)
    window.debugLogs.push(`📍 현재 도메인: ${window.location.hostname}`)
    window.debugLogs.push(`🍪 요청 전 쿠키: ${document.cookie || '(쿠키 없음)'}`)
    
    try {
      // 로그인 요청 전 상태 확인
      console.log('📡 로그인 요청 시작...')
      window.debugLogs.push('📡 로그인 요청 시작...')
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account, password }),
        credentials: 'include', // 쿠키 포함
      })
      
      console.log('📡 응답 상태:', response.status, response.statusText)
      console.log('📡 응답 URL:', response.url)
      window.debugLogs.push(`📡 응답 상태: ${response.status} ${response.statusText}`)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ 로그인 실패 응답 내용:', errorData)
        window.debugLogs.push(`❌ 로그인 실패: ${response.status} - ${errorData}`)
        
        // 실패 로그를 10초 동안 유지
        setTimeout(() => {
          console.group('📋 저장된 로그인 디버그 정보')
          window.debugLogs.forEach(log => console.log(log))
          console.log('브라우저 개발자 도구에서 "Preserve log" 옵션을 활성화하면 로그가 유지됩니다.')
          console.groupEnd()
        }, 100)
        
        console.groupEnd()
        throw new Error(`Login failed: ${response.status} ${response.statusText}`)
      }
      
      // 응답 헤더 상세 확인
      console.group('🔒 응답 헤더 정보')
      const headers = Array.from(response.headers.entries())
      headers.forEach(([key, value]) => {
        console.log(`${key}: ${value}`)
        window.debugLogs.push(`헤더 ${key}: ${value}`)
      })
      console.groupEnd()
      
      const data = await response.json()
      console.log('✅ 로그인 성공 데이터:', data)
      window.debugLogs.push('✅ 로그인 성공!')
      
      // 쿠키 상태 확인 (3초 지연으로 변화 감지)
      console.log('🍪 즉시 확인 쿠키:', document.cookie || '(쿠키 없음)')
      window.debugLogs.push(`🍪 즉시 확인 쿠키: ${document.cookie || '(쿠키 없음)'}`)
      
      // 3초 후 쿠키 재확인 (브라우저가 쿠키를 설정할 시간 제공)
      setTimeout(() => {
        console.group('🍪 3초 후 쿠키 상태')
        console.log('쿠키:', document.cookie || '(쿠키 없음)')
        console.log('authToken 존재:', document.cookie.includes('authToken'))
        window.debugLogs.push(`🍪 3초 후 쿠키: ${document.cookie || '(쿠키 없음)'}`)
        console.groupEnd()
      }, 3000)
      
      console.groupEnd()
      return data
    } catch (error) {
      console.error('💥 로그인 에러:', error)
      window.debugLogs.push(`💥 로그인 에러: ${error instanceof Error ? error.message : String(error)}`)
      
      // 에러 로그를 10초 후에 다시 표시
      setTimeout(() => {
        console.group('📋 저장된 로그인 디버그 정보 (에러 발생)')
        window.debugLogs.forEach(log => console.log(log))
        console.log('브라우저 개발자 도구에서 "Preserve log" 옵션을 활성화하면 로그가 유지됩니다.')
        console.groupEnd()
      }, 100)
      
      console.groupEnd()
      throw error
    }
  },
  
  getProfile: async () => {
    console.group('👤 사용자 프로필 조회')
    console.log('요청 URL:', `${API_URL}/auth/me`)
    console.log('요청 전 쿠키:', document.cookie || '(쿠키 없음)')
    console.log('authToken 포함여부:', document.cookie.includes('authToken'))
    
    try {
      const result = await apiRequest('/auth/me')
      console.log('✅ 프로필 조회 성공:', result)
      console.groupEnd()
      return result
    } catch (error) {
      console.error('❌ 프로필 조회 실패:', error)
      console.groupEnd()
      throw error
    }
  },
  
  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('로그아웃 API 오류:', error)
    }
    
    // 클라이언트에서도 쿠키 강제 삭제 시도
    try {
      // 가능한 모든 도메인과 경로로 쿠키 삭제 시도
      const domains = [
        '', // 현재 도메인
        '.netlify.app',
        '.master-7rqtwti-fru7lrwunilmo.au.platformsh.site',
        'r0map.netlify.app'
      ]
      
      const paths = ['/', '/api']
      
      domains.forEach(domain => {
        paths.forEach(path => {
          document.cookie = `authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`
          document.cookie = `authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`
        })
      })
      
      console.log('🗑️ 클라이언트 쿠키 삭제 완료')
    } catch (error) {
      console.error('클라이언트 쿠키 삭제 실패:', error)
    }
    
    // 페이지 완전 새로고침으로 상태 초기화
    window.location.replace('/login')
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },
}

// 거래처 API
export const partnerAPI = {
  getPartners: async (params?: {
    page?: number
    limit?: number
    search?: string
    channel?: string
    grade?: string
    managerChangeDate?: string
    branchFilter?: string | null
    officeFilter?: string | null
    managerFilter?: string | null
  }) => {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value != null && value !== '')
      ) as Record<string, string>
    ).toString()
    
    return apiRequest(`/partners${queryString ? `?${queryString}` : ''}`)
  },

  getFilterOptions: async () => {
    return apiRequest('/partners/filter-options')
  },
  
  getPartner: async (partnerCode: string) => {
    return apiRequest(`/partners/${partnerCode}`)
  },
  
  createPartner: async (partnerData: any) => {
    return apiRequest('/partners', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    })
  },
  
  updatePartner: async (partnerCode: string, partnerData: any) => {
    return apiRequest(`/partners/${partnerCode}`, {
      method: 'PUT',
      body: JSON.stringify(partnerData),
    })
  },
  
  deletePartner: async (partnerCode: string) => {
    return apiRequest(`/partners/${partnerCode}`, {
      method: 'DELETE',
    })
  },
  
  bulkUpload: async (partners: any[]) => {
    return apiRequest('/partners/bulk', {
      method: 'POST',
      body: JSON.stringify({ partners }),
    })
  },

  // 담당자 변경
  changeManager: async (partnerCode: string, managerData: {
    currentManagerEmployeeId: string
    currentManagerName: string
    managerChangeReason: string
  }) => {
    return apiRequest(`/partners/${partnerCode}`, {
      method: 'PUT',
      body: JSON.stringify({
        currentManagerEmployeeId: managerData.currentManagerEmployeeId,
        currentManagerName: managerData.currentManagerName,
        managerChangeReason: managerData.managerChangeReason,
        managerChangedDate: new Date().toISOString()
      }),
    })
  },
}

// 영역 API
export const areaAPI = {
  getAreas: async () => {
    return apiRequest('/areas')
  },

  getAreasWithSalesTerritory: async (params?: {
    branchFilter?: string | null
    officeFilter?: string | null
    managerFilter?: string | null
  }) => {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {}).filter(([_, value]) => value != null && value !== '')
      ) as Record<string, string>
    ).toString()
    
    return apiRequest(`/areas/with-territory${queryString ? `?${queryString}` : ''}`)
  },
  
  getArea: async (id: number) => {
    return apiRequest(`/areas/${id}`)
  },
  
  createArea: async (areaData: any) => {
    return apiRequest('/areas', {
      method: 'POST',
      body: JSON.stringify(areaData),
    })
  },
  
  updateArea: async (id: number, areaData: any) => {
    return apiRequest(`/areas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(areaData),
    })
  },
  
  deleteArea: async (id: number) => {
    return apiRequest(`/areas/${id}`, {
      method: 'DELETE',
    })
  },
  
  uploadTopoJSON: async (topoJSONData: any) => {
    return apiRequest('/areas/topojson', {
      method: 'POST',
      body: JSON.stringify(topoJSONData),
    })
  },
}

export default {
  auth: authAPI,
  partners: partnerAPI,
  areas: areaAPI,
}