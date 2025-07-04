# 🔒 카카오맵 위치 정보 시스템 보안 가이드

## 📋 보안 개요

본 문서는 카카오맵 위치 정보 시스템의 보안 구현 사항과 모범 사례를 설명합니다. 
2025년 7월 4일 기준으로 모든 주요 보안 취약점이 해결되었으며, 프로덕션 환경에서 안전하게 운영 가능합니다.

---

## 🛡️ 구현된 보안 기능

### 1. 인증 및 권한 관리

#### JWT 기반 인증 시스템
- **토큰 생성**: bcrypt + JWT (7일 만료)
- **권한 체계**: admin → manager → staff → user (4단계)
- **토큰 저장**: httpOnly 쿠키 (XSS 방지)
- **자동 만료**: 토큰 만료 시 자동 로그아웃

#### 역할 기반 접근 제어 (RBAC)
```typescript
// 권한 체계
admin: 모든 기능 (시스템관리자)
manager: 생성/수정/삭제 (지점장)  
staff: 조회 권한 (스탭)
user: 제한된 조회 (일반사용자)
```

### 2. API 보안

#### 모든 API 엔드포인트 인증 필수
- **인증 미들웨어**: 모든 민감한 API에 적용
- **토큰 검증**: 헤더와 쿠키 모두 지원
- **실패 처리**: 401/403 표준 HTTP 상태 코드

#### 율제한 (Rate Limiting)
```typescript
로그인 API: IP당 15분에 5회 시도
패스워드 변경 API: IP당 1시간에 3회 시도  
일반 API: IP당 15분에 100회 요청
```

### 3. 데이터 보안

#### 패스워드 보안
- **해싱**: bcrypt (salt rounds: 10)
- **정책**: 최소 8자, 영문/숫자/특수문자 포함
- **이력**: passwordChangedAt 타임스탬프 기록
- **검증**: 현재 패스워드 확인 후 변경

#### 민감 데이터 보호
- **지역 정보**: 인증된 사용자만 접근
- **판매구역 데이터**: 권한별 필터링
- **사용자 정보**: 비밀번호 필드 응답에서 제외

### 4. 통신 보안

#### 쿠키 보안 설정
```typescript
res.cookie('authToken', token, {
  httpOnly: true,        // XSS 방지
  secure: true,          // HTTPS 전용 (프로덕션)
  sameSite: 'strict',    // CSRF 방지
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7일
})
```

#### CORS 정책
- **허용 도메인**: 화이트리스트 기반
- **자격증명**: credentials: true
- **헤더 제한**: 필요한 헤더만 허용

---

## 🔧 보안 미들웨어

### 인증 미들웨어 (`auth.middleware.ts`)

```typescript
export const authenticate = async (req, res, next) => {
  try {
    // 토큰을 헤더 또는 쿠키에서 가져오기
    let token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      token = req.cookies?.authToken
    }

    if (!token) {
      throw new AppError('No token provided', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    next(new AppError('Invalid token', 401))
  }
}
```

### 권한 미들웨어

```typescript
export const authorize = (...allowedRoles: string[]) => {
  return (req, res, next) => {
    const userRole = determineUserRole(req.user)
    
    if (!allowedRoles.includes(userRole)) {
      return next(new AppError('권한이 없습니다.', 403))
    }
    
    next()
  }
}
```

### 율제한 미들웨어 (`rate-limit.middleware.ts`)

```typescript
// 로그인 율제한
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회 시도
  message: {
    success: false,
    error: {
      message: '너무 많은 로그인 시도가 있었습니다. 15분 후 다시 시도해주세요.',
      code: 'TOO_MANY_ATTEMPTS'
    }
  }
})

// 패스워드 변경 율제한
export const passwordChangeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // 최대 3회 시도
  message: {
    success: false,
    error: {
      message: '너무 많은 비밀번호 변경 시도가 있었습니다. 1시간 후 다시 시도해주세요.',
      code: 'TOO_MANY_PASSWORD_ATTEMPTS'
    }
  }
})
```

---

## 🚀 보안 설정

### 환경변수 보안

#### 필수 환경변수
```bash
# JWT 보안
JWT_SECRET=your_secure_random_string_here_change_in_production
JWT_EXPIRES_IN=7d

# 데이터베이스 보안
DB_PASSWORD=your_secure_db_password

# CORS 설정
CORS_ORIGIN=https://your-production-domain.com

# 프로덕션 모드
NODE_ENV=production
```

#### 보안 권장사항
1. **JWT_SECRET**: 최소 32자 이상의 랜덤 문자열
2. **DB_PASSWORD**: 강력한 비밀번호 사용
3. **CORS_ORIGIN**: 정확한 프로덕션 도메인 설정
4. **환경변수 파일**: .env 파일을 git에 포함하지 않기

### 프로덕션 배포 보안

#### Platform.sh 설정
```yaml
# .platform.app.yaml
variables:
  env:
    NODE_ENV: 'production'
    JWT_SECRET: !ENV_VAR_SECRET
    DB_PASSWORD: !ENV_VAR_SECRET
```

#### HTTPS 설정
- **SSL 인증서**: Platform.sh 자동 관리
- **강제 리다이렉트**: HTTP → HTTPS
- **HSTS 헤더**: 브라우저 보안 강화

