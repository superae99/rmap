# Platform.sh + Netlify 배포 가이드

## 개요
이 프로젝트는 다음과 같이 분리 배포됩니다:
- **Backend (서버)**: Platform.sh
- **Frontend (클라이언트)**: Netlify

## 1. Platform.sh 서버 배포

### 1.1 사전 준비
```bash
# Platform.sh CLI 설치
curl -sS https://platform.sh/cli/installer | php

# 로그인
platform login
```

### 1.2 프로젝트 생성 및 초기 설정
```bash
# Platform.sh 프로젝트 생성
platform project:create

# 서버 디렉토리로 이동
cd server

# Git remote 추가 (Platform.sh에서 제공하는 URL)
git remote add platform <your-platform-sh-git-url>
```

### 1.3 환경 변수 설정
```bash
# 필수 환경 변수 설정
platform variable:set JWT_SECRET "your-very-secure-jwt-secret" --level environment --environment main
platform variable:set KAKAO_API_KEY "your-kakao-api-key" --level environment --environment main
platform variable:set CORS_ORIGIN "https://your-netlify-app.netlify.app" --level environment --environment main
platform variable:set NODE_ENV "production" --level environment --environment main
```

### 1.4 배포 실행
```bash
# 변경사항 커밋
git add .
git commit -m "Initial Platform.sh deployment"

# Platform.sh에 배포
git push platform main

# 또는 배포 스크립트 사용
./platform-deploy.sh deploy
```

### 1.5 배포 후 확인
```bash
# 애플리케이션 URL 확인
platform url --primary

# 로그 확인
platform log app

# 환경 변수 확인
platform variables
```

## 2. Netlify 클라이언트 배포

### 2.1 Netlify 계정 설정
1. [Netlify](https://netlify.com)에 로그인
2. "New site from Git" 클릭
3. GitHub 저장소 연결

### 2.2 빌드 설정
**Build settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `18`

### 2.3 환경 변수 설정
Netlify 대시보드 > Site settings > Environment variables에서 설정:

```bash
VITE_API_BASE_URL=https://your-platform-sh-app-url
VITE_KAKAO_API_KEY=your-kakao-api-key
NODE_ENV=production
```

### 2.4 배포 설정 확인
`netlify.toml` 파일이 프로젝트 루트에 있는지 확인:
- SPA 라우팅 설정
- 보안 헤더 설정
- 캐시 정책 설정

### 2.5 배포 실행
```bash
# 코드 푸시로 자동 배포
git add .
git commit -m "Deploy to Netlify"
git push origin main

# 또는 Netlify CLI 사용 (선택사항)
npm install -g netlify-cli
netlify deploy --prod
```

## 3. 배포 후 설정

### 3.1 CORS 설정 업데이트
Platform.sh 배포 후 실제 URL로 CORS 설정 업데이트:
```bash
platform variable:set CORS_ORIGIN "https://your-actual-netlify-url.netlify.app" --level environment --environment main
```

### 3.2 Netlify 환경 변수 업데이트
Platform.sh 배포 후 실제 API URL로 업데이트:
```bash
VITE_API_BASE_URL=https://your-actual-platform-sh-url
```

### 3.3 도메인 설정 (선택사항)
**Platform.sh 커스텀 도메인:**
```bash
platform domain:add your-api-domain.com
```

**Netlify 커스텀 도메인:**
1. Netlify 대시보드 > Domain settings
2. Add custom domain
3. DNS 설정 업데이트

## 4. 테스트 및 검증

### 4.1 API 연결 테스트
```bash
# 서버 헬스체크
curl https://your-platform-sh-url/api/health

# 클라이언트에서 API 호출 테스트
# 브라우저 개발자 도구에서 네트워크 탭 확인
```

### 4.2 기능 테스트
1. 로그인 기능 테스트
2. 지도 로딩 확인
3. 데이터 조회/수정 기능 확인
4. 파일 업로드 기능 확인

## 5. 모니터링 및 로그

### 5.1 Platform.sh 모니터링
```bash
# 실시간 로그 확인
platform log app --tail

# 서비스 상태 확인
platform status

# 메트릭 확인
platform metrics
```

### 5.2 Netlify 모니터링
1. Netlify 대시보드에서 배포 상태 확인
2. Analytics 탭에서 사용량 확인
3. Functions 로그 확인 (사용 시)

## 6. 문제 해결

### 6.1 일반적인 문제
**CORS 에러:**
- Platform.sh 환경 변수 CORS_ORIGIN 확인
- Netlify URL이 정확한지 확인

**API 연결 실패:**
- VITE_API_BASE_URL 확인
- Platform.sh 서비스 상태 확인

**빌드 실패:**
- Node.js 버전 확인 (18 사용)
- 환경 변수 설정 확인

### 6.2 롤백 방법
**Platform.sh 롤백:**
```bash
# 이전 버전으로 롤백
platform backup:restore

# 또는 이전 커밋으로 되돌리기
git reset --hard <previous-commit>
git push platform main --force
```

**Netlify 롤백:**
1. Netlify 대시보드 > Deploys
2. 이전 성공한 배포 선택
3. "Publish deploy" 클릭

## 7. 자동화 (선택사항)

### 7.1 GitHub Actions 설정
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Platform.sh
        # Platform.sh 배포 액션 추가
        
  deploy-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        # Netlify 배포 액션 추가
```

## 8. 보안 고려사항

### 8.1 환경 변수 보안
- 모든 민감한 정보는 환경 변수로 관리
- 프로덕션 환경에서만 사용되는 값들은 별도 관리
- 정기적인 시크릿 로테이션

### 8.2 도메인 보안
- HTTPS 강제 사용
- 적절한 CORS 설정
- CSP(Content Security Policy) 설정

## 9. 성능 최적화

### 9.1 Platform.sh 최적화
- 적절한 컨테이너 사이즈 선택
- 데이터베이스 인덱스 최적화
- 캐싱 전략 구현

### 9.2 Netlify 최적화
- 번들 사이즈 최적화
- CDN 활용
- 이미지 최적화

---

*이 가이드는 Platform.sh와 Netlify를 사용한 분리 배포를 위해 작성되었습니다.*