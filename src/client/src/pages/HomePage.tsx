import React, { useState } from 'react'
import KakaoMap from '../components/map/KakaoMap'
import FilterPanel from '../components/common/FilterPanel'
import { useFilters } from '../hooks/useFilters'
import { partnerAPI } from '../services/api'
import { loadAreasData } from '../utils/areaLoader'

interface Partner {
  partnerCode: string
  partnerName: string
  channel?: string
  rtmChannel?: string
  currentManagerName?: string
  currentManagerEmployeeId?: string
  officeName?: string
  latitude?: number
  longitude?: number
  businessAddress?: string
  isActive: boolean
}

interface ProcessedArea {
  id: string
  name: string
  coordinates: number[][]
  properties?: Record<string, any>
  isActive: boolean
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

const HomePage = () => {
  
  const [partners, setPartners] = useState<Partner[]>([])
  const [areas, setAreas] = useState<ProcessedArea[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [showAreas, setShowAreas] = useState(true)
  const [showManagerChangeModal, setShowManagerChangeModal] = useState(false)
  const [newManagerInfo, setNewManagerInfo] = useState({
    employeeId: '',
    name: '',
    reason: ''
  })
  const [availableManagers, setAvailableManagers] = useState<any[]>([])
  const [showAllManagers, setShowAllManagers] = useState(false)
  const [customManagerColors, setCustomManagerColors] = useState<{[key: string]: string}>({})

  // RTM 채널 필터 상태 (기본적으로 모든 채널 표시)
  const [rtmChannelFilters, setRtmChannelFilters] = useState({
    '업소': true,
    '매장': true,
    '스피리츠': true,
    'KA': true
  })

  // 새로운 필터링 시스템 사용
  const { options, filters, updateFilter, resetFilters } = useFilters()


  // 매니저 기반 마커 및 영역 색상 함수 (통일된 색상)
  const getManagerColor = (managerEmployeeId?: string): string => {
    if (!managerEmployeeId) return '#667eea'
    
    // 커스텀 색상이 설정되어 있으면 우선 사용
    if (customManagerColors[managerEmployeeId]) {
      return customManagerColors[managerEmployeeId]
    }
    
    // 기본 해시 기반 색상 생성
    let hash = 0
    for (let i = 0; i < managerEmployeeId.length; i++) {
      hash = managerEmployeeId.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    // 더 다양하고 구분되는 색상 팔레트
    const colors = [
      '#FF6B6B', // 빨간색
      '#4ECDC4', // 청록색
      '#45B7D1', // 파란색
      '#96CEB4', // 연두색
      '#FECA57', // 주황색
      '#FF9FF3', // 핑크색
      '#54A0FF', // 하늘색
      '#5F27CD', // 보라색
      '#00D2D3', // 민트색
      '#FF9F43', // 오렌지색
      '#A55EEA', // 연보라색
      '#26DE81', // 연두색
      '#FD79A8', // 분홍색
      '#FDCB6E', // 노란색
      '#6C5CE7', // 자주색
      '#74B9FF'  // 하늘색
    ]
    return colors[Math.abs(hash) % colors.length]
  }

  // 담당자 색상 변경 함수
  const changeManagerColor = (employeeId: string, newColor: string) => {
    setCustomManagerColors(prev => ({
      ...prev,
      [employeeId]: newColor
    }))
    
    // localStorage에 저장하여 새로고침 시에도 유지
    const savedColors = JSON.parse(localStorage.getItem('managerColors') || '{}')
    savedColors[employeeId] = newColor
    localStorage.setItem('managerColors', JSON.stringify(savedColors))
  }

  // 색상 초기화 함수
  const resetManagerColor = (employeeId: string) => {
    setCustomManagerColors(prev => {
      const newColors = { ...prev }
      delete newColors[employeeId]
      return newColors
    })
    
    // localStorage에서도 제거
    const savedColors = JSON.parse(localStorage.getItem('managerColors') || '{}')
    delete savedColors[employeeId]
    localStorage.setItem('managerColors', JSON.stringify(savedColors))
  }

  // 컴포넌트 마운트 시 저장된 색상 로드
  React.useEffect(() => {
    const savedColors = JSON.parse(localStorage.getItem('managerColors') || '{}')
    setCustomManagerColors(savedColors)
  }, [])

  // 채널을 RTM 채널로 매핑하는 함수
  const mapChannelToRTM = (channel: string | undefined): string => {
    if (!channel) return '업소' // 기본값
    
    // 공백 제거 및 정규화
    const normalizedChannel = channel.trim()
    
    // 채널 값에 따른 RTM 채널 매핑
    const channelMapping: { [key: string]: string } = {
      // 업소 (일반 음식점)
      '대중식당': '업소',
      '치킨/호프': '업소',
      '한식당': '업소',
      '중식당': '업소',
      '일식당': '업소',
      '양식당': '업소',
      '기타요식': '업소',
      
      // 매장 (편의점, 마트 등)
      'CVS': '매장',
      '편의점': '매장',
      '마트': '매장',
      '슈퍼마켓': '매장',
      
      // 스피리츠 (주류 전문점)
      '주류전문': '스피리츠',
      '와인바': '스피리츠',
      '칵테일바': '스피리츠',
      
      // KA (기타)
      '기타': 'KA',
      'ETC': 'KA'
    }
    
    const rtmChannel = channelMapping[normalizedChannel] || '업소' // 매핑되지 않은 경우 기본값
    
    // 처음 몇 개의 채널만 로그 출력 (디버깅용)
    if (!channelMapping[normalizedChannel] && normalizedChannel) {
      console.warn(`⚠️ 매핑되지 않은 채널: "${normalizedChannel}" → 기본값 "업소" 사용`)
    }
    
    return rtmChannel
  }

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof typeof filters, value: string | null) => {
    updateFilter(key, value)
  }

  // RTM 채널 필터 토글
  const toggleRtmChannel = (channel: '업소' | '매장' | '스피리츠' | 'KA') => {
    setRtmChannelFilters(prev => {
      const newFilters = {
        ...prev,
        [channel]: !prev[channel]
      }
      return newFilters
    })
  }

  // 검색 핸들러 (FilterPanel에서 사용)
  const handleSearch = async () => {
    try {
      setLoading(true)
      
      // 거래처 데이터 로드
      const partnersData = await partnerAPI.getPartners(filters)
      setPartners(partnersData.partners || partnersData)
      
      // 영역 데이터 로드
      const areasData = await loadAreasData(filters, localStorage.getItem('token') || undefined)
      setAreas(areasData)


      // RTM 채널 통계 출력 (디버깅용)
      if (partnersData.partners || partnersData.length) {
        const dataArray = partnersData.partners || partnersData
        const channelStats: { [key: string]: number } = {}
        const rtmStats: { [key: string]: number } = {}
        
        dataArray.forEach((partner: Partner) => {
          const channel = partner.channel || '기타'
          const rtmChannel = partner.rtmChannel || '없음'
          
          channelStats[channel] = (channelStats[channel] || 0) + 1
          rtmStats[rtmChannel] = (rtmStats[rtmChannel] || 0) + 1
        })
        
      }
      
    } catch (error) {
      console.error('데이터 로드 실패:', error)
      setPartners([])
      setAreas([])
    } finally {
      setLoading(false)
    }
  }

  // 마커 데이터 변환 (유효한 좌표가 있는 거래처만 + RTM 채널 필터링)
  const markers = partners
    .filter(partner => {
      const lat = Number(partner.latitude)
      const lng = Number(partner.longitude)
      // 한국 영역 내의 유효한 좌표인지 확인
      const validCoords = lat && lng && 
             lat >= 33 && lat <= 43 &&  // 한국 위도 범위
             lng >= 124 && lng <= 132   // 한국 경도 범위
      
      // RTM 채널 필터링
      const rtmChannel = partner.rtmChannel || mapChannelToRTM(partner.channel)
      const isValidRtmChannel = ['업소', '매장', '스피리츠', 'KA'].includes(rtmChannel)
      const channelVisible = isValidRtmChannel ? rtmChannelFilters[rtmChannel as keyof typeof rtmChannelFilters] : true
      
      // 첫 번째 거래처만 디버깅 로그
      if (partners.indexOf(partner) === 0) {
      }
      
      return validCoords && channelVisible
    })
    .map((partner, index) => {
      const managerColor = getManagerColor(partner.currentManagerEmployeeId)
      const lat = Number(partner.latitude)
      const lng = Number(partner.longitude)
      
      // RTM 채널 사용 (실제 데이터 확인)
      const rtmChannel = partner.rtmChannel || mapChannelToRTM(partner.channel)
      
      // 디버깅용 로그 (처음 10개만)
      if (index < 10) {
      }
      
      return {
        id: partner.partnerCode,
        latitude: lat,
        longitude: lng,
        title: partner.partnerName,
        markerColor: managerColor,
        rtmChannel: rtmChannel,
        content: `
          <div style="min-width: 320px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; margin: -15px -15px 15px -15px; border-radius: 8px 8px 0 0;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${partner.partnerName}</h3>
              <div style="font-size: 13px; opacity: 0.9; margin-top: 5px;">코드: ${partner.partnerCode}</div>
            </div>
            <div style="padding: 0 5px;">
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="background: #f1f3f4; padding: 4px 8px; border-radius: 12px; font-size: 12px; color: #5f6368;">채널</span>
                  <span style="font-weight: 500; color: #333;">${partner.channel || '기타'}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="background: #e8f5e8; padding: 4px 8px; border-radius: 12px; font-size: 12px; color: #137333;">담당자</span>
                  <span style="font-weight: 500; color: #333;">${partner.currentManagerName || '미지정'}</span>
                </div>
                ${partner.businessAddress ? `
                  <div style="margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #667eea;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 2px;">사업장 주소</div>
                    <div style="font-size: 13px; color: #333; line-height: 1.4;">${partner.businessAddress}</div>
                  </div>
                ` : ''}
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                  <button 
                    id="change-manager-${partner.partnerCode}"
                    style="
                      width: 100%;
                      padding: 10px 15px;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      border: none;
                      border-radius: 6px;
                      font-size: 14px;
                      font-weight: 500;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
                    "
                    onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(102, 126, 234, 0.4)';"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(102, 126, 234, 0.3)';"
                    title="담당자 변경"
                  >
                    👤 담당자 변경
                  </button>
                </div>
              </div>
            </div>
          </div>
        `
      }
    })

  // 지도에 표시할 영역 데이터 변환 (담당자별 색상 통일)
  const mapAreas = areas.map(area => {
    // salesTerritory 정보에서 담당자 확인
    const salesTerritory = area.salesTerritory
    let areaColor = '#004c80' // 기본 색상
    
    if (salesTerritory?.managerEmployeeId) {
      // 담당자 ID 기반으로 마커와 동일한 색상 적용
      areaColor = getManagerColor(salesTerritory.managerEmployeeId)
      
      // 디버깅 로그 (처음 5개 영역만)
      if (areas.indexOf(area) < 5) {
      }
    }
    

    return {
      id: area.id,
      name: area.name,
      coordinates: area.coordinates, // 이미 number[][] 형식
      color: areaColor,
      data: { salesTerritory: area.salesTerritory, properties: area.properties }
    }
  })

  // 마커 클릭 핸들러
  const handleMarkerClick = (marker: any) => {
    const markerId = typeof marker === 'string' ? marker : marker.id
    const partner = partners.find(p => p.partnerCode === markerId)
    if (partner) {
      setSelectedPartner(partner)
    }
  }

  // 담당자 목록 가져오기 함수
  const loadAvailableManagers = async (partnerOfficeName?: string) => {
    try {
      const filterOptions = await partnerAPI.getFilterOptions()
      
      // 같은 지점의 담당자만 필터링
      let filteredManagers = filterOptions.managers || []
      if (partnerOfficeName) {
        filteredManagers = filteredManagers.filter((manager: any) => 
          manager.officeName === partnerOfficeName
        )
      }
      
      setAvailableManagers(filteredManagers)
    } catch (error) {
      console.error('❌ 담당자 목록 로드 실패:', error)
      setAvailableManagers([])
    }
  }

  // 인포윈도우 버튼 클릭 핸들러
  const handleInfoWindowButtonClick = async (marker: any) => {
    const markerId = typeof marker === 'string' ? marker : marker.id
    const partner = partners.find(p => p.partnerCode === markerId)
    if (partner) {
      setSelectedPartner(partner)
      
      // 해당 거래처의 지점명으로 담당자 목록 로드
      await loadAvailableManagers(partner.officeName)
      
      setShowManagerChangeModal(true)
    } else {
    }
  }

  
  return React.createElement('div', 
    { style: { width: '100%', height: 'calc(100vh - 60px)', display: 'flex' } },
    
    // 왼쪽 사이드바
    React.createElement('aside', 
      { style: { 
        width: '350px', 
        borderRight: '1px solid #ddd', 
        padding: '15px',
        backgroundColor: '#f8f9fa',
        overflowY: 'auto'
      } },
      React.createElement('h2', { style: { margin: '0 0 20px 0' } }, '🏢 영업 상권 관리'),
      React.createElement('p', { style: { color: '#666', marginBottom: '20px' } }, 
        '영업 담당자별 상권 지역을 지도에서 확인하세요'
      ),

      // 필터 패널
      React.createElement(FilterPanel, {
        options,
        filters,
        onFilterChange: handleFilterChange,
        onReset: resetFilters,
        onSearch: handleSearch,
        loading
      }),
      
      // 통계 정보
      React.createElement('div', 
        { style: { 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        } },
        React.createElement('h3', { style: { margin: '0 0 10px 0', fontSize: '16px' } }, '📊 현재 통계'),
        React.createElement('div', { style: { display: 'flex', gap: '10px' } },
          React.createElement('div', { style: { flex: 1, textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '20px', fontWeight: 'bold', color: '#667eea' } }, 
              loading ? '-' : partners.length
            ),
            React.createElement('div', { style: { fontSize: '12px', color: '#666' } }, '전체 거래처')
          ),
          React.createElement('div', { style: { flex: 1, textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '20px', fontWeight: 'bold', color: '#4ECDC4' } }, 
              loading ? '-' : areas.length
            ),
            React.createElement('div', { style: { fontSize: '12px', color: '#666' } }, '영업 상권')
          )
        )
      ),

      // RTM 채널 필터
      React.createElement('div', 
        { 
          style: { 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          } 
        },
        React.createElement('h3', { style: { margin: '0 0 15px 0', fontSize: '16px' } }, '📍 RTM 채널별 마커'),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } },
          // 업소 채널 (네모)
          React.createElement('label', 
            { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } },
            React.createElement('input', {
              type: 'checkbox',
              checked: rtmChannelFilters['업소'],
              onChange: () => toggleRtmChannel('업소')
            }),
            React.createElement('div', { 
              style: { 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#000', 
                border: '1px solid #333'
              } 
            }),
            React.createElement('span', { style: { fontSize: '14px' } }, '업소')
          ),
          // 매장 채널 (동그라미)
          React.createElement('label', 
            { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } },
            React.createElement('input', {
              type: 'checkbox',
              checked: rtmChannelFilters['매장'],
              onChange: () => toggleRtmChannel('매장')
            }),
            React.createElement('div', { 
              style: { 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#000', 
                border: '1px solid #333',
                borderRadius: '50%'
              } 
            }),
            React.createElement('span', { style: { fontSize: '14px' } }, '매장')
          ),
          // 스피리츠 채널 (다이아몬드)
          React.createElement('label', 
            { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } },
            React.createElement('input', {
              type: 'checkbox',
              checked: rtmChannelFilters['스피리츠'],
              onChange: () => toggleRtmChannel('스피리츠')
            }),
            React.createElement('div', { 
              style: { 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#000', 
                border: '1px solid #333',
                transform: 'rotate(45deg)'
              } 
            }),
            React.createElement('span', { style: { fontSize: '14px' } }, '스피리츠')
          ),
          // KA 채널 (삼각형)
          React.createElement('label', 
            { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } },
            React.createElement('input', {
              type: 'checkbox',
              checked: rtmChannelFilters['KA'],
              onChange: () => toggleRtmChannel('KA')
            }),
            React.createElement('div', { 
              style: { 
                width: '0', 
                height: '0', 
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '12px solid #000',
                marginLeft: '3px',
                marginRight: '3px'
              } 
            }),
            React.createElement('span', { style: { fontSize: '14px' } }, 'KA')
          )
        )
      ),

      // 영역 표시 토글
      React.createElement('div',
        { style: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' } },
        React.createElement('h3', { style: { margin: '0 0 15px 0', fontSize: '16px' } }, '🗺️ 지도 설정'),
        React.createElement('label',
          { 
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              fontSize: '14px',
              gap: '10px',
              marginBottom: '10px'
            } 
          },
          React.createElement('input', {
            type: 'checkbox',
            checked: showAreas,
            onChange: (e) => setShowAreas(e.target.checked),
            style: { transform: 'scale(1.1)' }
          }),
          '영업 상권 표시'
        ),
        React.createElement('div', 
          { style: { fontSize: '12px', color: '#666', marginLeft: '30px' } },
          `현재 ${showAreas ? areas.length : 0}개 상권이 표시 중입니다.`
        )
      ),

      // 담당별 마커 색상 정보
      React.createElement('div',
        { style: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' } },
        React.createElement('div', 
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' } },
          React.createElement('h3', { style: { margin: '0', fontSize: '16px' } }, '👥 담당별 마커 색상'),
          !loading && partners.length > 0 && (() => {
            const totalManagers = partners.map(p => p.currentManagerEmployeeId).filter((v, i, arr) => v && arr.indexOf(v) === i).length
            return totalManagers > 8 ? React.createElement('button',
              {
                onClick: () => setShowAllManagers(!showAllManagers),
                style: {
                  background: 'none',
                  border: '1px solid #667eea',
                  color: '#667eea',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                },
                onMouseOver: (e: any) => {
                  e.target.style.backgroundColor = '#667eea'
                  e.target.style.color = 'white'
                },
                onMouseOut: (e: any) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = '#667eea'
                }
              },
              showAllManagers ? '접기' : '더보기'
            ) : null
          })()
        ),
        React.createElement('div', 
          { style: { fontSize: '12px', color: '#666', marginBottom: '10px' } },
          `현재 ${loading ? '-' : partners.map(p => p.currentManagerEmployeeId).filter((v, i, arr) => v && arr.indexOf(v) === i).length}명의 담당자가 활동 중입니다.`
        ),
        // 담당자별 색상 표시
        !loading && partners.length > 0 && React.createElement('div',
          { style: { 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px', 
            maxHeight: showAllManagers ? '200px' : '120px', 
            overflowY: 'auto' 
          } },
          ...partners
            .map(p => p.currentManagerEmployeeId)
            .filter((id, index, arr) => id && arr.indexOf(id) === index) // 중복 제거
            .slice(0, showAllManagers ? undefined : 8) // 더보기 상태에 따라 전체 또는 8명
            .map(employeeId => {
              const manager = partners.find(p => p.currentManagerEmployeeId === employeeId)
              const color = getManagerColor(employeeId)
              const partnerCount = partners.filter(p => p.currentManagerEmployeeId === employeeId).length
              return React.createElement('div',
                { 
                  key: employeeId,
                  style: { 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '8px', 
                    fontSize: '11px',
                    padding: '3px 0'
                  } 
                },
                React.createElement('div',
                  { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                  React.createElement('div',
                    {
                      style: {
                        position: 'relative',
                        display: 'inline-block'
                      }
                    },
                    React.createElement('input',
                      {
                        type: 'color',
                        value: color,
                        onChange: (e: any) => changeManagerColor(employeeId, e.target.value),
                        style: {
                          width: '16px',
                          height: '16px',
                          border: '1px solid #999',
                          borderRadius: '0px',
                          cursor: 'pointer',
                          padding: '0',
                          outline: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none'
                        },
                        title: '색상 변경'
                      }
                    )
                  ),
                  React.createElement('span', 
                    { style: { color: '#333', flex: 1 } }, 
                    `${manager?.currentManagerName || '이름미상'} (${employeeId})`
                  ),
                  customManagerColors[employeeId] && React.createElement('button',
                    {
                      onClick: () => resetManagerColor(employeeId),
                      style: {
                        background: 'none',
                        border: 'none',
                        color: '#999',
                        fontSize: '10px',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: '2px'
                      },
                      title: '기본 색상으로 복원',
                      onMouseOver: (e: any) => {
                        e.target.style.backgroundColor = '#f0f0f0'
                        e.target.style.color = '#666'
                      },
                      onMouseOut: (e: any) => {
                        e.target.style.backgroundColor = 'transparent'
                        e.target.style.color = '#999'
                      }
                    },
                    '↺'
                  )
                ),
                React.createElement('span',
                  { style: { fontSize: '10px', color: '#666' } },
                  `${partnerCount}개`
                )
              )
            })
        ),
        // 더보기 상태가 아니고 8명 초과일 때만 "외 X명 더..." 표시
        !showAllManagers && partners.map(p => p.currentManagerEmployeeId).filter((v, i, arr) => v && arr.indexOf(v) === i).length > 8 && 
          React.createElement('div', 
            { style: { fontSize: '10px', color: '#888', marginTop: '5px', textAlign: 'center' } },
            `외 ${partners.map(p => p.currentManagerEmployeeId).filter((v, i, arr) => v && arr.indexOf(v) === i).length - 8}명 더...`
          ),
        React.createElement('div', 
          { style: { fontSize: '10px', color: '#888', marginTop: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '8px' } },
          '💡 색상을 클릭하면 수동으로 변경할 수 있습니다. ↺ 버튼으로 기본 색상 복원 가능'
        )
      )
    ),

    // 오른쪽 지도 영역
    React.createElement('main', 
      { style: { flex: 1, position: 'relative' } },
      React.createElement(KakaoMap, {
        width: '100%',
        height: '100%',
        markers: markers,
        areas: showAreas ? mapAreas : [],
        onMarkerClick: handleMarkerClick,
        onInfoWindowButtonClick: handleInfoWindowButtonClick,
        level: 6
      })
    ),

    // 담당자 변경 모달
    showManagerChangeModal && React.createElement('div',
      {
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        },
        onClick: () => setShowManagerChangeModal(false)
      },
      React.createElement('div',
        {
          style: {
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          },
          onClick: (e: any) => e.stopPropagation()
        },
        React.createElement('h3', 
          { style: { margin: '0 0 20px 0', fontSize: '20px', color: '#333' } }, 
          '담당자 변경'
        ),
        React.createElement('div',
          { style: { marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' } },
          React.createElement('div', { style: { fontSize: '14px', color: '#666', marginBottom: '5px' } }, '거래처 정보'),
          React.createElement('div', { style: { fontSize: '16px', fontWeight: 'bold', color: '#333' } }, 
            selectedPartner?.partnerName || ''
          ),
          React.createElement('div', { style: { fontSize: '14px', color: '#666', marginTop: '5px' } }, 
            `코드: ${selectedPartner?.partnerCode || ''} | 지점: ${selectedPartner?.officeName || '정보없음'}`
          )
        ),
        React.createElement('div',
          { style: { marginBottom: '20px' } },
          React.createElement('label', 
            { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } },
            `새 담당자 선택 (${selectedPartner?.officeName || '해당'} 지점)`
          ),
          React.createElement('select',
            {
              value: newManagerInfo.employeeId,
              onChange: (e: any) => {
                const selectedEmployeeId = e.target.value
                const selectedManager = availableManagers.find(m => m.employeeId === selectedEmployeeId)
                setNewManagerInfo(prev => ({ 
                  ...prev, 
                  employeeId: selectedEmployeeId,
                  name: selectedManager?.employeeName || ''
                }))
              },
              style: {
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }
            },
            React.createElement('option', { value: '' }, '담당자를 선택하세요'),
            ...availableManagers.map(manager => 
              React.createElement('option', 
                { key: manager.employeeId, value: manager.employeeId },
                `${manager.employeeName} (${manager.employeeId})`
              )
            )
          )
        ),
        React.createElement('div',
          { style: { marginBottom: '20px' } },
          React.createElement('label', 
            { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } },
            '선택된 담당자 정보'
          ),
          React.createElement('div',
            {
              style: {
                padding: '10px',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                backgroundColor: '#f8f9fa',
                fontSize: '14px'
              }
            },
            newManagerInfo.employeeId ? 
              `이름: ${newManagerInfo.name} | 사번: ${newManagerInfo.employeeId}` : 
              '담당자를 선택해주세요'
          )
        ),
        React.createElement('div',
          { style: { marginBottom: '25px' } },
          React.createElement('label', 
            { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' } },
            '변경 사유'
          ),
          React.createElement('textarea',
            {
              value: newManagerInfo.reason,
              onChange: (e: any) => setNewManagerInfo(prev => ({ ...prev, reason: e.target.value })),
              placeholder: '담당자 변경 사유를 입력하세요',
              rows: 3,
              style: {
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }
            }
          )
        ),
        React.createElement('div',
          { style: { display: 'flex', gap: '10px', justifyContent: 'flex-end' } },
          React.createElement('button',
            {
              onClick: () => {
                setShowManagerChangeModal(false)
                setNewManagerInfo({ employeeId: '', name: '', reason: '' })
              },
              style: {
                padding: '10px 20px',
                border: '1px solid #ddd',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }
            },
            '취소'
          ),
          React.createElement('button',
            {
              onClick: async () => {
                if (!selectedPartner || !newManagerInfo.employeeId || !newManagerInfo.name || !newManagerInfo.reason) {
                  alert('모든 필드를 입력해주세요.')
                  return
                }

                try {

                  // API 호출
                  await partnerAPI.changeManager(selectedPartner.partnerCode, {
                    currentManagerEmployeeId: newManagerInfo.employeeId,
                    currentManagerName: newManagerInfo.name,
                    managerChangeReason: newManagerInfo.reason
                  })

                  alert(`담당자 변경이 완료되었습니다.\n거래처: ${selectedPartner.partnerName}\n새 담당자: ${newManagerInfo.name}`)
                  
                  // 모달 닫기 및 폼 초기화
                  setShowManagerChangeModal(false)
                  setNewManagerInfo({ employeeId: '', name: '', reason: '' })
                  
                  // 데이터 새로고침 (검색 다시 실행)
                  await handleSearch()
                  
                } catch (error) {
                  console.error('담당자 변경 실패:', error)
                  alert('담당자 변경에 실패했습니다. 다시 시도해주세요.')
                }
              },
              style: {
                padding: '10px 20px',
                border: 'none',
                backgroundColor: '#667eea',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }
            },
            '변경'
          )
        )
      )
    )
  )
}

export default HomePage