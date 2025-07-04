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
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // 쿠키를 포함하여 요청
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      // 인증 실패 시 커스텀 이벤트 발생 (URL 변경 없이 처리)
      window.dispatchEvent(new CustomEvent('auth-required'))
    }
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}

// 인증 API
export const authAPI = {
  login: async (account: string, password: string) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ account, password }),
    })
    
    // 쿠키는 서버에서 자동으로 설정되므로 localStorage 사용 안함
    return data
  },
  
  getProfile: async () => {
    return apiRequest('/auth/me')
  },
  
  logout: async () => {
    await apiRequest('/auth/logout', { method: 'POST' })
    // 쿠키는 서버에서 자동으로 삭제되므로 localStorage 사용 안함
    window.location.href = '/login'
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