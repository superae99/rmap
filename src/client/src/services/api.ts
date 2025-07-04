import { config } from '../config/environment'

const API_URL = config.apiBaseUrl

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
  console.log('🍪 Request cookies:', document.cookie)
  console.log('🌐 Request URL:', `${API_URL}${endpoint}`)
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // 쿠키를 포함하여 요청
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      // 인증 실패 시 에러만 throw (App.tsx에서 처리)
      throw new Error('Unauthorized')
    }
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

// 인증 API
export const authAPI = {
  login: async (account: string, password: string) => {
    // 디버깅을 위해 직접 fetch 호출
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account, password }),
      credentials: 'include', // 쿠키 포함
    })
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`)
    }
    
    // 디버깅: 응답 헤더 확인
    console.log('🔒 Login response headers:')
    for (let [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    const data = await response.json()
    
    // 로그인 후 쿠키 확인
    console.log('🍪 After login cookies:', document.cookie)
    
    return data
  },
  
  getProfile: async () => {
    return apiRequest('/auth/me')
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