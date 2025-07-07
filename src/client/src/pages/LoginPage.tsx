import React, { useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const LoginPage = () => {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authAPI.login(account, password)
      // 로그인 성공 시에만 페이지 새로고침 (URL 변경 없이)
      window.location.reload()
    } catch (err: any) {
      
      // 입력 정보가 틀렸을 때 페이지 이동하지 않고 에러 메시지만 표시
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          '계정 또는 비밀번호가 올바르지 않습니다.'
      
      setError(errorMessage)
      
      // 비밀번호 필드 초기화 (보안)
      setPassword('')
      
      // 계정 필드에 포커스 (사용자 편의)
      setTimeout(() => {
        const accountInput = document.querySelector('input[type="text"]') as HTMLInputElement
        if (accountInput) {
          accountInput.focus()
        }
      }, 100)
      
      // 로그인 실패 시 페이지 이동하지 않음 (기본 동작 유지)
      return false
    } finally {
      setLoading(false)
    }
  }

  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: isMobile ? '20px' : '0'
    }
  },
    React.createElement('form', {
      onSubmit: handleSubmit,
      style: {
        width: isMobile ? '100%' : '400px',
        maxWidth: isMobile ? '350px' : 'none',
        padding: isMobile ? '30px 20px' : '40px',
        backgroundColor: 'white',
        borderRadius: isMobile ? '12px' : '8px',
        boxShadow: isMobile ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.1)'
      }
    },
      React.createElement('h2', {
        style: { textAlign: 'center', marginBottom: '30px' }
      }, '영업 상권 정보 시스템'),
      
      error && React.createElement('div', {
        style: {
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px'
        }
      }, error),
      
      React.createElement('div', { style: { marginBottom: '20px' } },
        React.createElement('label', {
          style: { display: 'block', marginBottom: '5px' }
        }, '계정'),
        React.createElement('input', {
          type: 'text',
          value: account,
          onChange: (e: any) => setAccount(e.target.value),
          style: {
            width: '100%',
            padding: isMobile ? '14px 12px' : '10px',
            border: '1px solid #ddd',
            borderRadius: isMobile ? '8px' : '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          },
          required: true,
          disabled: loading,
          placeholder: '계정 입력'
        })
      ),
      
      React.createElement('div', { style: { marginBottom: '30px' } },
        React.createElement('label', {
          style: { display: 'block', marginBottom: '5px' }
        }, '비밀번호'),
        React.createElement('input', {
          type: 'password',
          value: password,
          onChange: (e: any) => setPassword(e.target.value),
          style: {
            width: '100%',
            padding: isMobile ? '14px 12px' : '10px',
            border: '1px solid #ddd',
            borderRadius: isMobile ? '8px' : '4px',
            fontSize: '16px',
            boxSizing: 'border-box'
          },
          required: true,
          disabled: loading,
          placeholder: '비밀번호 입력'
        })
      ),
      
      React.createElement('button', {
        type: 'submit',
        style: {
          width: '100%',
          padding: isMobile ? '16px' : '12px',
          backgroundColor: loading ? '#6c757d' : '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: isMobile ? '8px' : '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          minHeight: isMobile ? '50px' : 'auto'
        },
        disabled: loading
      }, loading ? '로그인 중...' : '로그인'),
      
      React.createElement('div', {
        style: {
          marginTop: '20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }
      }, '계정과 비밀번호를 입력해주세요')
    )
  )
}

export default LoginPage