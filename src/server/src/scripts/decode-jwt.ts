import jwt from 'jsonwebtoken'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZUlkIjoiMTk5NTAzMTIiLCJhY2NvdW50Ijoiamlob29uc2VvIiwiZW1wbG95ZWVOYW1lIjoi7ISc7KeA7ZuIIiwicG9zaXRpb24iOiLsg4HrrLTrs7QiLCJqb2JUaXRsZSI6Iuu2gOusuOyepSIsImZpZWxkVHlwZSI6Iu2VhOuTnCIsImlhdCI6MTc1MTkwOTA1NywiZXhwIjoxNzUyNTEzODU3fQ.rk8UFFw6aq3LKIbkhra2FyHe0hdJkAfkf-nhTuJ9m_M'

try {
  const decoded = jwt.decode(token) as any
  console.log('🔍 JWT 토큰 디코딩 결과:')
  console.log(JSON.stringify(decoded, null, 2))
  
  console.log('\n📋 주요 필드:')
  console.log(`employeeId: "${decoded.employeeId}"`)
  console.log(`account: "${decoded.account}"`)
  console.log(`employeeName: "${decoded.employeeName}"`)
  console.log(`position: "${decoded.position}"`)
  console.log(`jobTitle: "${decoded.jobTitle}"`)
  console.log(`fieldType: "${decoded.fieldType}"`)
  
  console.log('\n🔍 STAFF 권한 체크:')
  console.log(`position.includes('스탭'): ${decoded.position.includes('스탭')}`)
  console.log(`fieldType === '스탭': ${decoded.fieldType === '스탭'}`)
  
} catch (error) {
  console.error('JWT 디코딩 오류:', error)
}