---

## 📊 보안 모니터링

### 로그 기록

#### 인증 이벤트
- 로그인 성공/실패
- 패스워드 변경
- 권한 위반 시도
- 율제한 트리거

#### API 접근 로그
- 엔드포인트별 접근 기록
- 응답 시간 및 상태 코드
- 에러 발생 패턴

### 보안 메트릭

#### 주요 지표
- 인증 실패율
- 율제한 발생 빈도
- 비정상적인 API 호출 패턴
- 권한 위반 시도 횟수

---

## ⚠️ 보안 주의사항

### 개발 시 주의사항

1. **패스워드 평문 금지**
   ```typescript
   // ❌ 잘못된 예
   console.log('Password:', password)
   
   // ✅ 올바른 예  
   console.log('Login attempt for user:', account)
   ```

2. **SQL 인젝션 방지**
   ```typescript
   // ✅ TypeORM을 사용하여 자동 방지
   const user = await userRepository.findOne({ 
     where: { account } 
   })
   ```

3. **XSS 방지**
   ```typescript
   // ✅ httpOnly 쿠키 사용
   res.cookie('authToken', token, { httpOnly: true })
   ```

### 운영 시 주의사항

1. **정기적인 보안 업데이트**
   - 의존성 패키지 업데이트
   - 보안 패치 적용
   - 취약점 스캔 실행

2. **접근 로그 모니터링**
   - 비정상적인 접근 패턴 감지
   - 반복적인 인증 실패 알림
   - IP별 접근 빈도 분석

3. **백업 및 복구**
   - 암호화된 데이터베이스 백업
   - 재해 복구 계획 수립
   - 정기적인 복구 테스트

---

## 🔍 보안 테스트

### 수동 테스트 체크리스트

#### 인증 테스트
- [ ] 유효하지 않은 토큰으로 API 접근 시 401 반환
- [ ] 만료된 토큰으로 접근 시 자동 로그아웃
- [ ] 권한 없는 기능 접근 시 403 반환
- [ ] 쿠키가 httpOnly로 설정되어 있는지 확인

#### 율제한 테스트  
- [ ] 로그인 5회 실패 시 15분 차단 확인
- [ ] 패스워드 변경 3회 실패 시 1시간 차단 확인
- [ ] 율제한 메시지가 한국어로 표시되는지 확인

#### 패스워드 테스트
- [ ] 8자 미만 패스워드 거부 확인
- [ ] 영문/숫자/특수문자 정책 확인
- [ ] 현재 패스워드 검증 확인
- [ ] 패스워드 변경 시점 기록 확인

### 자동화된 보안 테스트

#### API 보안 테스트
```bash
# 인증 없이 보호된 API 접근
curl -X GET https://api.domain.com/api/areas
# 예상 결과: {"success":false,"error":{"message":"Invalid token"}}

# 율제한 테스트
for i in {1..6}; do
  curl -X POST https://api.domain.com/api/auth/login \
    -d '{"account":"invalid","password":"invalid"}'
done
# 6번째 요청에서 429 상태 코드 확인
```

---

## 📈 보안 개선 로드맵

### 단기 계획 (1-2개월)

1. **2FA (Two-Factor Authentication) 구현**
   - TOTP 기반 2단계 인증
   - 관리자 계정 필수 적용
   - 일반 사용자 선택적 적용

2. **API 키 관리 시스템**
   - 카카오맵 API 키 로테이션
   - 환경별 키 분리
   - 사용량 모니터링

3. **보안 헤더 강화**
   ```typescript
   // 추가 예정
   app.use(helmet({
     contentSecurityPolicy: true,
     hsts: true,
     noSniff: true
   }))
   ```

### 중기 계획 (3-6개월)

1. **감사 로그 시스템**
   - 모든 중요 작업 로깅
   - 로그 위변조 방지
   - 실시간 이상 행위 감지

2. **데이터 암호화**
   - 민감 데이터 필드 암호화
   - 암호화 키 관리 시스템
   - 암호화된 백업

3. **네트워크 보안**
   - VPN 연동 (선택사항)
   - IP 화이트리스트
   - DDoS 방어

### 장기 계획 (6개월+)

1. **보안 컴플라이언스**
   - ISO 27001 준수
   - GDPR 데이터 보호
   - 개인정보보호법 준수

2. **침입 탐지 시스템**
   - 실시간 위협 탐지
   - 자동 대응 시스템
   - 포렌식 분석 도구

---

## 📞 보안 문제 신고

### 보안 취약점 발견 시

1. **즉시 연락**: 시스템 관리자에게 직접 연락
2. **상세 설명**: 재현 방법과 영향도 포함
3. **임시 조치**: 가능한 경우 임시 차단 조치
4. **패치 적용**: 검증 후 즉시 패치 배포

### 응급상황 대응

1. **서버 차단**: 심각한 보안 위협 시 즉시 서버 차단
2. **로그 보존**: 포렌식 분석을 위한 로그 백업
3. **사용자 알림**: 필요시 사용자에게 보안 공지
4. **복구 계획**: 단계별 복구 및 재개 절차

---

*보안 가이드 버전: 1.0 (2025-07-04)*
*다음 검토 예정일: 2025-10-04*