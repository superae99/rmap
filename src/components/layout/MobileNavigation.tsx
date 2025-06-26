import React, { useState } from 'react'

interface MobileNavigationProps {
  currentPage: string
  user: any
  onNavigate: (page: string) => void
  onLogout: () => void
  onPasswordChange: () => void
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPage,
  user,
  onNavigate,
  onLogout,
  onPasswordChange
}) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', icon: '🏠', label: '홈' },
    { id: 'partners', icon: '🏢', label: '거래처' },
    { id: 'areas', icon: '🗺️', label: '상권' }
  ]

  const toggleMenu = () => setMenuOpen(!menuOpen)

  return (
    <>
      {/* 상단 고정 헤더 */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#667eea',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            📱 상권정보
          </h1>
        </div>
        
        <button
          onClick={toggleMenu}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '18px',
            minWidth: '40px',
            minHeight: '40px'
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* 사이드 메뉴 오버레이 */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1500
          }}
          onClick={toggleMenu}
        />
      )}

      {/* 사이드 메뉴 */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: menuOpen ? 0 : '-280px',
        width: '280px',
        height: '100vh',
        backgroundColor: 'white',
        transition: 'right 0.3s ease',
        zIndex: 2000,
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 메뉴 헤더 */}
        <div style={{
          padding: '20px 16px',
          backgroundColor: '#667eea',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>메뉴</h3>
            <button
              onClick={toggleMenu}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>
          {user && (
            <div style={{ marginTop: '12px', fontSize: '14px', opacity: 0.9 }}>
              {user.employeeName || user.employeeId}<br/>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                {user.jobTitle || user.position || '직원'}
              </span>
            </div>
          )}
        </div>

        {/* 네비게이션 메뉴 */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id)
                setMenuOpen(false)
              }}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: 'none',
                backgroundColor: currentPage === item.id ? '#f0f4ff' : 'transparent',
                color: currentPage === item.id ? '#667eea' : '#333',
                fontSize: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderLeft: currentPage === item.id ? '4px solid #667eea' : '4px solid transparent'
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* 하단 액션 버튼들 */}
        <div style={{ padding: '16px', borderTop: '1px solid #eee' }}>
          <button
            onClick={() => {
              onPasswordChange()
              setMenuOpen(false)
            }}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              color: '#495057',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
          >
            🔑 비밀번호 변경
          </button>
          
          <button
            onClick={() => {
              onLogout()
              setMenuOpen(false)
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#dc3545',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
          >
            🚪 로그아웃
          </button>
        </div>
      </div>

      {/* 하단 고정 탭 네비게이션 */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #eee',
        display: 'flex',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)'
      }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: currentPage === item.id ? '#667eea' : '#666',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              minHeight: '60px'
            }}
          >
            <span style={{ 
              fontSize: '20px',
              filter: currentPage === item.id ? 'none' : 'grayscale(0.5)'
            }}>
              {item.icon}
            </span>
            <span style={{ fontWeight: currentPage === item.id ? 'bold' : 'normal' }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* 콘텐츠 영역을 위한 여백 */}
      <div style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: '100vh' }}>
        {/* 페이지 콘텐츠가 여기에 들어감 */}
      </div>
    </>
  )
}

export default MobileNavigation