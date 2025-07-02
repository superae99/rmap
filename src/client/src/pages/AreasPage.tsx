import React, { useState } from 'react'
import { areaAPI, authAPI, partnerAPI } from '../services/api'
import KakaoMap from '../components/map/KakaoMap'
import { loadAreasData } from '../services/areas-service'
import { useFilters } from '../hooks/useFilters'
import type { Partner } from '../types/partner.types'

// 점이 폴리곤 내부에 있는지 확인하는 함수 (Ray Casting Algorithm)
const isPointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
  const [x, y] = point
  let inside = false
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}

interface Area {
  id: number
  name: string
  coordinates: Array<{ lat: number; lng: number }>
  color?: string
  strokeColor?: string
  strokeWeight?: number
  fillOpacity?: number
  description?: string
  properties?: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
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
  partnersInArea?: Partner[]
  managersInArea?: Array<{
    name: string
    employeeId: string
    partnerCount: number
  }>
  partnerCount?: number
  managerCount?: number
  isRelatedArea?: boolean
}


const AreasPage = () => {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'detail' | 'edit' | 'create'>('detail')
  const [mapAreas, setMapAreas] = useState<any[]>([])
  const [showMapView, setShowMapView] = useState(false)
  const [allPartners, setAllPartners] = useState<Partner[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [partnersLoading, setPartnersLoading] = useState(false)
  
  // useFilters 훅 사용 (홈화면과 동일)
  const { options, filters, updateFilter, resetFilters } = useFilters()


  // 거래처 데이터를 페이지네이션으로 전체 로드하는 함수
  const loadAllPartners = async () => {
    try {
      setPartnersLoading(true)
      
      let allValidPartners: Partner[] = []
      let page = 1
      let hasMore = true
      
      console.log('거래처 데이터 페이지네이션 로드 시작...')
      
      while (hasMore) {
        const partnersResponse = await partnerAPI.getPartners({ 
          page,
          limit: 1000 // 페이지당 1000개씩 로드
        })
        
        const partnersData = partnersResponse.partners || partnersResponse
        
        if (!Array.isArray(partnersData) || partnersData.length === 0) {
          hasMore = false
          break
        }
        
        // 유효한 좌표가 있는 거래처만 필터링
        const validPartners = partnersData.filter(partner => {
          const lat = Number(partner.latitude)
          const lng = Number(partner.longitude)
          return lat && lng && 
                 lat >= 33 && lat <= 43 &&  // 한국 위도 범위
                 lng >= 124 && lng <= 132   // 한국 경도 범위
        })
        
        allValidPartners = [...allValidPartners, ...validPartners]
        
        
        // 다음 페이지가 있는지 확인
        if (partnersData.length < 1000) {
          hasMore = false
        } else {
          page++
        }
      }
      
      setAllPartners(allValidPartners)
      
    } catch (error) {
      console.error('거래처 데이터 로드 실패:', error)
      setAllPartners([])
    } finally {
      setPartnersLoading(false)
    }
  }

  // 로딩 상태 메시지 컴포넌트
  const [loadingMessage, setLoadingMessage] = useState('')

  // 상권 데이터 가져오기 (조회 버튼용)
  const fetchAreas = async () => {
    if (partnersLoading) {
      setLoadingMessage('거래처 데이터를 로딩 중입니다. 잠시만 기다려주세요...')
      setTimeout(() => setLoadingMessage(''), 3000)
      return
    }

    try {
      setLoading(true)
      // 거래처 데이터 로드 (HomePage와 동일하게 필터링된 데이터만)
      const partnersData = await partnerAPI.getPartners(filters)
      const loadedPartners = Array.isArray(partnersData.partners || partnersData) 
        ? (partnersData.partners || partnersData) 
        : []
      setAllPartners(loadedPartners)
      
      // 로그인 상태 확인
      const token = localStorage.getItem('token')
      let validToken = undefined
      
      if (token) {
        try {
          // 토큰 유효성 검증
          const userData = await authAPI.getProfile()
          if (userData) {
            validToken = token
          }
        } catch (error) {
          localStorage.removeItem('token') // 무효한 토큰 제거
        }
      }
      
      const areasData = await loadAreasData(filters, validToken)
      
      // 필터된 상권들의 sido, sgg 수집
      const filteredRegions = new Set()
      const managersByRegion = new Map()
      
      // 상권 데이터 분석 (로깅 최소화)
      areasData.forEach((area) => {
        if (area.salesTerritory?.sido && area.salesTerritory?.gungu) {
          const regionKey = `${area.salesTerritory.sido}_${area.salesTerritory.gungu}`
          filteredRegions.add(regionKey)
          
          // 실제 담당자가 있는 경우만 저장
          if (area.salesTerritory.managerName && !area.salesTerritory.managerName.includes('관리 구역 담당 없음')) {
            managersByRegion.set(regionKey, {
              managerName: area.salesTerritory.managerName,
              branchName: area.salesTerritory.branchName,
              officeName: area.salesTerritory.officeName
            })
          }
        }
      })

      // 각 상권에 포함되는 거래처들 찾기
      const findPartnersInArea = (area: any, partners: Partner[]): Partner[] => {
        if (!area.coordinates || !Array.isArray(area.coordinates) || area.coordinates.length < 3) {
          return []
        }

        // 좌표 형식 확인 및 변환
        let polygon: number[][]
        try {
          // coordinates가 [lng, lat] 형식인지 [{lat, lng}] 형식인지 확인
          if (typeof area.coordinates[0] === 'object' && 'lat' in area.coordinates[0]) {
            // {lat, lng} 형식을 [lng, lat]로 변환
            polygon = area.coordinates.map((coord: any) => [coord.lng, coord.lat])
          } else {
            // 이미 [lng, lat] 형식
            polygon = area.coordinates
          }
        } catch (error) {
          return []
        }

        // 모든 거래처에서 해당 영역에 포함되는 거래처 찾기
        const partnersInArea = partners.filter(partner => {
          const lat = Number(partner.latitude)
          const lng = Number(partner.longitude)
          
          if (!lat || !lng) return false
          
          try {
            // 좌표 순서: [lng, lat] (경도, 위도)
            return isPointInPolygon([lng, lat], polygon)
          } catch (error) {
            return false
          }
        })

        return partnersInArea
      }

      // 지도용 데이터 변환
      const mapAreasData = areasData.map(area => {
        // 상권 내 거래처들 찾기 (이미 로드된 필터링된 데이터 사용)
        const partnersInArea = findPartnersInArea(area, loadedPartners)
        
        // 상권 내 거래처들의 담당자 정보 수집
        const managersInArea = new Set<string>()
        const managerDetails: any[] = []
        
        partnersInArea.forEach(partner => {
          if (partner.currentManagerName) {
            managersInArea.add(partner.currentManagerName)
            // 중복 제거를 위해 이미 추가된 담당자인지 확인
            if (!managerDetails.find(m => m.name === partner.currentManagerName)) {
              managerDetails.push({
                name: partner.currentManagerName,
                employeeId: partner.currentManagerEmployeeId,
                partnerCount: partnersInArea.filter(p => p.currentManagerName === partner.currentManagerName).length
              })
            }
          }
        })

        
        // 상권에 거래처 및 담당자 정보 추가
        let displayInfo = { 
          ...area,
          partnersInArea,
          managersInArea: managerDetails,
          partnerCount: partnersInArea.length,
          managerCount: managersInArea.size
        }
        
        // salesTerritory가 있지만 담당자가 없는 경우만 처리
        if (area.salesTerritory && !area.salesTerritory.managerName && area.salesTerritory.sido && area.salesTerritory.gungu) {
          const regionKey = `${area.salesTerritory.sido}_${area.salesTerritory.gungu}`
          const regionManager = managersByRegion.get(regionKey)
          
          
          if (regionManager) {
            // 같은 지역에 담당자가 있는 경우, 해당 담당자 정보로 표시
            displayInfo = {
              ...area,
              salesTerritory: {
                ...area.salesTerritory,
                managerName: `${regionManager.managerName} (관리 구역 담당 없음)`,
                branchName: regionManager.branchName,
                officeName: regionManager.officeName
              },
              isRelatedArea: true
            } as any
          }
        }
        
        // salesTerritory가 아예 없는 상권도 확인 (admCd로 매칭 시도)
        else if (!area.salesTerritory) {
          // admCd를 기반으로 sido, gungu 추출 시도
          const admCd = area.admCd
          if (admCd && admCd.length >= 5) {
            // admCd의 앞 5자리로 sido, gungu 유추 (한국 행정구역 코드 체계)
            
            // 기존 담당자 정보에서 같은 admCd 패턴을 가진 지역 찾기
            for (const [regionKey, manager] of managersByRegion.entries()) {
              const [sido, gungu] = regionKey.split('_')
              // 간단한 매칭 - 나중에 더 정교하게 개선 가능
              if (sido && gungu) {
                displayInfo = {
                  ...area,
                  salesTerritory: {
                    territoryId: 0,
                    branchName: manager.branchName,
                    officeName: manager.officeName,
                    managerName: `${manager.managerName} (관리 구역 담당 없음)`,
                    managerEmployeeId: '',
                    sido: sido,
                    gungu: gungu,
                    admNm: area.name
                  }
                } as any
                break // 첫 번째 매칭에서 중단
              }
            }
          }
        }
        
        return {
          id: area.id,
          name: area.name,
          coordinates: area.coordinates,
          color: '#667eea',
          strokeColor: '#667eea',
          strokeWeight: 2,
          opacity: 0.2,
          data: {
            ...displayInfo,
            properties: area.properties
          }
        }
      })
      
      // 수정된 상권 정보로 업데이트
      const updatedAreasData = mapAreasData.map(mapArea => mapArea.data)
      
      setMapAreas(mapAreasData)
      setAreas(updatedAreasData as any)
      
    } catch (error) {
      console.error('상권 데이터 로드 실패:', error)
      setAreas([])
      setMapAreas([])
    } finally {
      setLoading(false)
    }
    setHasSearched(true)
  }

  // 검색 필터링
  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (area.description && area.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // 상권 상세보기
  const handleAreaDetail = (area: Area) => {
    setSelectedArea(area)
    setModalType('detail')
    setShowModal(true)
  }

  // 상권 편집
  const handleAreaEdit = (area: Area) => {
    setSelectedArea(area)
    setModalType('edit')
    setShowModal(true)
  }

  // 새 상권 생성
  const handleAreaCreate = () => {
    setSelectedArea(null)
    setModalType('create')
    setShowModal(true)
  }

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false)
    setSelectedArea(null)
  }

  // 상권 활성화/비활성화 토글
  const toggleAreaActive = async (area: Area) => {
    try {
      await areaAPI.updateArea(area.id, { isActive: !area.isActive })
      setAreas(areas.map(a => 
        a.id === area.id ? { ...a, isActive: !a.isActive } : a
      ))
    } catch (error) {
      console.error('상권 상태 변경 실패:', error)
    }
  }

  return React.createElement('div',
    { style: { padding: '20px', maxWidth: '1200px', margin: '0 auto' } },
    
    // 헤더
    React.createElement('div',
      { style: { marginBottom: '30px' } },
      React.createElement('div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
        React.createElement('h1', 
          { style: { margin: 0, fontSize: '28px', color: '#333' } }, 
          '🗺️ 상권 관리'
        ),
        React.createElement('div',
          { style: { display: 'flex', gap: '10px' } },
          React.createElement('button',
            {
              onClick: () => setShowMapView(!showMapView),
              style: {
                padding: '10px 20px',
                backgroundColor: showMapView ? '#ff9800' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            },
            showMapView ? '📋 목록 보기' : '🗺️ 지도 보기'
          ),
          React.createElement('button',
            {
              onClick: handleAreaCreate,
              style: {
                padding: '10px 20px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            },
            '➕ 새 상권 추가'
          )
        )
      ),
      React.createElement('p', 
        { style: { color: '#666', margin: 0 } }, 
        '상권 정보를 조회하고 관리합니다.'
      )
    ),

    // 검색 및 필터 영역
    React.createElement('div',
      { 
        style: { 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        } 
      },
      React.createElement('form', 
        { 
          onSubmit: (e: React.FormEvent) => {
            e.preventDefault()
            fetchAreas()
          },
          style: { 
            display: 'flex',
            alignItems: 'end',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '15px'
          }
        },
        
        // 검색어 입력
        React.createElement('div', { style: { flex: '1', minWidth: '200px' } },
          React.createElement('label', 
            { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
            '검색어'
          ),
          React.createElement('input', {
            type: 'text',
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            placeholder: '상권명, 설명 검색',
            style: {
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              height: '38px',
              boxSizing: 'border-box'
            }
          })
        ),

        // 지사 필터
        React.createElement('div', { style: { flex: '0 0 120px', minWidth: '120px' } },
          React.createElement('label', 
            { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
            '지사'
          ),
          React.createElement('select', {
            value: filters.branchFilter || '',
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('branchFilter', e.target.value || null),
            style: {
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              height: '38px',
              boxSizing: 'border-box'
            }
          },
            React.createElement('option', { value: '' }, '전체'),
            ...(options?.branches || []).map(branch =>
              React.createElement('option', { key: branch, value: branch }, branch)
            )
          )
        ),

        // 지점 필터
        React.createElement('div', { style: { flex: '0 0 120px', minWidth: '120px' } },
          React.createElement('label', 
            { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
            '지점'
          ),
          React.createElement('select', {
            value: filters.officeFilter || '',
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('officeFilter', e.target.value || null),
            style: {
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              height: '38px',
              boxSizing: 'border-box'
            }
          },
            React.createElement('option', { value: '' }, '전체'),
            ...(options?.offices || [])
              .filter(office => !filters.branchFilter || office.branchName === filters.branchFilter)
              .map(office =>
                React.createElement('option', { key: office.officeName, value: office.officeName }, office.officeName)
              )
          )
        ),

        // 담당자 필터
        React.createElement('div', { style: { flex: '0 0 150px', minWidth: '150px' } },
          React.createElement('label', 
            { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 
            '담당자'
          ),
          React.createElement('select', {
            value: filters.managerFilter || '',
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('managerFilter', e.target.value || null),
            style: {
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              height: '38px',
              boxSizing: 'border-box'
            }
          },
            React.createElement('option', { value: '' }, '전체'),
            ...(options?.managers || [])
              .filter(manager => {
                if (filters.branchFilter && manager.branchName !== filters.branchFilter) return false
                if (filters.officeFilter && manager.officeName !== filters.officeFilter) return false
                return true
              })
              .map(manager =>
                React.createElement('option', { key: manager.employeeId, value: manager.employeeId }, `${manager.employeeName} (${manager.officeName})`)
              )
          )
        ),

        // 검색 버튼
        React.createElement('button',
          {
            type: 'submit',
            style: {
              flex: '0 0 100px',
              minWidth: '100px',
              padding: '8px 16px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              height: '38px',
              boxSizing: 'border-box'
            }
          },
          '🔍 조회'
        ),

        // 초기화 버튼
        React.createElement('button',
          {
            type: 'button',
            onClick: () => {
              setSearchTerm('')
              resetFilters()
            },
            style: {
              flex: '0 0 80px',
              minWidth: '80px',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              height: '38px',
              boxSizing: 'border-box'
            }
          },
          '🔄 초기화'
        )
      ),

      // 로딩 메시지 표시
      loadingMessage && React.createElement('div',
        { style: { 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '10px 15px', 
          borderRadius: '4px',
          border: '1px solid #ffeaa7',
          marginBottom: '15px',
          fontSize: '14px'
        } },
        loadingMessage
      ),

      // 통계 정보
      React.createElement('div',
        { style: { display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', paddingTop: '15px', borderTop: '1px solid #eee' } },
        React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: '18px', fontWeight: 'bold', color: '#667eea' } },
            filteredAreas.filter(a => a.salesTerritory?.managerName && !a.salesTerritory.managerName.includes('관리 구역 담당 없음')).length
          ),
          React.createElement('div', { style: { fontSize: '12px', color: '#666' } }, '직접 담당')
        ),
        React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: '18px', fontWeight: 'bold', color: '#ff9800' } },
            filteredAreas.filter(a => a.salesTerritory?.managerName && a.salesTerritory.managerName.includes('관리 구역 담당 없음')).length
          ),
          React.createElement('div', { style: { fontSize: '12px', color: '#666' } }, '관련 구역')
        ),
        React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: '18px', fontWeight: 'bold', color: '#ff6b6b' } },
            filteredAreas.filter(a => !a.salesTerritory?.managerName).length
          ),
          React.createElement('div', { style: { fontSize: '12px', color: '#666' } }, '미배정')
        ),
        React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' } },
            filteredAreas.length
          ),
          React.createElement('div', { style: { fontSize: '12px', color: '#666' } }, '전체')
        ),
        React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', { style: { fontSize: '18px', fontWeight: 'bold', color: '#9C27B0' } },
            filteredAreas.reduce((sum, area) => sum + (area.partnerCount || 0), 0)
          ),
          React.createElement('div', { style: { fontSize: '12px', color: '#666' } }, '총 거래처')
        )
      )
    ),

    // 지도 보기 또는 목록 보기
    showMapView ? 
      React.createElement('div',
        { 
          style: { 
            backgroundColor: 'white', 
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          } 
        },
        React.createElement(KakaoMap, {
          width: '100%',
          height: '600px',
          latitude: 37.5665,
          longitude: 126.9780,
          level: 10,
          areas: mapAreas,
          showAreaBounds: true,
          onAreaClick: (area: any) => {
            const selectedArea = areas.find(a => a.id === area.id)
            if (selectedArea) {
              handleAreaDetail(selectedArea)
            }
          }
        })
      ) :
      // 영역 목록 (카드 형태)
      React.createElement('div',
        { 
          style: { 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          } 
        },
        loading ? 
          React.createElement('div',
            { style: { gridColumn: 'span 4', textAlign: 'center', padding: '40px', color: '#666' } },
            '데이터를 불러오는 중...'
          ) :
          !hasSearched ?
            React.createElement('div',
              { style: { gridColumn: 'span 4', textAlign: 'center', padding: '40px', color: '#666' } },
              '🔍 조회 버튼을 눌러 상권 목록을 조회하세요.'
            ) :
          filteredAreas.length === 0 ?
            React.createElement('div',
              { style: { gridColumn: 'span 4', textAlign: 'center', padding: '40px', color: '#666' } },
              searchTerm ? '검색 결과가 없습니다.' : '등록된 상권이 없습니다.'
            ) :
            filteredAreas.map(area =>
              React.createElement('div',
                {
                  key: area.id,
                  style: {
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: area.salesTerritory?.managerName ? 
                      (area.salesTerritory.managerName.includes('관리 구역 담당 없음') ? '2px solid #fff3e0' : '2px solid #e8f5e8') 
                      : '2px solid #ffebee',
                    position: 'relative'
                  }
                },
              
              // 상태 배지
              React.createElement('div',
                {
                  style: {
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: area.salesTerritory?.managerName ? 
                      (area.salesTerritory.managerName.includes('관리 구역 담당 없음') ? '#fff3e0' : '#e8f5e8') 
                      : '#ffebee',
                    color: area.salesTerritory?.managerName ? 
                      (area.salesTerritory.managerName.includes('관리 구역 담당 없음') ? '#ef6c00' : '#2e7d32') 
                      : '#c62828'
                  }
                },
                area.salesTerritory?.managerName ? 
                  (area.salesTerritory.managerName.includes('관리 구역 담당 없음') ? '관련 구역' : '직접 담당') 
                  : '미배정'
              ),

              // 상권 색상 미리보기
              React.createElement('div',
                {
                  style: {
                    width: '100%',
                    height: '60px',
                    backgroundColor: area.color || '#f5f5f5',
                    borderRadius: '6px',
                    marginBottom: '15px',
                    border: `2px solid ${area.strokeColor || area.color || '#ddd'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    fontSize: '18px'
                  }
                },
                area.name
              ),

              // 상권 정보
              React.createElement('div', { style: { marginBottom: '15px' } },
                React.createElement('h3', 
                  { style: { margin: '0 0 8px 0', fontSize: '16px' } }, 
                  area.name
                ),
                area.description && React.createElement('p', 
                  { style: { margin: '0 0 8px 0', color: '#666', fontSize: '14px' } }, 
                  area.description
                ),
                React.createElement('div', { style: { fontSize: '12px', color: '#999' } },
                  `좌표점 ${area.coordinates?.length || 0}개`
                ),
                React.createElement('div', 
                  { style: { fontSize: '12px', color: '#999', marginTop: '5px' } },
                  `상권 내 거래처: ${area.partnerCount || 0}개`
                ),
                React.createElement('div', 
                  { style: { fontSize: '12px', color: '#999', marginTop: '5px' } },
                  `상권 내 담당자: ${area.managerCount || 0}명`
                ),
                area.salesTerritory && React.createElement('div', 
                  { style: { fontSize: '12px', color: '#999', marginTop: '5px' } },
                  `기본 담당자: ${area.salesTerritory.managerName || '미지정'}`
                ),
                area.salesTerritory && React.createElement('div', 
                  { style: { fontSize: '12px', color: '#999', marginTop: '5px' } },
                  `${area.salesTerritory.branchName} > ${area.salesTerritory.officeName}`
                ),
                // 영역 내 담당자들 표시
                area.managersInArea && area.managersInArea.length > 0 && React.createElement('div',
                  { style: { marginTop: '10px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' } },
                  React.createElement('div', 
                    { style: { fontSize: '11px', color: '#666', fontWeight: 'bold', marginBottom: '5px' } },
                    '상권 내 담당자 목록:'
                  ),
                  ...area.managersInArea.slice(0, 5).map((manager: any) =>
                    React.createElement('div', 
                      { 
                        key: manager.name,
                        style: { fontSize: '11px', color: '#555', marginBottom: '2px' } 
                      },
                      `• ${manager.name} (${manager.partnerCount}개 거래처)`
                    )
                  ),
                  area.managersInArea.length > 5 && React.createElement('div',
                    { style: { fontSize: '11px', color: '#999', marginTop: '5px' } },
                    `... 외 ${area.managersInArea.length - 5}명`
                  )
                )
              ),

              // 액션 버튼들
              React.createElement('div',
                { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                React.createElement('button',
                  {
                    onClick: () => handleAreaDetail(area),
                    style: {
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }
                  },
                  '상세보기'
                ),
                React.createElement('button',
                  {
                    onClick: () => handleAreaEdit(area),
                    style: {
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }
                  },
                  '편집'
                ),
                React.createElement('button',
                  {
                    onClick: () => toggleAreaActive(area),
                    style: {
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: area.isActive ? '#ff9800' : '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }
                  },
                  '설정'
                )
                )
              )
            )
      ),

    // 상세보기/편집 모달
    showModal && React.createElement('div',
      {
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }
      },
      React.createElement('div',
        {
          style: {
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80%',
            overflowY: 'auto'
          }
        },
        React.createElement('div',
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('h3', { style: { margin: 0 } }, 
            modalType === 'detail' ? '상권 상세 정보' :
            modalType === 'edit' ? '상권 편집' : '새 상권 추가'
          ),
          React.createElement('button',
            {
              onClick: closeModal,
              style: {
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }
            },
            '×'
          )
        ),

        modalType === 'detail' && selectedArea ? 
          // 상세보기 모드
          React.createElement('div',
            { style: { display: 'flex', flexDirection: 'column', gap: '20px' } },
            
            // 지도 영역
            React.createElement('div',
              { style: { width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' } },
              React.createElement(KakaoMap, {
                width: '100%',
                height: '400px',
                staticMode: false,
                disableControls: false,
                showAreaBounds: true,
                fitBounds: true,
                disableMarkerCentering: true,
                areas: selectedArea.coordinates ? [{
                  id: selectedArea.id,
                  name: selectedArea.name,
                  coordinates: Array.isArray(selectedArea.coordinates) && selectedArea.coordinates.length > 0 ? 
                    (typeof selectedArea.coordinates[0] === 'object' && 'lat' in selectedArea.coordinates[0] ? 
                      selectedArea.coordinates.map((coord: any) => [coord.lng, coord.lat]) as number[][] : 
                      selectedArea.coordinates as unknown as number[][]) : [],
                  color: selectedArea.color || '#667eea',
                  strokeColor: selectedArea.strokeColor || '#667eea',
                  strokeWeight: selectedArea.strokeWeight || 2,
                  opacity: selectedArea.fillOpacity || 0.3
                }] : [],
                markers: selectedArea.partnersInArea ? (() => {
                  // 공통 색상 팔레트
                  const colorPalette = [
                    '#FF0000', // 빨강
                    '#0000FF', // 파랑
                    '#00FF00', // 초록
                    '#FFD700', // 금색
                    '#9400D3', // 보라
                    '#00FFFF'  // 시안
                  ]
                  

                  // 고유 담당자 목록 생성 및 색상 순서대로 할당
                  const uniqueManagers = [...new Set(selectedArea.partnersInArea.map(p => p.currentManagerName))].filter(Boolean)
                  const managerColorMap = new Map()
                  uniqueManagers.forEach((manager, index) => {
                    managerColorMap.set(manager, colorPalette[index % colorPalette.length])
                  })

                  return selectedArea.partnersInArea.map(partner => ({
                    id: partner.partnerCode,
                    latitude: Number(partner.latitude),
                    longitude: Number(partner.longitude),
                    title: partner.partnerName,
                    rtmChannel: partner.channel,
                    markerColor: partner.currentManagerName ? managerColorMap.get(partner.currentManagerName) || '#666666' : '#666666',
                    content: `
                      <div style="padding: 8px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <h4 style="margin: 0 0 8px 0; color: #333;">${partner.partnerName}</h4>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">코드: ${partner.partnerCode}</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">채널: ${partner.channel || '기타'}</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">담당자: ${partner.currentManagerName || '미지정'}</div>
                        ${partner.businessAddress ? `<div style="font-size: 11px; color: #999; margin-top: 8px;">${partner.businessAddress}</div>` : ''}
                      </div>
                    `
                  })).filter(marker => !isNaN(marker.latitude) && !isNaN(marker.longitude))
                })() : [],
                latitude: selectedArea.coordinates && selectedArea.coordinates.length > 0 ? 
                  (typeof selectedArea.coordinates[0] === 'object' && 'lat' in selectedArea.coordinates[0] ? 
                    selectedArea.coordinates.reduce((sum: number, coord: any) => sum + coord.lat, 0) / selectedArea.coordinates.length :
                    selectedArea.coordinates.reduce((sum: number, coord: any) => sum + coord[1], 0) / selectedArea.coordinates.length) : 37.5665,
                longitude: selectedArea.coordinates && selectedArea.coordinates.length > 0 ? 
                  (typeof selectedArea.coordinates[0] === 'object' && 'lng' in selectedArea.coordinates[0] ? 
                    selectedArea.coordinates.reduce((sum: number, coord: any) => sum + coord.lng, 0) / selectedArea.coordinates.length :
                    selectedArea.coordinates.reduce((sum: number, coord: any) => sum + coord[0], 0) / selectedArea.coordinates.length) : 126.9780,
                level: 8
              })
            ),
            
            // 담당자별 색상 범례 (거래처가 있을 때만 표시)
            selectedArea.partnersInArea && selectedArea.partnersInArea.length > 0 && React.createElement('div',
              { style: { padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' } },
              React.createElement('h4', { style: { margin: '0 0 10px 0', fontSize: '14px', color: '#333' } }, '📍 담당자별 마커 색상'),
              React.createElement('div', 
                { style: { display: 'flex', flexWrap: 'wrap', gap: '10px' } },
                (() => {
                  // 지도와 동일한 색상 팔레트
                  const colorPalette = [
                    '#FF0000', // 빨강
                    '#0000FF', // 파랑
                    '#00FF00', // 초록
                    '#FFD700', // 금색
                    '#9400D3', // 보라
                    '#00FFFF'  // 시안
                  ]

                  // 고유 담당자 목록 생성 및 색상 순서대로 할당
                  const uniqueManagers = [...new Set(selectedArea.partnersInArea.map(p => p.currentManagerName))].filter(Boolean)
                  const managerColorMap = new Map()
                  uniqueManagers.forEach((manager, index) => {
                    managerColorMap.set(manager, colorPalette[index % colorPalette.length])
                  })
                  return uniqueManagers.map(managerName =>
                    React.createElement('div', 
                      { 
                        key: managerName,
                        style: { 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          fontSize: '12px'
                        } 
                      },
                      React.createElement('div', {
                        style: {
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: managerColorMap.get(managerName) || '#666666',
                          border: '1px solid #ddd'
                        }
                      }),
                      React.createElement('span', null, managerName)
                    )
                  )
                })()
              )
            ),

            // 상세 정보
            React.createElement('div',
              { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' } },
              Object.entries({
              'ID': selectedArea.id,
              '영역명': selectedArea.name,
              '설명': selectedArea.description,
              '색상': selectedArea.color,
              '테두리 색상': selectedArea.strokeColor,
              '테두리 두께': selectedArea.strokeWeight,
              '투명도': selectedArea.fillOpacity,
              '좌표점 수': selectedArea.coordinates?.length || 0,
              '상태': selectedArea.isActive ? '활성' : '비활성',
              '생성일': new Date(selectedArea.createdAt).toLocaleDateString(),
              '수정일': new Date(selectedArea.updatedAt).toLocaleDateString(),
              '영역 내 거래처': selectedArea.partnerCount || 0,
              '영역 내 담당자': selectedArea.managerCount || 0
              }).map(([key, value]) =>
              React.createElement('div', { key, style: { gridColumn: key === '설명' ? 'span 2' : 'span 1' } },
                React.createElement('strong', null, key + ':'),
                React.createElement('p', { style: { margin: '5px 0 0 0' } }, 
                  key === '색상' || key === '테두리 색상' ? 
                    React.createElement('span', {
                      style: {
                        display: 'inline-block',
                        width: '20px',
                        height: '20px',
                        backgroundColor: value as string,
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        marginRight: '8px',
                        verticalAlign: 'middle'
                      }
                    }) : null,
                  String(value || '-')
                )
              )
            ),
              selectedArea.properties && React.createElement('div', { style: { gridColumn: 'span 2', marginTop: '15px' } },
                React.createElement('strong', null, '추가 속성:'),
                React.createElement('pre', { 
                  style: { 
                    margin: '5px 0 0 0', 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto'
                  } 
                }, JSON.stringify(selectedArea.properties, null, 2))
              )
            )
          ) :
          // 편집/생성 모드는 추후 구현
          React.createElement('div',
            { style: { textAlign: 'center', padding: '40px', color: '#666' } },
            '편집/생성 기능은 추후 구현될 예정입니다.'
          )
      )
    )
  )
}

export default AreasPage