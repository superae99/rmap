import React from 'react'

const GuidePage = () => {
  return React.createElement('div',
    { style: { padding: '20px', maxWidth: '1200px', margin: '0 auto' } },
    
    // 헤더
    React.createElement('div',
      { 
        style: { 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '30px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        } 
      },
      React.createElement('h1',
        { 
          style: { 
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          } 
        },
        '영업 상권 정보 시스템 사용자 가이드'
      ),
      React.createElement('p',
        { 
          style: { 
            fontSize: '1.2rem',
            color: '#6c757d',
            marginBottom: '20px'
          } 
        },
        '시스템의 모든 기능을 효율적으로 활용하는 방법을 안내합니다.'
      ),
      React.createElement('div',
        { 
          style: { 
            display: 'inline-block',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '12px 30px',
            borderRadius: '50px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600'
          } 
        },
        '📚 종합 사용 가이드'
      )
    ),

    // 목차
    React.createElement('div',
      { 
        style: { 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        } 
      },
      React.createElement('h2',
        { 
          style: { 
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '20px',
            borderBottom: '2px solid #e9ecef',
            paddingBottom: '10px'
          } 
        },
        '📋 목차'
      ),
      React.createElement('div',
        { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' } },
        
        React.createElement('div',
          { style: { padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #667eea' } },
          React.createElement('strong', { style: { color: '#667eea' } }, '1. 홈 화면'),
          React.createElement('br'),
          React.createElement('span', { style: { color: '#6c757d', fontSize: '14px' } }, '지도 보기, 필터링, 거래처 검색')
        ),
        
        React.createElement('div',
          { style: { padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #28a745' } },
          React.createElement('strong', { style: { color: '#28a745' } }, '2. 거래처 관리'),
          React.createElement('br'),
          React.createElement('span', { style: { color: '#6c757d', fontSize: '14px' } }, '거래처 등록, 수정, 삭제, 엑셀 관리')
        ),
        
        React.createElement('div',
          { style: { padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #ffc107' } },
          React.createElement('strong', { style: { color: '#ffc107' } }, '3. 상권 관리'),
          React.createElement('br'),
          React.createElement('span', { style: { color: '#6c757d', fontSize: '14px' } }, '상권 조회, 생성, 편집, 지도 보기')
        ),
        
        React.createElement('div',
          { style: { padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #dc3545' } },
          React.createElement('strong', { style: { color: '#dc3545' } }, '4. 권한 관리'),
          React.createElement('br'),
          React.createElement('span', { style: { color: '#6c757d', fontSize: '14px' } }, '사용자 권한, 접근 제어, 데이터 보안')
        )
      )
    ),

    // 1. 홈 화면 섹션
    React.createElement('div',
      { 
        style: { 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        } 
      },
      React.createElement('h2',
        { 
          style: { 
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#667eea',
            marginBottom: '20px',
            borderBottom: '2px solid #667eea',
            paddingBottom: '10px'
          } 
        },
        '🏠 1. 홈 화면'
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '🗺️ 지도 기능'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057', marginBottom: '20px' } },
        React.createElement('li', null, React.createElement('strong', null, '지도 보기:'), ' 전체 거래처와 상권을 지도에서 한눈에 확인'),
        React.createElement('li', null, React.createElement('strong', null, '마커 클릭:'), ' 거래처 정보 팝업 확인 및 담당자 변경 가능'),
        React.createElement('li', null, React.createElement('strong', null, '영역 표시:'), ' 상권 경계선과 담당자별 색상 구분'),
        React.createElement('li', null, React.createElement('strong', null, '자동 범위:'), ' 필터링 결과에 따라 지도 범위 자동 조정')
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '🔍 필터링 기능'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057', marginBottom: '20px' } },
        React.createElement('li', null, React.createElement('strong', null, '지사 필터:'), ' 특정 지사의 거래처만 조회'),
        React.createElement('li', null, React.createElement('strong', null, '지점 필터:'), ' 선택한 지점 소속 거래처 확인'),
        React.createElement('li', null, React.createElement('strong', null, '담당자 필터:'), ' 개별 담당자의 거래처 목록 조회'),
        React.createElement('li', null, React.createElement('strong', null, '초기화:'), ' 모든 필터를 한 번에 제거')
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '🎯 담당자 변경'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057' } },
        React.createElement('li', null, React.createElement('strong', null, '권한 확인:'), ' 지점장급 이상만 담당자 변경 가능'),
        React.createElement('li', null, React.createElement('strong', null, '변경 방법:'), ' 거래처 마커 클릭 → 정보창에서 "담당자 변경" 버튼'),
        React.createElement('li', null, React.createElement('strong', null, '즉시 반영:'), ' 변경 즉시 지도와 데이터에 반영')
      )
    ),

    // 2. 거래처 관리 섹션
    React.createElement('div',
      { 
        style: { 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        } 
      },
      React.createElement('h2',
        { 
          style: { 
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#28a745',
            marginBottom: '20px',
            borderBottom: '2px solid #28a745',
            paddingBottom: '10px'
          } 
        },
        '🏢 2. 거래처 관리'
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '📊 거래처 조회'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057', marginBottom: '20px' } },
        React.createElement('li', null, React.createElement('strong', null, '목록 보기:'), ' 카드 형태로 거래처 정보 확인'),
        React.createElement('li', null, React.createElement('strong', null, '검색 기능:'), ' 거래처명, 주소, 담당자로 빠른 검색'),
        React.createElement('li', null, React.createElement('strong', null, '필터링:'), ' 지사/지점/담당자별 세부 조회'),
        React.createElement('li', null, React.createElement('strong', null, '정렬:'), ' 다양한 기준으로 데이터 정렬')
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '➕ 거래처 등록'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057', marginBottom: '20px' } },
        React.createElement('li', null, React.createElement('strong', null, '필수 정보:'), ' 거래처코드, 거래처명, 주소, 좌표'),
        React.createElement('li', null, React.createElement('strong', null, '주소 검색:'), ' 카카오맵 API를 통한 자동 좌표 생성'),
        React.createElement('li', null, React.createElement('strong', null, '담당자 배정:'), ' 등록 시 담당자 자동 또는 수동 배정'),
        React.createElement('li', null, React.createElement('strong', null, '유효성 검사:'), ' 중복 코드, 좌표 유효성 자동 검증')
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '📤📥 엑셀 관리'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057' } },
        React.createElement('li', null, React.createElement('strong', null, '엑셀 내보내기:'), ' 필터링된 거래처 목록을 엑셀로 다운로드'),
        React.createElement('li', null, React.createElement('strong', null, '템플릿 다운로드:'), ' 거래처 등록용 엑셀 템플릿 제공'),
        React.createElement('li', null, React.createElement('strong', null, '일괄 등록:'), ' 엑셀 파일을 통한 대량 거래처 등록'),
        React.createElement('li', null, React.createElement('strong', null, '데이터 검증:'), ' 업로드 시 자동 데이터 유효성 검사')
      )
    ),

    // 3. 상권 관리 섹션
    React.createElement('div',
      { 
        style: { 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        } 
      },
      React.createElement('h2',
        { 
          style: { 
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#ffc107',
            marginBottom: '20px',
            borderBottom: '2px solid #ffc107',
            paddingBottom: '10px'
          } 
        },
        '🗺️ 3. 상권 관리'
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '🔍 상권 조회'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057', marginBottom: '20px' } },
        React.createElement('li', null, React.createElement('strong', null, '목록/지도 보기:'), ' 카드 형태 또는 지도에서 상권 확인'),
        React.createElement('li', null, React.createElement('strong', null, '자동 범위 조정:'), ' 조회된 상권에 맞게 지도 범위 자동 설정'),
        React.createElement('li', null, React.createElement('strong', null, '상권 정보:'), ' 영역 내 거래처 수, 담당자 현황 표시'),
        React.createElement('li', null, React.createElement('strong', null, '담당자 현황:'), ' 직접 담당, 관련 구역, 미배정 상태 구분')
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '🎨 상권 생성/편집'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057', marginBottom: '20px' } },
        React.createElement('li', null, React.createElement('strong', null, '영역 그리기:'), ' 지도에서 클릭으로 상권 경계 설정'),
        React.createElement('li', null, React.createElement('strong', null, '색상 설정:'), ' 상권별 고유 색상 및 투명도 조정'),
        React.createElement('li', null, React.createElement('strong', null, '정보 입력:'), ' 상권명, 설명, 담당자 정보 설정'),
        React.createElement('li', null, React.createElement('strong', null, '미리보기:'), ' 설정한 영역을 실시간으로 지도에서 확인')
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '📍 상세 정보'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057' } },
        React.createElement('li', null, React.createElement('strong', null, '영역 분석:'), ' 상권 내 거래처 자동 집계'),
        React.createElement('li', null, React.createElement('strong', null, '담당자 목록:'), ' 영역 내 활동하는 담당자 현황'),
        React.createElement('li', null, React.createElement('strong', null, '상권 통계:'), ' 거래처 수, 담당자 수 등 종합 정보'),
        React.createElement('li', null, React.createElement('strong', null, '지도 연동:'), ' 상세보기에서 해당 상권 지도 표시')
      )
    ),

    // 4. 권한 관리 섹션
    React.createElement('div',
      { 
        style: { 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        } 
      },
      React.createElement('h2',
        { 
          style: { 
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#dc3545',
            marginBottom: '20px',
            borderBottom: '2px solid #dc3545',
            paddingBottom: '10px'
          } 
        },
        '🔐 4. 권한 관리'
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '👥 사용자 권한 체계'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057', marginBottom: '20px' } },
        React.createElement('li', null, React.createElement('strong', { style: { color: '#dc3545' } }, '시스템관리자:'), ' 모든 기능 접근, 시스템 설정 변경'),
        React.createElement('li', null, React.createElement('strong', { style: { color: '#ffc107' } }, '스탭권한:'), ' 모든 데이터 조회 가능, 생성/수정/삭제 불가'),
        React.createElement('li', null, React.createElement('strong', { style: { color: '#28a745' } }, '지점장:'), ' 담당자 변경, 소속 지점 데이터 관리'),
        React.createElement('li', null, React.createElement('strong', { style: { color: '#17a2b8' } }, '일반사용자:'), ' 기본 조회 및 개인 담당 거래처 관리')
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '🛡️ 데이터 보안'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057', marginBottom: '20px' } },
        React.createElement('li', null, React.createElement('strong', null, 'JWT 인증:'), ' 안전한 토큰 기반 사용자 인증'),
        React.createElement('li', null, React.createElement('strong', null, '권한별 필터링:'), ' 사용자 권한에 따른 데이터 접근 제어'),
        React.createElement('li', null, React.createElement('strong', null, '세션 관리:'), ' 자동 로그아웃 및 세션 만료 처리'),
        React.createElement('li', null, React.createElement('strong', null, '감사 로그:'), ' 중요 작업에 대한 이력 관리')
      ),
      
      React.createElement('h3',
        { style: { fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px', marginTop: '25px' } },
        '⚠️ 주의사항'
      ),
      React.createElement('ul',
        { style: { lineHeight: '1.8', color: '#495057' } },
        React.createElement('li', null, React.createElement('strong', null, '비밀번호 관리:'), ' 정기적인 비밀번호 변경 권장'),
        React.createElement('li', null, React.createElement('strong', null, '권한 남용 금지:'), ' 부여된 권한 범위 내에서만 시스템 사용'),
        React.createElement('li', null, React.createElement('strong', null, '데이터 보호:'), ' 개인정보 및 영업 기밀 정보 보호 의무'),
        React.createElement('li', null, React.createElement('strong', null, '로그아웃:'), ' 사용 종료 시 반드시 로그아웃 실행')
      )
    ),

    // 연락처 섹션
    React.createElement('div',
      { 
        style: { 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          padding: '30px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 15px 35px rgba(102, 126, 234, 0.3)'
        } 
      },
      React.createElement('h2',
        { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px' } },
        '📞 문의 및 지원'
      ),
      React.createElement('p',
        { style: { fontSize: '1.1rem', marginBottom: '20px', opacity: '0.9' } },
        '시스템 사용 중 문의사항이나 기술적 문제가 발생하면 언제든지 연락주세요.'
      ),
      React.createElement('div',
        { style: { display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' } },
        React.createElement('div',
          { style: { background: 'rgba(255,255,255,0.2)', padding: '15px 25px', borderRadius: '10px' } },
          React.createElement('strong', { style: { display: 'block', marginBottom: '5px' } }, '시스템 관리자'),
          React.createElement('span', { style: { fontSize: '14px' } }, '내선: 0000')
        ),
        React.createElement('div',
          { style: { background: 'rgba(255,255,255,0.2)', padding: '15px 25px', borderRadius: '10px' } },
          React.createElement('strong', { style: { display: 'block', marginBottom: '5px' } }, '기술 지원'),
          React.createElement('span', { style: { fontSize: '14px' } }, 'IT팀: 0000')
        )
      )
    )
  )
}

export default GuidePage