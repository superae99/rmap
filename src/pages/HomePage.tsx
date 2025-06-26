import React, { useState, useEffect } from 'react'
import KakaoMap from '../components/map/KakaoMap'
import { partnerAPI } from '../services/api'
import { loadAreasData, type ProcessedArea } from '../services/areas-service'
import type { Partner } from '../types/partner.types'
import { useFilters } from '../hooks/useFilters'
import FilterPanel from '../components/common/FilterPanel'

interface Area {
  id: number
  name: string
  coordinates?: Array<{ lat: number; lng: number }>
  topojson?: any
  color?: string
  strokeColor?: string
  strokeWeight?: number
  fillOpacity?: number
  description?: string
  admCd?: string
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
  console.log('🏠 HomePage 컴포넌트 렌더링됨')
  console.log('🏠 HomePage - React.createElement 방식으로 렌더링 중')
  const [partners, setPartners] = useState<Partner[]>([])
  const [areas, setAreas] = useState<ProcessedArea[]>([])
  const [loading, setLoading] = useState(false)
  
  // 디버깅: loading 상태 확인
  console.log('현재 loading 상태:', loading)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [showAreas, setShowAreas] = useState(true)
  const [showManagerChangeModal, setShowManagerChangeModal] = useState(false)
  const [newManagerInfo, setNewManagerInfo] = useState({
    employeeId: '',
    name: '',
    reason: ''
  })
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // RTM 채널 필터 상태 (기본적으로 모든 채널 표시)
  const [rtmChannelFilters, setRtmChannelFilters] = useState({
    '업소': true,
    '매장': true,
    '스피리츠': true,
    'KA': true
  })

  // 새로운 필터링 시스템 사용
  const { options, filters, updateFilter, resetFilters } = useFilters()

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      console.log('🏠 HomePage 모바일 감지:', mobile, 'width:', window.innerWidth);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 담당자별 색상 생성 함수
  const getManagerColor = (managerName: string | null | undefined): string => {
    if (!managerName) return '#999999' // 담당자 없음 - 회색
    
    // 미리 정의된 색상 팔레트 (구분이 쉬운 색상들)
    const colorPalette = [
      '#FF6B6B', // 빨강
      '#4ECDC4', // 청록
      '#45B7D1', // 하늘색
      '#F7DC6F', // 노랑
      '#BB8FCE', // 보라
      '#52C96F', // 초록
      '#F8B739', // 주황
      '#5DADE2', // 파랑
      '#EC7063', // 분홍
      '#58D68D', // 연두
      '#AF7AC5', // 연보라
      '#F5B041', // 연주황
    ]
    
    // 담당자 이름을 기반으로 일관된 색상 선택
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
      '라운지/포차': '업소',
      '이자카야': '업소',
      '횟집': '업소',
      '룸/단란': '업소',
      '고급식당': '업소',
      '라이브/카페': '업소',
      '바': '업소',
      '나이트': '업소',
      '몰트바/라운지': '업소',
      '클럽': '업소',
      '기타': '업소',
      
      // 매장 (소매점)
      '대형 SM': '매장',
      '소형 SM': '매장',
      '초대형 SM': '매장',
      '할인점': '매장',
      'CVS': '매장',
      '프랜차이즈': '매장',
      
      // 스피리츠 (고급 업장)
      '골프장': '스피리츠',
      '호텔': '스피리츠',
      '리조트': '스피리츠',
      
      // KA (특수 업장)
      '특수업장': 'KA'
    }
    
    const rtmChannel = channelMapping[normalizedChannel] || '업소' // 매핑되지 않은 경우 기본값
    
    // 처음 몇 개의 채널만 로그 출력 (디버깅용)
    if (!channelMapping[normalizedChannel] && normalizedChannel) {
      console.warn(`⚠️ 매핑되지 않은 채널: "${normalizedChannel}" → 기본값 "업소" 사용`)
    }
    
