import React, { useState } from 'react'
import { KakaoMap } from '../components/map/KakaoMap'
import { FilterPanel } from '../components/common/FilterPanel'
import { useFilters } from '../hooks/useFilters'
import { partnerAPI } from '../services/api'
import { loadAreasData } from '../utils/areaLoader'

interface Partner {
  partnerCode: string
  partnerName: string
  channel?: string
  rtmChannel?: string
  currentManagerName?: string
  latitude?: number
  longitude?: number
  businessAddress?: string
  isActive: boolean
}

interface ProcessedArea {
  id: string
  name: string
  coordinates: { lat: number; lng: number }[]
  properties?: Record<string, any>
  isActive: boolean
}

const HomePage = () => {
  console.log('🏠 HomePage 컴포넌트 렌더링됨')
  
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

  // RTM 채널 필터 상태 (기본적으로 모든 채널 표시)
  const [rtmChannelFilters, setRtmChannelFilters] = useState({
    '업소': true,
    '매장': true,
    '스피리츠': true,
    'KA': true
  })

  // 새로운 필터링 시스템 사용
  const { options, filters, updateFilter, resetFilters } = useFilters()

  // 담당자별 색상 생성 함수
  const getManagerColor = (managerName: string | null | undefined): string => {
    if (!managerName) return '#999999' // 담당자 없음 - 회색
    
    const colorPalette = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#F4D03F'
    ]
    
    let hash = 0
    for (let i = 0; i < managerName.length; i++) {
      hash = managerName.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colorPalette.length
    return colorPalette[index]
  }

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
    console.log(`🔄 RTM 채널 토글: ${channel}, 현재 상태:`, rtmChannelFilters[channel])
    setRtmChannelFilters(prev => {
      const newFilters = {
        ...prev,
        [channel]: !prev[channel]
      }
      console.log('🔄 새 필터 상태:', newFilters)
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

      console.log(`✅ 데이터 로드 완료: 거래처 ${partnersData.length || (partnersData.partners?.length || 0)}개, 영역 ${areasData.length}개`)

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
        
        console.log('📊 채널 통계:')
        console.log('원본 채널:', channelStats)
        console.log('RTM 채널:', rtmStats)
        console.log('총 거래처 수:', dataArray.length)
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
      const channelVisible = rtmChannelFilters[rtmChannel as keyof typeof rtmChannelFilters] !== false
      
      // 첫 번째 거래처만 디버깅 로그
      if (partners.indexOf(partner) === 0) {
        console.log('🔍 첫 번째 거래처 필터링 체크:')
        console.log('  RTM 채널:', rtmChannel)
        console.log('  현재 필터 상태:', rtmChannelFilters)
        console.log('  채널 표시 여부:', channelVisible)
      }
      
      return validCoords && channelVisible
    })
    .map((partner, index) => {
      const managerColor = getManagerColor(partner.currentManagerName)
      const lat = Number(partner.latitude)
      const lng = Number(partner.longitude)
      
      // RTM 채널 사용 (실제 데이터 확인)
      const rtmChannel = partner.rtmChannel || mapChannelToRTM(partner.channel)
      
      // 디버깅용 로그 (처음 10개만)
      if (index < 10) {
        console.log(`마커 ${index + 1} - ${partner.partnerCode}: ${partner.partnerName}`)
        console.log(`  → 위도: ${lat}, 경도: ${lng}`)
        console.log(`  → 원본 채널: "${partner.channel}"`)
        console.log(`  → RTM 채널: "${partner.rtmChannel}" (DB값)`)
        console.log(`  → 매핑 결과: "${mapChannelToRTM(partner.channel)}" (매핑값)`)
        console.log(`  → 최종 RTM 채널: "${rtmChannel}"`)
        console.log(`  → 마커 색상: ${managerColor}`)
        console.log(`  → 예상 마커 형태: ${rtmChannel === '업소' ? '네모' : rtmChannel === '매장' ? '동그라미' : rtmChannel === '스피리츠' ? '다이아몬드' : rtmChannel === 'KA' ? '삼각형' : '기본(다이아몬드)'}`)
        console.log('---')
      }
      
      return {
        id: partner.partnerCode,
        latitude: lat,
        longitude: lng,
        title: partner.partnerName,
        markerColor: managerColor,
        rtmChannel: rtmChannel,
        content: `
          <div style="min-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; margin: -10px -10px 15px -10px; border-radius: 8px 8px 0 0;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${partner.partnerName}</h3>
              <div style="font-size: 13px; opacity: 0.9; margin-top: 5px;">코드: ${partner.partnerCode}</div>
            </div>
            <div style="padding: 0 5px;">
              <div style="display: flex; flex-direction: column; gap: 8px;">
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
              </div>
            </div>
          </div>
        `
      }
    })

  // 지도에 표시할 영역 데이터 변환
  const mapAreas = areas.map(area => ({
    id: area.id,
    name: area.name,
    coordinates: area.coordinates,
    properties: area.properties
  }))

  // 마커 클릭 핸들러
  const handleMarkerClick = (markerId: string) => {
    const partner = partners.find(p => p.partnerCode === markerId)
    if (partner) {
      setSelectedPartner(partner)
    }
  }

  // 인포윈도우 버튼 클릭 핸들러
  const handleInfoWindowButtonClick = (markerId: string, buttonType: string) => {
    if (buttonType === 'changeManager') {
      const partner = partners.find(p => p.partnerCode === markerId)
      if (partner) {
        setSelectedPartner(partner)
        setShowManagerChangeModal(true)
      }
    }
  }

  console.log('🖥️ HomePage 렌더링')
  console.log('📊 현재 마커 개수:', markers.length, '/ 전체 거래처:', partners.length)
  console.log('🔧 현재 RTM 필터 상태:', rtmChannelFilters)
  
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
        ),
        // 통계 섹션 안에 테스트 추가
        React.createElement('div', { 
          style: { 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: 'red', 
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          } 
        }, 'RTM 테스트 - 이게 보이나요?')
      ),

      // RTM 채널 필터 (단순 테스트)
      React.createElement('div', 
        { 
          style: { 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '2px solid red' // 디버깅용 빨간 테두리
          } 
        },
        React.createElement('h3', { style: { margin: '0 0 10px 0', fontSize: '16px', color: 'red' } }, '📍 마커 채널 필터 (테스트)'),
        React.createElement('div', null, '테스트 텍스트 - 이게 보이나요?'),
        React.createElement('label', null,
          React.createElement('input', {
            type: 'checkbox',
            checked: rtmChannelFilters['업소'],
            onChange: () => {
              console.log('✅ 업소 체크박스 클릭됨!')
              toggleRtmChannel('업소')
            }
          }),
          ' 업소 테스트'
        )
      ),

      // 영역 표시 토글
      React.createElement('div',
        { style: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' } },
        React.createElement('label',
          { 
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              fontSize: '16px',
              gap: '10px'
            } 
          },
          React.createElement('input', {
            type: 'checkbox',
            checked: showAreas,
            onChange: (e) => setShowAreas(e.target.checked),
            style: { transform: 'scale(1.2)' }
          }),
          '🗺️ 영업구역 표시'
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
    )
  )
}

export default HomePage