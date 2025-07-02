import React, { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PartnersPage from './pages/PartnersPage';
import AreasPage from './pages/AreasPage';
import MobileNavigation from './components/layout/MobileNavigation';
import { authAPI } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<any>(null);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      // 토큰 확인
      const token = localStorage.getItem('token');
      
      if (token) {
        setIsAuthenticated(true);
        // 사용자 정보 가져오기
        try {
          const userData = await authAPI.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
          // 토큰이 유효하지 않으면 로그아웃 처리
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
      
      setLoading(false);

      // URL을 항상 루트(/)로 유지
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', '/');
      }
    };

    initializeApp();
  }, []);

  // 페이지 변경 함수 (URL 변경 없이 상태만 변경)
  const navigateTo = (page: string) => {
    setCurrentPage(page);
    // URL은 항상 루트(/)로 유지
  };

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('home');
    // URL은 항상 루트(/)로 유지
  };

  // 비밀번호 변경 모달 열기
  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
  };

  // 비밀번호 변경 모달 닫기
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
  };

  // 비밀번호 변경 처리
  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('모든 필드를 입력해주세요.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      alert('✅ 비밀번호가 성공적으로 변경되었습니다.');
      closePasswordModal();
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      setPasswordError(error.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        로딩 중...
      </div>
    );
  }

  // 인증 상태만으로 페이지 결정 (URL 경로 무시)
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  

  // 네비게이션 바 컴포넌트
  const renderNavigation = () => {
    return (
      <nav style={{
        backgroundColor: '#667eea',
        padding: '0 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '60px'
        }}>
          {/* 왼쪽 영역 - 시스템 제목과 메뉴들 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <h1 style={{ margin: 0, color: 'white', fontSize: '20px' }}>
              영업 상권 정보 시스템
            </h1>
            <div style={{ display: 'flex', gap: '20px' }}>
              <button
                onClick={() => navigateTo('home')}
                style={{
                  background: currentPage === 'home' ? 'rgba(255,255,255,0.3)' : 'none',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                홈
              </button>
              <button
                onClick={() => navigateTo('partners')}
                style={{
                  background: currentPage === 'partners' ? 'rgba(255,255,255,0.3)' : 'none',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                거래처 관리
              </button>
              <button
                onClick={() => navigateTo('areas')}
                style={{
                  background: currentPage === 'areas' ? 'rgba(255,255,255,0.3)' : 'none',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                상권 관리
              </button>
            </div>
          </div>
          {/* 오른쪽 영역 - 사용자 정보와 버튼들 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* 사용자 인사말 */}
            {user && (
              <div style={{ color: 'white', fontSize: '14px' }}>
                {`${user.employeeName || user.employeeId} ${user.jobTitle || user.position || '직원'}님, 안녕하세요.`}
              </div>
            )}
            {/* 비밀번호 변경 버튼 */}
            <button
              onClick={openPasswordModal}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              비밀번호 변경
            </button>
            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>
    );
  };

  // 페이지 렌더링
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'partners':
        return <PartnersPage />;
      case 'areas':
        return <AreasPage />;
      default:
        return <HomePage />;
    }
  };

  // 모바일인 경우 다른 레이아웃 사용
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', position: 'relative' }}>
        <MobileNavigation
          currentPage={currentPage}
          user={user}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          onPasswordChange={openPasswordModal}
        />
        {/* 모바일에서는 패딩 없이 페이지 렌더링 (각 페이지가 자체적으로 처리) */}
        {renderCurrentPage()}
        
        {/* 비밀번호 변경 모달 (모바일용) */}
        {showPasswordModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              width: '100%',
              maxWidth: '350px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
              {/* 모바일 비밀번호 변경 폼 (간소화) */}
              <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>비밀번호 변경</h3>
              
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="현재 비밀번호"
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="새 비밀번호 (최소 6자)"
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="새 비밀번호 확인"
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              
              {passwordError && (
                <div style={{ color: '#ff6b6b', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                  {passwordError}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={closePasswordModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: passwordLoading ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {passwordLoading ? '변경 중...' : '변경'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 데스크톱 레이아웃
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {renderNavigation()}
      {renderCurrentPage()}
      
      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            width: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>비밀번호 변경</h3>
              <button
                onClick={closePasswordModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            {/* 현재 비밀번호 입력 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>현재 비밀번호 *</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="현재 비밀번호 입력"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {/* 새 비밀번호 입력 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>새 비밀번호 *</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="새 비밀번호 입력 (최소 6자)"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {/* 새 비밀번호 확인 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>새 비밀번호 확인 *</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="새 비밀번호 다시 입력"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {/* 에러 메시지 */}
            {passwordError && (
              <div style={{ color: '#ff6b6b', fontSize: '14px', marginBottom: '15px' }}>
                {passwordError}
              </div>
            )}
            
            {/* 버튼들 */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handlePasswordChange}
                disabled={passwordLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: passwordLoading ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {passwordLoading ? '변경 중...' : '변경하기'}
              </button>
              <button
                onClick={closePasswordModal}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;