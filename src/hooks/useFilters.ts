import { useState, useEffect } from 'react'
import { partnerAPI } from '../services/api'
import { FilterOptions, PartnerFilters, FilterState } from '../types/filter.types'

const initialFilters: PartnerFilters = {
  branchFilter: null,
  officeFilter: null,
  managerFilter: null
}

export const useFilters = () => {
  const [state, setState] = useState<FilterState>({
    options: null,
    filters: initialFilters,
    loading: false,
    error: null
  })

  // 필터 옵션 로드
  const loadFilterOptions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const options = await partnerAPI.getFilterOptions()
      console.log('🎯 useFilters - 필터 옵션 로드:', options)
      console.log('🎯 담당자 데이터 샘플:', options.managers?.slice(0, 3))
      setState(prev => ({ 
        ...prev, 
        options, 
        loading: false 
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '필터 옵션 로드 실패' 
      }))
    }
  }

  // 필터 값 업데이트
  const updateFilter = (key: keyof PartnerFilters, value: string | null) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      }
    }))
  }

  // 필터 초기화
  const resetFilters = () => {
    setState(prev => ({
      ...prev,
      filters: initialFilters
    }))
  }

  // 로그인 시 필터 옵션 자동 로드
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      loadFilterOptions()
    }
  }, [])

  return {
    ...state,
    updateFilter,
    resetFilters,
    loadFilterOptions
  }
}