    return rtmChannel
  }


  // 영역 데이터 로드 (로그인 사용자만 필터 적용)
  const loadAreas = async () => {
    try {
      console.log('🗺️ 영역 데이터 로딩 시작...')
      
      // 로그인 토큰 확인
      const token = localStorage.getItem('token')
      
      // 토큰이 있으면 필터 적용, 없으면 모든 영역 로드
      const areasData = await loadAreasData(token ? filters : undefined, token || undefined)
      setAreas(areasData)
      console.log(`✅ ${areasData.length}개 영역 로드 완료${token ? ' (필터 적용)' : ' (전체)'}`)
    } catch (error) {
      console.error('영역 데이터 로드 실패:', error)
      setAreas([])
    }
  }

  // 거래처 및 영역 데이터 수동 조회 함수
  const fetchData = async () => {
    console.log('🚀 fetchData 함수 시작됨')
    try {
      setLoading(true)
      console.log('📥 데이터 로딩 시작')
      
      // 거래처와 영역 데이터를 병렬로 로드
      const [partnersResponse] = await Promise.all([
        partnerAPI.getPartners({ 
          limit: 100000,
          ...filters
        }),
        loadAreas() // 영역도 필터에 따라 다시 로드
      ])
      
      const partnersData = partnersResponse.partners || partnersResponse
      setPartners(Array.isArray(partnersData) ? partnersData : [])
      
      // 채널 통계 출력 (디버깅용)
      if (Array.isArray(partnersData) && partnersData.length > 0) {
        const channelStats: { [key: string]: number } = {}
        const rtmStats: { [key: string]: number } = {}
        
        partnersData.forEach((partner: Partner) => {
          const channel = partner.channel || '없음'
          const rtmChannel = partner.rtmChannel || '없음'
          
          channelStats[channel] = (channelStats[channel] || 0) + 1
          rtmStats[rtmChannel] = (rtmStats[rtmChannel] || 0) + 1
        })
        
        console.log('📊 채널 통계:')
        console.log('원본 채널:', channelStats)
        console.log('RTM 채널:', rtmStats)
        console.log('총 거래처 수:', partnersData.length)
      }
      
    } catch (error) {
      console.error('데이터 로드 실패:', error)
      setPartners([])
      setAreas([])
    } finally {
      setLoading(false)
    }
  }

  // 데이터는 조회 버튼 클릭 시에만 로드됨 (초기 자동 로딩 없음)

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
        <div style="
          min-width: 280px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <!-- 헤더 -->
          <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            margin: -10px -10px 15px -10px;
            border-radius: 8px 8px 0 0;
          ">
            <h3 style="
              margin: 0;
              font-size: 18px;
              font-weight: 600;
            ">${partner.partnerName}</h3>
            <div style="
              font-size: 12px;
              opacity: 0.9;
              margin-top: 4px;
            ">${partner.partnerCode}</div>
          </div>
          
          <!-- 정보 섹션 -->
          <div style="padding: 0 5px;">
            <!-- 채널 배지 -->
            <div style="
              display: inline-block;
              padding: 4px 12px;
              background-color: ${partner.channel === '업소' ? '#e3f2fd' : partner.channel === '매장' ? '#f3e5f5' : '#e8f5e8'};
              color: ${partner.channel === '업소' ? '#1976d2' : partner.channel === '매장' ? '#7b1fa2' : '#388e3c'};
              border-radius: 16px;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 15px;
            ">${partner.channel || '기타'}</div>
            
            <!-- 정보 항목들 -->
            <div style="space-y: 12px;">
              ${partner.businessAddress ? `
              <div style="
                display: flex;
                align-items: flex-start;
                margin-bottom: 12px;
              ">
                <div style="
                  width: 20px;
                  height: 20px;
                  background-color: #f0f4ff;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 10px;
                  flex-shrink: 0;
                ">
                  <span style="font-size: 12px;">📍</span>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 11px; color: #666; margin-bottom: 2px;">주소</div>
                  <div style="font-size: 13px; color: #333; line-height: 1.4;">${partner.businessAddress}</div>
                </div>
              </div>
              ` : ''}
              
              ${partner.officeName ? `
              <div style="
                display: flex;
                align-items: flex-start;
                margin-bottom: 12px;
              ">
                <div style="
                  width: 20px;
                  height: 20px;
                  background-color: #f0f4ff;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 10px;
                  flex-shrink: 0;
                ">
                  <span style="font-size: 12px;">🏢</span>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 11px; color: #666; margin-bottom: 2px;">지점 정보</div>
                  <div style="font-size: 13px; color: #333;">${partner.officeName}</div>
                </div>
              </div>
              ` : ''}
              
              <div style="
                display: flex;
                align-items: flex-start;
                margin-bottom: 15px;
              ">
                <div style="
                  width: 20px;
                  height: 20px;
                  background-color: #f0f4ff;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 10px;
                  flex-shrink: 0;
                ">
                  <span style="font-size: 12px;">👤</span>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 11px; color: #666; margin-bottom: 2px;">담당 정보</div>
                  <div style="font-size: 13px; color: #333; font-weight: 500;">${partner.currentManagerName || '미지정'}</div>
                  ${partner.previousManagerName ? `
                    <div style="font-size: 11px; color: #999; margin-top: 4px;">
                      이전: ${partner.previousManagerName}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
            
            <!-- 버튼 -->
            <button 
              id="change-manager-${partner.partnerCode}"
              style="
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              "
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(102, 126, 234, 0.35)';"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(102, 126, 234, 0.25)';"
            >
              <span>👤</span>
              <span>담당자 변경</span>
            </button>
          </div>
        </div>
      `,
        type: 'partner' as const,
        data: partner
      }
    })

  // 영역 데이터 변환 (담당자별 색상 적용)
  const mapAreas = areas.map(area => {
    // 영역에 연결된 담당자 정보에서 색상 결정
    const managerName = area.salesTerritory?.managerName
    const areaColor = getManagerColor(managerName)
    
    console.log(`영역 ${area.name}: 담당자 ${managerName}, 색상 ${areaColor}`) // 디버깅용
    
    return {
      id: area.id,
      name: area.name,
      coordinates: area.coordinates,
      color: areaColor,
      strokeColor: areaColor,
      strokeWeight: 2,
      opacity: 0.2, // 영역은 마커보다 투명하게
      data: area
    }
  })

  // 마커 클릭 핸들러
  const handleMarkerClick = (marker: any) => {
    const partner = marker.data as Partner
    setSelectedPartner(partner)
    // 인포윈도우만 표시됨
  }

  // 인포윈도우 버튼 클릭 핸들러
  const handleInfoWindowButtonClick = (marker: any) => {
    const partner = marker.data as Partner
    setSelectedPartner(partner)
    openManagerChangeModal()
  }


  // 담당자 변경 모달 열기
  const openManagerChangeModal = () => {
    setShowManagerChangeModal(true)
    setNewManagerInfo({
      employeeId: '',
      name: '',
      reason: ''
    })
  }

  // 담당자 변경 모달 닫기
  const closeManagerChangeModal = () => {
    setShowManagerChangeModal(false)
    setNewManagerInfo({
      employeeId: '',
      name: '',
      reason: ''
    })
  }

  // 담당자 변경 처리
  const handleManagerChange = async () => {
    if (!selectedPartner || !newManagerInfo.employeeId || !newManagerInfo.name) {
      alert('담당자 사번과 이름을 입력해주세요.')
      return
    }

    try {
      const updateData = {
        previousManagerEmployeeId: selectedPartner.currentManagerEmployeeId,
        previousManagerName: selectedPartner.currentManagerName,
        currentManagerEmployeeId: newManagerInfo.employeeId,
        currentManagerName: newManagerInfo.name,
        managerChangedDate: new Date().toISOString(),
        managerChangeReason: newManagerInfo.reason
      }

      await partnerAPI.updatePartner(selectedPartner.partnerCode, updateData)
      
      // 로컬 상태 업데이트
      const updatedPartners = partners.map(p => 
        p.partnerCode === selectedPartner.partnerCode 
          ? { ...p, ...updateData }
          : p
      )
      setPartners(updatedPartners)
      
      // 선택된 파트너 정보도 업데이트
      setSelectedPartner({ ...selectedPartner, ...updateData })
      
      alert('✅ 담당자가 변경되었습니다.')
      closeManagerChangeModal()
    } catch (error) {
      console.error('담당자 변경 실패:', error)
      alert('❌ 담당자 변경 중 오류가 발생했습니다.')
    }
  }

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof typeof filters, value: string | null) => {
    updateFilter(key, value)
  }

  // RTM 채널 필터 토글
  const toggleRtmChannel = (channel: '업소' | '매장' | '스피리츠' | 'KA') => {
    setRtmChannelFilters(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }))
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
      
      // 영역 데이터는 이미 setAreas로 설정되므로 추가 처리 불필요
      
    } catch (error) {
      console.error('검색 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isMobile) {
    // 모바일 레이아웃
    return React.createElement('div', 
      { style: { 
        width: '100%', 
        height: '100%', 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      } },
      
      // 모바일 지도 (전체 화면)
      React.createElement('div',
        { style: { width: '100%', height: 'calc(100vh - 140px)', position: 'relative' } },
        React.createElement(KakaoMap, {
          width: '100%',
          height: '100%',
          markers: markers,
          areas: showAreas ? mapAreas : [],
          onMarkerClick: handleMarkerClick,
          latitude: 37.5665,
          longitude: 126.9780,
          level: 8
        })
      ),

      // 모바일 플로팅 액션 버튼
      React.createElement('button',
        {
          onClick: () => setShowMobileFilters(true),
          style: {
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#667eea',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 500
          }
        },
        '🔍'
      ),

      // 모바일 필터 하단 시트
      showMobileFilters && React.createElement('div',
        {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000
          },
          onClick: () => setShowMobileFilters(false)
        }
      ),

      showMobileFilters && React.createElement('div',
        {
          style: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '20px',
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 1001
          }
        },
        React.createElement('div',
          { style: { 
            width: '40px', 
            height: '4px', 
            backgroundColor: '#ddd', 
            borderRadius: '2px', 
            margin: '0 auto 20px',
            cursor: 'pointer'
          },
          onClick: () => setShowMobileFilters(false) },
        ),
        React.createElement('h3', { style: { margin: '0 0 20px 0', textAlign: 'center' } }, '🔍 필터 및 설정'),
        
        // 필터 패널
        React.createElement(FilterPanel, {
          options,
          filters,
          onFilterChange: handleFilterChange,
          onReset: resetFilters,
          onSearch: handleSearch,
          loading
        }),

        // 영역 표시 토글
        React.createElement('div',
          { style: { marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' } },
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
        ),

        // RTM 채널 필터
        React.createElement('div',
          { style: { marginTop: '15px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' } },
          React.createElement('h4', { style: { margin: '0 0 10px 0', fontSize: '14px', color: '#333' } }, '📍 마커 채널 필터'),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' } }, 
            // 업소 체크박스
            React.createElement('label',
              { style: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px', gap: '6px' } },
              React.createElement('input', {
                type: 'checkbox',
                checked: rtmChannelFilters['업소'],
                onChange: () => toggleRtmChannel('업소')
              }),
              '⬜ 업소'
            ),
            // 매장 체크박스
            React.createElement('label',
              { style: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px', gap: '6px' } },
              React.createElement('input', {
                type: 'checkbox',
                checked: rtmChannelFilters['매장'],
                onChange: () => toggleRtmChannel('매장')
              }),
              '⭕ 매장'
            ),
            // 스피리츠 체크박스
            React.createElement('label',
              { style: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px', gap: '6px' } },
              React.createElement('input', {
                type: 'checkbox',
                checked: rtmChannelFilters['스피리츠'],
                onChange: () => toggleRtmChannel('스피리츠')
              }),
              '♦️ 스피리츠'
            ),
            // KA 체크박스
            React.createElement('label',
              { style: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px', gap: '6px' } },
              React.createElement('input', {
                type: 'checkbox',
                checked: rtmChannelFilters['KA'],
                onChange: () => toggleRtmChannel('KA')
              }),
              '🔺 KA'
            )
          )
        ),

        // 통계 정보
        partners.length > 0 && React.createElement('div',
          { style: { marginTop: '20px', padding: '15px', backgroundColor: '#f0f4ff', borderRadius: '8px' } },
          React.createElement('h4', { style: { margin: '0 0 10px 0', fontSize: '14px' } }, '📊 현재 필터 결과'),
          React.createElement('div', { style: { fontSize: '14px', lineHeight: '1.6' } },
            `• 거래처: ${partners.length}개`,
            React.createElement('br'),
            `• 담당자: ${new Set(partners.map(p => p.currentManagerName).filter(Boolean)).size}명`,
            React.createElement('br'),
            `• 영업구역: ${areas.length}개`
          )
        )
      ),

      // 모바일 파트너 상세 모달
      selectedPartner && React.createElement('div',
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
            zIndex: 2000,
            padding: '20px'
          }
        },
        React.createElement('div',
          {
            style: {
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }
          },
          React.createElement('div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
            React.createElement('h3', { style: { margin: 0, fontSize: '18px' } }, '🏢 거래처 정보'),
            React.createElement('button',
              {
                onClick: () => setSelectedPartner(null),
                style: {
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0'
                }
              },
              '×'
            )
          ),
          
          // 거래처 정보 표시 (모바일 최적화)
          React.createElement('div', { style: { lineHeight: '1.6' } },
            React.createElement('div', { style: { marginBottom: '15px' } },
              React.createElement('strong', null, '거래처명: '),
              selectedPartner.partnerName
            ),
            React.createElement('div', { style: { marginBottom: '15px' } },
              React.createElement('strong', null, '코드: '),
              selectedPartner.partnerCode
            ),
            React.createElement('div', { style: { marginBottom: '15px' } },
              React.createElement('strong', null, '채널: '),
              selectedPartner.channel || '기타'
            ),
            React.createElement('div', { style: { marginBottom: '15px' } },
              React.createElement('strong', null, '담당자: '),
              selectedPartner.currentManagerName || '미지정'
            ),
            selectedPartner.businessAddress && React.createElement('div', { style: { marginBottom: '15px' } },
              React.createElement('strong', null, '주소: '),
              selectedPartner.businessAddress
            )
          ),
          
          React.createElement('button',
            {
              onClick: () => setSelectedPartner(null),
              style: {
                width: '100%',
                padding: '12px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                marginTop: '20px'
              }
            },
            '닫기'
          )
        )
      )
    );
  }

  // 데스크톱 레이아웃
  console.log('🖥️ HomePage 데스크톱 레이아웃 렌더링')
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
        onSearch: fetchData,
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

      // RTM 채널 필터 (데스크톱)
      React.createElement('div', 
        { style: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' } },
        React.createElement('h3', { style: { margin: '0 0 10px 0', fontSize: '16px' } }, '📍 마커 채널 필터'),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, 
          // 업소 체크박스
          React.createElement('label',
            { style: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', gap: '8px' } },
            React.createElement('input', {
              type: 'checkbox',
              checked: rtmChannelFilters['업소'],
              onChange: () => toggleRtmChannel('업소')
            }),
            '⬜ 업소 (네모)'
          ),
          // 매장 체크박스
          React.createElement('label',
            { style: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', gap: '8px' } },
            React.createElement('input', {
              type: 'checkbox',
              checked: rtmChannelFilters['매장'],
              onChange: () => toggleRtmChannel('매장')
            }),
            '⭕ 매장 (동그라미)'
          ),
          // 스피리츠 체크박스
          React.createElement('label',
            { style: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', gap: '8px' } },
            React.createElement('input', {
              type: 'checkbox',
              checked: rtmChannelFilters['스피리츠'],
              onChange: () => toggleRtmChannel('스피리츠')
            }),
            '♦️ 스피리츠 (다이아몬드)'
          ),
          // KA 체크박스
          React.createElement('label',
            { style: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', gap: '8px' } },
            React.createElement('input', {
              type: 'checkbox',
              checked: rtmChannelFilters['KA'],
              onChange: () => toggleRtmChannel('KA')
            }),
            '🔺 KA (삼각형)'
          )
        )
      ),

      // 영역 표시 토글
      React.createElement('div',
        { style: { backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px' } },
        React.createElement('h3', { style: { margin: '0 0 10px 0', fontSize: '16px' } }, '🗺️ 지도 설정'),
        React.createElement('label',
          { 
            style: { 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              fontSize: '14px',
              gap: '8px'
            } 
          },
          React.createElement('input', {
            type: 'checkbox',
            checked: showAreas,
            onChange: (e) => setShowAreas(e.target.checked),
            style: { margin: '0' }
          }),
          '영업 상권 표시'
        ),
        showAreas && React.createElement('div',
          { style: { marginTop: '10px', fontSize: '12px', color: '#666' } },
          `현재 ${areas.length}개 상권이 표시 중입니다.`
        )
      ),

      // 담당별 색상 범례
      React.createElement('div',
        { style: { backgroundColor: 'white', padding: '15px', borderRadius: '8px' } },
        React.createElement('h3', { style: { margin: '0 0 10px 0', fontSize: '16px' } }, 
          '👥 담당별 마커 색상',
          React.createElement('span', { style: { fontSize: '12px', fontWeight: 'normal', color: '#666', marginLeft: '8px' } },
            `(${[...new Set(partners.map(p => p.currentManagerName))].filter(Boolean).length}명)`
          )
        ),
        React.createElement('div', { style: { fontSize: '12px', maxHeight: '200px', overflowY: 'auto' } },
          // 담당별 색상 표시 (담당자 인원수 포함)
          [...new Set(partners.map(p => p.currentManagerName))].filter(Boolean).sort().map(managerName => {
            const managerCount = partners.filter(p => p.currentManagerName === managerName).length;
            return React.createElement('div', 
              { 
                key: managerName, 
                style: { 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  gap: '8px'
                } 
              },
              React.createElement('div', {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }
              },
                React.createElement('div', {
                  style: {
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: getManagerColor(managerName),
                    border: '1px solid #ddd'
                  }
                }),
                React.createElement('span', null, managerName)
              ),
              React.createElement('span', { 
                style: { 
                  fontSize: '11px', 
                  color: '#666', 
                  backgroundColor: '#f0f0f0',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '20px',
                  textAlign: 'center'
                } 
              }, managerCount)
            );
          }),
          // 담당자 없음 표시
          partners.some(p => !p.currentManagerName) && React.createElement('div', 
            { 
              style: { 
                display: 'flex', 
                alignItems: 'center', 
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #eee',
                gap: '8px'
              } 
            },
            React.createElement('div', {
              style: {
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#999999',
                border: '1px solid #ddd'
              }
            }),
            React.createElement('span', { style: { color: '#666', fontStyle: 'italic' } }, '담당자 미지정')
          )
        )
      )
    ),
    
    // 메인 컨텐츠 영역
    React.createElement('div', 
      { style: { flex: 1, display: 'flex', flexDirection: 'column' } },
      
      // 헤더
      React.createElement('header', 
        { style: { 
          padding: '20px', 
          borderBottom: '1px solid #ddd',
          backgroundColor: 'white'
        } },
        React.createElement('div', { 
          style: { 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          } 
        },
          React.createElement('h1', { 
            style: { 
              margin: 0, 
              fontSize: '24px',
              '@media (max-width: 768px)': {
                fontSize: '20px'
              }
            } 
          }, '🗺️ 영업 상권 지도'),
          React.createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
            React.createElement('button', 
              { 
                style: { 
                  padding: '8px 16px', 
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                },
                onClick: () => window.location.reload()
              }, 
              '🔄 새로고침'
            )
          )
        )
      ),
      
      // 지도 영역
      React.createElement('main', 
        { style: { flex: 1, position: 'relative' } },
        loading ? 
          React.createElement('div', 
            { style: { 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              fontSize: '18px',
              color: '#666'
            } }, 
            '데이터를 불러오는 중...'
          ) :
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
    ),


    // 담당자 변경 모달
    showManagerChangeModal && selectedPartner && React.createElement('div',
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
          zIndex: 2000
        }
      },
      React.createElement('div',
        {
          style: {
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            width: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        },
        React.createElement('div',
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
          React.createElement('h3', { style: { margin: 0 } }, '👤 담당자 변경'),
          React.createElement('button',
            {
              onClick: closeManagerChangeModal,
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
        React.createElement('div', { style: { marginBottom: '20px' } },
          React.createElement('strong', { style: { display: 'block', marginBottom: '10px' } }, '거래처 정보'),
          React.createElement('div', { style: { backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '14px' } },
            React.createElement('div', null, `거래처명: ${selectedPartner.partnerName}`),
            React.createElement('div', null, `현재 담당자: ${selectedPartner.currentManagerName || '-'}`)
          )
        ),
        React.createElement('div', { style: { marginBottom: '15px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, '새 담당자 사번 *'),
          React.createElement('input', {
            type: 'text',
            value: newManagerInfo.employeeId,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewManagerInfo({ ...newManagerInfo, employeeId: e.target.value }),
            placeholder: '사번 입력',
            style: {
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }
          })
        ),
        React.createElement('div', { style: { marginBottom: '15px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, '새 담당자 이름 *'),
          React.createElement('input', {
            type: 'text',
            value: newManagerInfo.name,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewManagerInfo({ ...newManagerInfo, name: e.target.value }),
            placeholder: '이름 입력',
            style: {
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }
          })
        ),
        React.createElement('div', { style: { marginBottom: '20px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, '변경 사유'),
          React.createElement('textarea', {
            value: newManagerInfo.reason,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setNewManagerInfo({ ...newManagerInfo, reason: e.target.value }),
            placeholder: '변경 사유 입력 (선택사항)',
            rows: 3,
            style: {
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }
          })
        ),
        React.createElement('div', { style: { display: 'flex', gap: '10px' } },
          React.createElement('button',
            {
              onClick: handleManagerChange,
              style: {
                flex: 1,
                padding: '12px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            },
            '변경하기'
          ),
          React.createElement('button',
            {
              onClick: closeManagerChangeModal,
              style: {
                flex: 1,
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }
            },
            '취소'
          )
        )
      )
    )
  )
}

export default HomePage