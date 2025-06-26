import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

// 마커 데이터 인터페이스
interface MarkerData {
  id: string | number;
  latitude: number;
  longitude: number;
  title?: string;
  content?: string;
  type?: 'partner' | 'area' | 'custom';
  rtmChannel?: string; // RTM 채널 (업소, 매장 등)
  markerColor?: string; // 마커 색상
  markerImage?: {
    src: string;
    size: { width: number; height: number };
    options?: { offset?: { x: number; y: number } };
  };
  data?: any; // 추가 데이터
}

// 영역 데이터 인터페이스
interface AreaData {
  id: string | number;
  name: string;
  coordinates?: number[][];
  topojson?: any;
  color?: string;
  strokeColor?: string;
  strokeWeight?: number;
  opacity?: number;
  data?: any;
}

interface KakaoMapProps {
  width?: string;
  height?: string;
  latitude?: number;
  longitude?: number;
  level?: number;
  markers?: MarkerData[];
  areas?: AreaData[];
  showAreaBounds?: boolean;
  onMarkerClick?: (marker: MarkerData) => void;
  onAreaClick?: (area: AreaData) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onInfoWindowButtonClick?: (marker: MarkerData) => void;
  staticMode?: boolean; // 정적 모드 (이동, 확대/축소 비활성화)
  disableControls?: boolean; // 컨트롤 숨기기
  fitBounds?: boolean; // 자동 범위 조정
  disableMarkerCentering?: boolean; // 마커 중심 조정 비활성화
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  width = '100%',
  height = '500px',
  latitude = 37.5665,
  longitude = 126.9780,
  level = 3,
  markers = [],
  areas = [],
  showAreaBounds = true,
  onMarkerClick,
  onAreaClick,
  onMapClick,
  onInfoWindowButtonClick,
  staticMode = false,
  disableControls = false,
  fitBounds = false,
  disableMarkerCentering = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const markersDataRef = useRef<MarkerData[]>([]); // 마커 데이터 저장용
  const polygonsRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const areaTooltipRef = useRef<HTMLDivElement | null>(null); // 영역용 툴팁
  const lastClickedMarkerRef = useRef<string | number | null>(null);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapContainer.current || !window.kakao || !window.kakao.maps) {
        console.error('카카오맵을 로드할 수 없습니다.');
        return;
      }

      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: level
      };

      mapInstance.current = new window.kakao.maps.Map(mapContainer.current, options);
      
      // 성능 최적화 설정
      if (mapInstance.current.setTileAnimation) {
        mapInstance.current.setTileAnimation(false); // 타일 애니메이션 비활성화
      }
      
      // 정적 모드일 때 지도 인터랙션 비활성화
      if (staticMode) {
        mapInstance.current.setDraggable(false); // 드래그 비활성화
        mapInstance.current.setZoomable(false); // 확대/축소 비활성화
        
        // 더블클릭 확대 비활성화
        window.kakao.maps.event.removeListener(mapInstance.current, 'dblclick', function() {});
      }
      
      // 지도 컨트롤 추가 (정적 모드나 컨트롤 비활성화가 아닐 때만)
      if (!staticMode && !disableControls) {
        const zoomControl = new window.kakao.maps.ZoomControl();
        mapInstance.current.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        mapInstance.current.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);
      }

      // 인포윈도우 생성
      infoWindowRef.current = new window.kakao.maps.InfoWindow({ zIndex: 1 });
      
      // 영역용 커스텀 툴팁 생성
      if (!areaTooltipRef.current) {
        areaTooltipRef.current = document.createElement('div');
        areaTooltipRef.current.id = 'kakao-area-tooltip';
        areaTooltipRef.current.style.cssText = `
          position: fixed;
          padding: 8px 12px;
          background: rgba(0,0,0,0.8);
          color: white;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          pointer-events: none;
          z-index: 999999;
          display: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // body에 직접 추가
        document.body.appendChild(areaTooltipRef.current);
        console.log('툴팁 요소 생성됨 (body에 추가):', areaTooltipRef.current);
      }

      // 지도 클릭 이벤트
      window.kakao.maps.event.addListener(mapInstance.current, 'click', function(mouseEvent: any) {
        if (onMapClick) {
          const latlng = mouseEvent.latLng;
          onMapClick(latlng.getLat(), latlng.getLng());
        }
        // 인포윈도우 닫기
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        
        // 영역 툴팁 숨기기
        if (areaTooltipRef.current) {
          areaTooltipRef.current.style.display = 'none';
        }
      });

      // 줌 레벨 변경 이벤트 (마커 크기 동적 조정)
      if (!staticMode) {
        window.kakao.maps.event.addListener(mapInstance.current, 'zoom_changed', function() {
          // 줌 레벨이 변경되면 마커들을 다시 그림
          updateMarkersSize();
        });
      }
    };

    // 카카오맵 스크립트가 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      initializeMap();
    } else {
      // 스크립트가 아직 로드되지 않았다면 기다림
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao);
          initializeMap();
        }
      }, 100);

      return () => clearInterval(checkKakao);
    }
  }, [latitude, longitude, level]);

  // 줌 레벨에 따른 마커 크기 계산
  const getMarkerSizeByZoom = (zoomLevel: number) => {
    // 줌 레벨 1(가장 멀리) ~ 14(가장 가까이)
    // 줌 레벨이 낮을수록 더 작은 마커, 높을수록 더 큰 마커
    const baseSize = 16; // 기본 크기
    const maxSize = 32;   // 최대 크기
    const minSize = 16;   // 최소 크기
    
    // 줌 레벨을 역순으로 계산 (레벨이 낮을수록 멀리서 보는 것)
    const normalizedZoom = Math.max(1, Math.min(14, zoomLevel));
    const sizeMultiplier = (15 - normalizedZoom) / 14; // 1에서 0까지의 값
    
    // 크기 계산: 줌아웃할수록 작아짐
    const calculatedSize = maxSize - (sizeMultiplier * (maxSize - minSize));
    return Math.max(minSize, Math.min(maxSize, Math.round(calculatedSize)));
  };

  // RTM 채널별 마커 이미지 생성 (줌 레벨 반영)
  const createMarkerImage = (rtmChannel?: string, color: string = '#FF0000', currentZoomLevel?: number) => {
    if (!window.kakao || !window.kakao.maps) return null;

    // 현재 줌 레벨 가져오기 (매개변수가 없으면 지도에서 직접 가져옴)
    const zoomLevel = currentZoomLevel || (mapInstance.current ? mapInstance.current.getLevel() : 6);
    const markerSize = getMarkerSizeByZoom(zoomLevel);
    
    // 다이아몬드는 약간 더 크게
    const diamondSize = Math.round(markerSize * 1.1);

    const markerConfigs: { [key: string]: any } = {
      '업소': {
        shape: 'square',
        size: new window.kakao.maps.Size(markerSize, markerSize),
        offset: new window.kakao.maps.Point(markerSize / 2, markerSize / 2)
      },
      '매장': {
        shape: 'circle',
        size: new window.kakao.maps.Size(markerSize, markerSize),
        offset: new window.kakao.maps.Point(markerSize / 2, markerSize / 2)
      },
      '스피리츠': {
        shape: 'diamond',
        size: new window.kakao.maps.Size(diamondSize, diamondSize),
        offset: new window.kakao.maps.Point(diamondSize / 2, diamondSize / 2)
      },
      'KA': {
        shape: 'triangle',
        size: new window.kakao.maps.Size(markerSize, markerSize),
        offset: new window.kakao.maps.Point(markerSize / 2, markerSize / 2)
      },
      'default': {
        shape: 'diamond',
        size: new window.kakao.maps.Size(diamondSize, diamondSize),
        offset: new window.kakao.maps.Point(diamondSize / 2, diamondSize / 2)
      }
    };

    const config = markerConfigs[rtmChannel || 'default'] || markerConfigs.default;
    
    // SVG 마커 생성 (크기 정보 포함)
    const svg = createSVGMarker(config.shape, color, config.size.width);
    const imageUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    
    return new window.kakao.maps.MarkerImage(imageUrl, config.size, {
      offset: config.offset
    });
  };

  // SVG 마커 생성 함수 (동적 크기 지원)
  const createSVGMarker = (shape: string, color: string, size: number = 24) => {
    // 스트로크 두께를 크기에 따라 조정
    const strokeWidth = Math.max(1, Math.round(size / 12));
    const padding = strokeWidth;
    const innerSize = size - (padding * 2);
    
    switch (shape) {
      case 'square':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" fill="${color}" stroke="#000" stroke-width="${strokeWidth}"/>
        </svg>`;
      case 'circle':
        const radius = innerSize / 2;
        const center = size / 2;
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <circle cx="${center}" cy="${center}" r="${radius}" fill="${color}" stroke="#000" stroke-width="${strokeWidth}"/>
        </svg>`;
      case 'diamond':
        const halfSize = size / 2;
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <path d="M${halfSize} ${padding} L${size - padding} ${halfSize} L${halfSize} ${size - padding} L${padding} ${halfSize} Z" fill="${color}" stroke="#000" stroke-width="${strokeWidth}"/>
        </svg>`;
      case 'triangle':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <path d="M${size / 2} ${padding} L${size - padding} ${size - padding} L${padding} ${size - padding} Z" fill="${color}" stroke="#000" stroke-width="${strokeWidth}"/>
        </svg>`;
      default:
        const defaultRadius = innerSize / 2;
        const defaultCenter = size / 2;
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <circle cx="${defaultCenter}" cy="${defaultCenter}" r="${defaultRadius}" fill="${color}" stroke="#000" stroke-width="${strokeWidth}"/>
        </svg>`;
    }
  };

  // 마커 크기 업데이트 함수 (줌 레벨 변경 시 호출)
  const updateMarkersSize = () => {
    if (!mapInstance.current || markersRef.current.length === 0) return;

    const currentZoom = mapInstance.current.getLevel();
    
    markersRef.current.forEach((marker, index) => {
      const markerData = markersDataRef.current[index];
      if (!markerData) return;

      // RTM 채널이 있는 마커만 크기 조정
      if (markerData.rtmChannel) {
        const newMarkerImage = createMarkerImage(markerData.rtmChannel, markerData.markerColor || '#667eea', currentZoom);
        if (newMarkerImage) {
          marker.setImage(newMarkerImage);
        }
      }
    });
  };

  // 마커 업데이트
  useEffect(() => {
    if (!mapInstance.current || !window.kakao || !window.kakao.maps) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    markersDataRef.current = []; // 마커 데이터도 초기화

    // 새 마커 생성
    markers.forEach(markerData => {
      // 좌표 유효성 검증
      if (!markerData.latitude || !markerData.longitude || 
          isNaN(markerData.latitude) || isNaN(markerData.longitude)) {
        console.warn(`유효하지 않은 좌표: ${markerData.id} - lat: ${markerData.latitude}, lng: ${markerData.longitude}`)
        return
      }
      
      const position = new window.kakao.maps.LatLng(markerData.latitude, markerData.longitude);
      
      const markerOptions: any = {
        position: position,
        map: mapInstance.current
      };

      // 마커 이미지 설정
      if (markerData.markerImage) {
        const markerImage = new window.kakao.maps.MarkerImage(
          markerData.markerImage.src,
          new window.kakao.maps.Size(markerData.markerImage.size.width, markerData.markerImage.size.height),
          markerData.markerImage.options
        );
        markerOptions.image = markerImage;
      } else if (markerData.rtmChannel) {
        // 현재 줌 레벨을 가져와서 마커 크기 결정
        const currentZoom = mapInstance.current.getLevel();
        const markerImage = createMarkerImage(markerData.rtmChannel, markerData.markerColor || '#667eea', currentZoom);
        if (markerImage) {
          markerOptions.image = markerImage;
          // 디버깅: 처음 5개 마커만 로그
          if (markersRef.current.length < 5) {
            console.log(`🎯 마커 이미지 생성: ${markerData.id} - RTM: "${markerData.rtmChannel}", 색상: ${markerData.markerColor}`)
          }
        } else {
          console.warn(`⚠️ 마커 이미지 생성 실패: ${markerData.id} - RTM: "${markerData.rtmChannel}"`)
        }
      } else {
        // 디버깅: rtmChannel이 없는 경우 로그
        if (markersRef.current.length < 5) {
          console.log(`❌ RTM 채널 없음: ${markerData.id} - markerData:`, markerData)
        }
      }

      const marker = new window.kakao.maps.Marker(markerOptions);

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', (event: any) => {
        // 이벤트 전파 중단
        if (event && event.stopPropagation) {
          event.stopPropagation();
        }

        // 중복 클릭 방지 (더 짧은 간격으로 설정)
        if (lastClickedMarkerRef.current === markerData.id) {
          return;
        }
        lastClickedMarkerRef.current = markerData.id;

        // 50ms 후 클릭 제한 해제 (빠른 반응을 위해)
        setTimeout(() => {
          lastClickedMarkerRef.current = null;
        }, 50);

        if (onMarkerClick) {
          onMarkerClick(markerData);
        }

        // 기존 인포윈도우 닫기
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        
        // 영역 툴팁 숨기기
        if (areaTooltipRef.current) {
          areaTooltipRef.current.style.display = 'none';
        }

        // 마커 위치로 지도 중심 이동
        const markerPosition = marker.getPosition();
        const lat = markerPosition.getLat();
        const lng = markerPosition.getLng();
        
        // 짧은 지연 후 마커 위치로 이동 (렌더링 완료 대기)
        setTimeout(() => {
          // 마커 위치를 정확히 중앙에 위치
          const markerPosition = new window.kakao.maps.LatLng(lat, lng);
          
          // 지도 중심을 마커 위치로 부드럽게 이동
          mapInstance.current.panTo(markerPosition);
          
        }, 50);

        // 인포윈도우 표시 (지도 이동과 거의 동시에)
        if (markerData.content && infoWindowRef.current) {
          const content = `
            <div style="padding: 10px; min-width: 150px; position: relative;">
              <style>
                .kakao-infowindow-content img { display: none !important; }
                .kakao-infowindow-content { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; }
              </style>
              <!-- 닫기 버튼 -->
              <button 
                id="close-infowindow-${markerData.id}"
                style="
                  position: absolute;
                  top: 5px;
                  right: 5px;
                  width: 24px;
                  height: 24px;
                  background: rgba(0,0,0,0.1);
                  border: none;
                  border-radius: 50%;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  color: #666;
                  z-index: 10;
                  transition: all 0.2s ease;
                "
                onmouseover="this.style.background='rgba(0,0,0,0.2)'; this.style.color='#333';"
                onmouseout="this.style.background='rgba(0,0,0,0.1)'; this.style.color='#666';"
                title="닫기"
              >×</button>
              ${markerData.content}
            </div>
          `;
          
          // 즉시 인포윈도우 표시
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstance.current, marker);
          
          // 버튼 이벤트 리스너 추가
          setTimeout(() => {
            // 닫기 버튼 이벤트
            const closeButton = document.getElementById(`close-infowindow-${markerData.id}`);
            if (closeButton) {
              closeButton.onclick = (e) => {
                e.stopPropagation();
                infoWindowRef.current.close();
              };
            }

            // 담당자 변경 버튼 이벤트
            const changeButton = document.getElementById(`change-manager-${markerData.id}`);
            if (changeButton && onInfoWindowButtonClick) {
              changeButton.onclick = (e) => {
                e.stopPropagation();
                onInfoWindowButtonClick(markerData);
                infoWindowRef.current.close();
              };
            }
          }, 50);
        }
      });

      markersRef.current.push(marker);
      markersDataRef.current.push(markerData); // 마커 데이터도 함께 저장
    });
  }, [markers, onMarkerClick, onInfoWindowButtonClick]);

  // 영역(폴리곤) 업데이트
  useEffect(() => {
    if (!mapInstance.current || !window.kakao || !window.kakao.maps || !showAreaBounds) return;

    // 기존 폴리곤 제거
    polygonsRef.current.forEach(polygon => polygon.setMap(null));
    polygonsRef.current = [];

    // 새 폴리곤 생성
    console.log(`🗺️ ${areas.length}개 영역 렌더링 시작`)
    areas.forEach((areaData, index) => {
      if (!areaData.coordinates || areaData.coordinates.length < 3) {
        console.warn(`❌ 영역 ${areaData.name}: 좌표 부족 (${areaData.coordinates?.length || 0}개)`)
        return
      }
      
      if (index < 3) { // 처음 3개 영역만 로그
        console.log(`✅ 영역 ${areaData.name}: ${areaData.coordinates.length}개 좌표, 색상 ${areaData.color}`)
      }
      
      const path = areaData.coordinates.map(coord => 
        new window.kakao.maps.LatLng(coord[1], coord[0])
      );

      const polygon = new window.kakao.maps.Polygon({
        map: mapInstance.current,
        path: path,
        strokeWeight: areaData.strokeWeight || 2,
        strokeColor: areaData.strokeColor || areaData.color || '#004c80',
        strokeOpacity: 0.8,
        fillColor: areaData.color || '#004c80',
        fillOpacity: areaData.opacity || 0.3
      });

      // 영역 클릭 이벤트
      window.kakao.maps.event.addListener(polygon, 'click', () => {
        if (onAreaClick) {
          onAreaClick(areaData);
        }
      });

      // 마우스 오버 효과 및 adm_nm 표시
      window.kakao.maps.event.addListener(polygon, 'mouseover', () => {
        polygon.setOptions({ fillOpacity: 0.5 });
        
        // adm_nm 표시 (salesTerritory 또는 properties에서 가져오기)
        const admNm = areaData.data?.salesTerritory?.admNm || 
                     areaData.data?.properties?.adm_nm || 
                     areaData.name;
        
        console.log('영역 마우스 오버:', {
          areaName: areaData.name,
          salesTerritory: areaData.data?.salesTerritory,
          properties: areaData.data?.properties,
          admNm: admNm,
          tooltipElement: areaTooltipRef.current
        })
        
        if (areaTooltipRef.current && admNm) {
          areaTooltipRef.current.textContent = admNm;
          areaTooltipRef.current.style.display = 'block';
          areaTooltipRef.current.style.visibility = 'visible';
          
          console.log('툴팁 표시됨:', {
            display: areaTooltipRef.current.style.display,
            visibility: areaTooltipRef.current.style.visibility,
            content: areaTooltipRef.current.textContent
          });
        }
      });
      
      // 전역 마우스 이동 이벤트로 툴팁 위치 업데이트
      const handleMouseMove = (e: MouseEvent) => {
        if (areaTooltipRef.current && areaTooltipRef.current.style.display === 'block') {
          areaTooltipRef.current.style.left = `${e.clientX + 10}px`;
          areaTooltipRef.current.style.top = `${e.clientY - 30}px`;
        }
      };
      
      document.addEventListener('mousemove', handleMouseMove);


      window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
        polygon.setOptions({ fillOpacity: areaData.opacity || 0.3 });
        
        // 툴팁 숨기기
        if (areaTooltipRef.current) {
          areaTooltipRef.current.style.display = 'none';
          areaTooltipRef.current.style.visibility = 'hidden';
          console.log('툴팁 숨김');
        }
      });

      polygonsRef.current.push(polygon);
    });

    // fitBounds가 활성화되고 영역이 있을 때 자동 범위 조정
    if (fitBounds && areas.length > 0) {
      setTimeout(() => {
        const bounds = new window.kakao.maps.LatLngBounds();
        let hasValidCoords = false;

        areas.forEach(areaData => {
          if (areaData.coordinates && areaData.coordinates.length > 0) {
            areaData.coordinates.forEach(coord => {
              bounds.extend(new window.kakao.maps.LatLng(coord[1], coord[0]));
              hasValidCoords = true;
            });
          }
        });

        if (hasValidCoords) {
          // 패딩을 줄여서 영역이 화면에 꽉 차도록 설정
          mapInstance.current.setBounds(bounds, 10); // 최소한의 패딩만 적용
          
          // 추가 줌 조정 없이 setBounds가 계산한 최적 레벨 유지
          setTimeout(() => {
            const currentLevel = mapInstance.current.getLevel();
            console.log(`지도 범위 자동 조정 완료 (최적 레벨: ${currentLevel})`);
          }, 200);
        }
      }, 100);
    }
  }, [areas, showAreaBounds, onAreaClick, fitBounds]);

  // 지도 범위 조정 (새로운 마커 데이터 로드 시)
  const previousMarkersData = useRef<string>('');
  
  useEffect(() => {
    if (!mapInstance.current || !window.kakao || !window.kakao.maps) return;
    if (markers.length === 0 || disableMarkerCentering) return;

    // 마커 데이터의 변경을 감지 (ID와 위치 기반)
    const currentMarkersData = markers.map(m => `${m.id}-${m.latitude}-${m.longitude}`).sort().join('|');
    
    if (currentMarkersData !== previousMarkersData.current) {
      // 마커들의 중심점 계산하여 지도 중앙 이동
      let validMarkersCount = 0
      let totalLat = 0;
      let totalLng = 0;
      
      markers.forEach(marker => {
        if (marker.latitude && marker.longitude && 
            !isNaN(marker.latitude) && !isNaN(marker.longitude)) {
          totalLat += marker.latitude;
          totalLng += marker.longitude;
          validMarkersCount++
        }
      });
      
      if (validMarkersCount > 0) {
        const centerLat = totalLat / validMarkersCount;
        const centerLng = totalLng / validMarkersCount;
        const centerPosition = new window.kakao.maps.LatLng(centerLat, centerLng);
        
        // 지연을 두고 지도 중심 이동 (마커 렌더링 완료 후)
        setTimeout(() => {
          mapInstance.current.panTo(centerPosition);
        }, 300);
      }
      
      // 마커 데이터 업데이트
      previousMarkersData.current = currentMarkersData;
    }
  }, [markers, disableMarkerCentering])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (areaTooltipRef.current && areaTooltipRef.current.parentNode) {
        areaTooltipRef.current.parentNode.removeChild(areaTooltipRef.current);
        areaTooltipRef.current = null;
      }
    };
  }, []);

  return React.createElement('div', {
    ref: mapContainer,
    style: {
      width: width,
      height: height,
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      transform: 'translate3d(0,0,0)', // 강제 GPU 가속
      backfaceVisibility: 'hidden', // 크롬 최적화
      perspective: '1000px', // 3D 렌더링 최적화
      WebkitTransform: 'translate3d(0,0,0)', // 웹킷 엔진 최적화
      WebkitBackfaceVisibility: 'hidden'
    }
  });
};

export default KakaoMap;