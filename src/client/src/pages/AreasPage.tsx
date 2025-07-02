import React, { useEffect, useState } from 'react'
import { areaAPI, authAPI } from '../services/api'
import KakaoMap from '../components/map/KakaoMap'
import FilterPanel from '../components/common/FilterPanel'
import { loadAreasData } from '../services/areas-service'
import { useFilters } from '../hooks/useFilters'


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
  partnersInArea?: any[]
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
  console.log('🏗️ AreasPage 컴포넌트 렌더링 시작')
  
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('✅ AreasPage 컴포넌트가 렌더링되었습니다!')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'detail' | 'edit' | 'create'>('detail')
  const [mapAreas, setMapAreas] = useState<any[]>([])
  const [showMapView, setShowMapView] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // useFilters 훅 사용 (홈화면과 동일)
  const { options, filters, updateFilter, resetFilters } = useFilters()

  // 사용자 정보 로드
  useEffect(() => {
    console.log('👤 사용자 정보 로드 useEffect 실행')
    setDebugInfo('👤 사용자 정보 로드 useEffect 실행')
    const loadUser = async () => {
      try {
        console.log('🔐 토큰 확인 중...')
        setDebugInfo('🔐 토큰 확인 중...')
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('❌ 토큰 없음')
          setDebugInfo('❌ 토큰 없음')
          return
        }
        console.log('✅ 토큰 존재, 사용자 정보 요청 중...')
        setDebugInfo('✅ 토큰 존재, 사용자 정보 요청 중...')

        const userData = await authAPI.getProfile()
        setUser(userData)
        console.log('👤 사용자 정보 로드 성공:', userData)
        setDebugInfo(`👤 사용자 정보 로드 성공: ${userData.username}`)
        
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error)
        setDebugInfo(`❌ 사용자 정보 로드 실패: ${error}`)
      }
    }

    loadUser()
  }, [])

  // 페이지 로드 시 자동으로 상권 데이터 로드
  useEffect(() => {
    console.log('🏗️ 상권 데이터 자동 로드 useEffect 실행')
    setDebugInfo('🏗️ 상권 데이터 자동 로드 useEffect 실행')
    if (user) {
      console.log('👤 사용자 정보 있음, 상권 데이터 로드 시작')
      setDebugInfo('👤 사용자 정보 있음, 상권 데이터 로드 시작')
      loadAreasWithPartners()
    } else {
      setDebugInfo('❌ 사용자 정보 없음 - 데이터 로드 안함')
    }
  }, [user, filters]) // user와 filters가 변경될 때마다 실행


  // 필터 변경 핸들러 (홈화면과 동일)
  const handleFilterChange = (key: keyof typeof filters, value: string | null) => {
    updateFilter(key, value)
  }

  // 검색 핸들러 (FilterPanel용)
  const handleSearch = () => {
    console.log('🔍 FilterPanel 검색 버튼 클릭됨!')
    alert('🔍 FilterPanel 검색 버튼 클릭됨!')
    loadAreasWithPartners()
  }




  // 상권 데이터 로드 (서버에서 거래처 수 계산됨)
  const loadAreasWithPartners = async () => {
      console.log('📍 loadAreasWithPartners 시작')
      setDebugInfo('📍 상권 데이터 로딩 시작...')
      
      try {
        setLoading(true)
        console.log('⏳ 로딩 상태 시작')
        setDebugInfo('⏳ 로딩 상태 시작')
        
        // areas-service를 사용하여 salesTerritory 정보 + 거래처 수 포함된 데이터 로드
        const token = localStorage.getItem('token')
        console.log('🔑 토큰 확인:', token ? '있음' : '없음')
        
        const areasData = await loadAreasData(filters, token || undefined)
        
        // 간단한 alert로 결과 확인
        if (areasData.length > 0) {
          const firstArea = areasData[0]
          alert(`🎯 상권 데이터 로딩 완료!\n총 ${areasData.length}개 상권\n첫 번째 상권: ${firstArea.name}\n거래처 수: ${firstArea.partnerCount || 0}개`)
        } else {
          alert('❌ 상권 데이터가 없습니다!')
        }
        
        // 상권 데이터 state 업데이트
        processAreasData(areasData)
        
      } catch (areasError) {
        alert(`❌ API 호출 실패!\n에러: ${(areasError as Error).message || '알 수 없는 오류'}\n테스트 데이터로 대체합니다.`)
        console.error('❌ 상권 데이터 로드 실패 (CORS 문제):', areasError)
        
        // CORS 문제로 상권 데이터 로드 실패 시 테스트 데이터 사용
        const testAreasData = [
          {
            id: '1',
            name: '테스트 상권 1',
            coordinates: [
              [126.975, 37.565],  // [lng, lat] 형식
              [126.980, 37.565],
              [126.980, 37.570],
              [126.975, 37.570],
              [126.975, 37.565]
            ],
            isActive: true,
            partnerCount: 5, // 테스트 거래처 수
            salesTerritory: {
              territoryId: 1,
              branchName: '테스트지사',
              officeName: '테스트지점',
              managerName: '김관리자',
              managerEmployeeId: 'MGR001',
              sido: '서울특별시',
              gungu: '강남구',
              admNm: '테스트상권'
            }
          },
          {
            id: '2', 
            name: '테스트 상권 2',
            coordinates: [
              [126.976, 37.566],
              [126.981, 37.566], 
              [126.981, 37.571],
              [126.976, 37.571],
              [126.976, 37.566]
            ],
            isActive: true,
            partnerCount: 0, // 담당자 없는 영역은 0개
            salesTerritory: null
          }
        ]
        console.log('🧪 테스트 상권 데이터 사용:', testAreasData.length, '개')
        processAreasData(testAreasData)
      } finally {
        setLoading(false)
        console.log('⏳ 로딩 상태 종료')
      }
  }

  // 상권 데이터 처리 함수
  const processAreasData = (areasData: any[]) => {
    console.log('✅ 상권 데이터 처리 시작 - 서버에서 거래처 수 계산됨')
    
    // 지도용 데이터 변환
    const mapAreasData = areasData.map((area: any) => {
      return {
        id: area.id,
        name: area.name,
        coordinates: area.coordinates,
        color: '#667eea',
        strokeColor: '#667eea',
        strokeWeight: 2,
        opacity: 0.2,
        data: {
          ...area,
          // 서버에서 계산된 거래처 수 사용
          partnerCount: area.partnerCount || 0,
          // 더미 데이터로 managersInArea 설정
          managersInArea: [],
          managerCount: area.salesTerritory ? 1 : 0,
          properties: area.properties
        }
      }
    })
    
    // 수정된 상권 정보로 업데이트
    const updatedAreasData = mapAreasData.map((mapArea: any) => mapArea.data)
    
    setMapAreas(mapAreasData)
    setAreas(updatedAreasData as any)
    console.log('✅ 상권 데이터 state 업데이트 완료:', updatedAreasData.length, '개')
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

  console.log('🎨 AreasPage 렌더링 중...')
  
  return React.createElement('div',
    { style: { padding: '20px', maxWidth: '1200px', margin: '0 auto' } },
    
    // 헤더
    React.createElement('div',
      { style: { marginBottom: '30px' } },
      React.createElement('div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
        React.createElement('h1', 
          { style: { margin: 0, fontSize: '28px', color: '#333' } }, 
          '상권 관리'
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
            showMapView ? '목록 보기' : '지도 보기'
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
            '새 상권 추가'
          )
        )
      ),
      React.createElement('p', 
        { style: { color: '#666', margin: 0 } }, 
        '상권 정보를 조회하고 관리합니다.'
      )
    ),

    // 필터 패널 (홈화면과 동일)
    React.createElement(FilterPanel, {
      options,
      filters,
      onFilterChange: handleFilterChange,
      onReset: resetFilters,
      onSearch: handleSearch,
      loading: loading,
      user: user
    }),

    // 디버그 정보 표시
    React.createElement('div',
      { 
        style: { 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #dee2e6',
          fontSize: '14px',
          color: '#495057'
        } 
      },
      React.createElement('strong', null, '디버그: '),
      debugInfo
    ),

    // 검색어 및 추가 액션 영역
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
      React.createElement('div', 
        { 
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
              { style: { width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden' } },
              React.createElement(KakaoMap, {
                width: '100%',
                height: '300px',
                staticMode: true,
                disableControls: true,
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
              React.createElement('h4', { style: { margin: '0 0 10px 0', fontSize: '14px', color: '#333' } }, '담당자별 마커 색상'),
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