import { config } from '../config/environment'

const API_URL = config.apiBaseUrl

// API 요청 헬퍼 함수
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem('token')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
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
    
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    
    return data
  },
  
  getProfile: async () => {
    return apiRequest('/auth/me')
  },
  
  logout: async () => {
    await apiRequest('/auth/logout', { method: 'POST' })
    localStorage.removeItem('token')
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

  // 전체 교체 업로드 (관리자만) - 배치 처리
  replaceAll: async (partners: any[], onProgress?: (progress: number, message: string) => void) => {
    const batchSize = 5000 // 클라이언트에서는 5000개씩 전송
    const totalBatches = Math.ceil(partners.length / batchSize)
    
    console.log(`🔄 ${partners.length}개 거래처 데이터를 ${totalBatches}개 배치로 나누어 전송합니다.`)
    
    // 첫 번째 배치는 기존 데이터 삭제 + 새 데이터 삽입
    let firstBatch = partners.slice(0, batchSize)
    onProgress?.(0, '기존 데이터 삭제 및 첫 번째 배치 업로드 중...')
    
    const firstResult = await apiRequest('/partners/replace-all', {
      method: 'POST',
      body: JSON.stringify({ partners: firstBatch }),
    })
    
    let totalCreated = firstResult.created || 0
    let totalErrors = firstResult.errors || []
    
    onProgress?.(1 / totalBatches * 100, `첫 번째 배치 완료 (${totalCreated}개 등록)`)
    
    // 나머지 배치들은 추가 업로드
    for (let i = 1; i < totalBatches; i++) {
      const start = i * batchSize
      const end = Math.min(start + batchSize, partners.length)
      const batch = partners.slice(start, end)
      
      onProgress?.((i / totalBatches) * 100, `배치 ${i + 1}/${totalBatches} 업로드 중... (${start + 1}-${end}/${partners.length})`)
      
      try {
        const batchResult = await apiRequest('/partners/bulk-upload', {
          method: 'POST',
          body: JSON.stringify({ partners: batch }),
        })
        
        totalCreated += batchResult.created || 0
        totalErrors = totalErrors.concat(batchResult.errors || [])
        
        onProgress?.((i + 1) / totalBatches * 100, `배치 ${i + 1} 완료 (총 ${totalCreated}개 등록)`)
      } catch (error) {
        console.error(`배치 ${i + 1} 업로드 실패:`, error)
        throw new Error(`배치 ${i + 1} 업로드 중 오류가 발생했습니다: ${error}`)
      }
    }
    
    return {
      message: `총 ${totalCreated}개 거래처가 등록되었습니다.`,
      created: totalCreated,
      failed: totalErrors.length,
      errors: totalErrors
    }
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