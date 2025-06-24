import React, { useState } from 'react'
import { authAPI } from '../services/api'

const LoginPage = () => {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login(account, password)
      console.log('로그인 성공:', response)
      // 로그인 성공 시 홈페이지로 이동
      window.location.href = '/'
    } catch (err) {
      console.error('로그인 실패:', err)
      setError('계정 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }
  },
    React.createElement('form', {
      onSubmit: handleSubmit,
      style: {
        width: '400px',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          },
          required: true,
          disabled: loading
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
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          },
          required: true,
          disabled: loading
        })
      ),
      
      React.createElement('button', {
        type: 'submit',
        style: {
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer'
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