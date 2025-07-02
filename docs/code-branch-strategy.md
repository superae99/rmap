# 코드 브랜치 및 환경 분리 전략

## 1. Git 브랜치 전략

### 브랜치 구조
```
main (production)         # 운영 환경 코드
├── develop (testing)     # 테스트 환경 코드
│   ├── feature/login    # 기능 개발 브랜치
│   ├── feature/map      # 기능 개발 브랜치
│   └── feature/...      # 기타 기능 브랜치
├── hotfix/...           # 긴급 수정 브랜치
└── release/...          # 릴리즈 준비 브랜치
```

### 브랜치별 환경 매핑
- `main` → Production (운영)
- `develop` → Testing (테스트)
- `feature/*` → Development (개발)

## 2. 코드 분리 방법

### Option 1: 단일 저장소 + 브랜치 전략 (추천)
```bash
# 현재 구조 유지하면서 브랜치로 환경 분리
git checkout -b develop
git checkout -b feature/initial-setup
```

**장점:**
- 코드 공유가 쉬움
- 병합(merge) 관리 용이
- 단일 저장소 관리

**단점:**
- 실수로 잘못된 브랜치에 푸시 가능
- 환경별 설정 관리 주의 필요

### Option 2: 환경별 별도 저장소
```
kakao-map-dev/      # 개발 환경 저장소
kakao-map-test/     # 테스트 환경 저장소
kakao-map-prod/     # 운영 환경 저장소
```

**장점:**
- 완전한 분리로 실수 방지
- 환경별 접근 권한 관리 용이

**단점:**
- 코드 동기화 어려움
- 중복 관리 부담

## 3. 환경별 코드 차이 관리

### 환경별 설정 파일
```typescript
// src/config/environment.ts
const configs = {
  development: {
    apiUrl: 'http://localhost:5001',
    debug: true,
    mockData: true
  },
  testing: {
    apiUrl: 'https://test-api.domain.com',
    debug: false,
    mockData: false
  },
  production: {
    apiUrl: 'https://api.domain.com',
    debug: false,
    mockData: false
  }
};

export default configs[process.env.NODE_ENV || 'development'];
```

### 조건부 기능 플래그
```typescript
// src/features/featureFlags.ts
export const features = {
  development: {
    showDebugPanel: true,
    enableMockData: true,
    allowTestAccounts: true
  },
  testing: {
    showDebugPanel: false,
    enableMockData: false,
    allowTestAccounts: true
  },
  production: {
    showDebugPanel: false,
    enableMockData: false,
    allowTestAccounts: false
  }
};
```

## 4. 배포 프로세스

### 개발 → 테스트
```bash
# feature 브랜치에서 개발 완료 후
git checkout develop
git merge feature/your-feature
git push origin develop

# 자동으로 테스트 환경에 배포
```

### 테스트 → 운영
```bash
# 테스트 완료 후
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags

# 수동 승인 후 운영 배포
```

## 5. 실제 구현 단계

### Step 1: 브랜치 생성
```bash
# develop 브랜치 생성
git checkout -b develop
git push -u origin develop

# 브랜치 보호 규칙 설정 (GitHub/GitLab)
# - main: PR 필수, 승인 2명 이상
# - develop: PR 필수, 승인 1명 이상
```

### Step 2: 환경별 설정 코드 추가
```bash
# 서버 환경 설정
server/src/config/
├── database.config.ts
├── app.config.ts
└── environment.ts

# 클라이언트 환경 설정
client/src/config/
├── api.config.ts
├── features.config.ts
└── environment.ts
```

### Step 3: Docker 이미지 태깅
```yaml
# docker-compose.yml 수정
services:
  server:
    image: kakao-map-server:${VERSION:-latest}
    build:
      context: ./server
      args:
        - BUILD_ENV=${NODE_ENV}
```

### Step 4: CI/CD 파이프라인 연동
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches:
      - main        # → 운영 배포
      - develop     # → 테스트 배포
      - feature/**  # → 개발 배포
```

## 6. 보안 고려사항

### 환경별 시크릿 관리
```bash
# GitHub Secrets 사용
PROD_DB_PASSWORD
TEST_DB_PASSWORD
DEV_DB_PASSWORD

# 또는 AWS Secrets Manager / HashiCorp Vault
```

### 코드 리뷰 프로세스
1. feature → develop: 1명 이상 승인
2. develop → main: 2명 이상 승인 + QA 확인
3. hotfix → main: 긴급 승인 프로세스

## 7. 롤백 전략

### 브랜치 기반 롤백
```bash
# 이전 커밋으로 롤백
git revert <commit-hash>
git push

# 태그 기반 롤백
git checkout v1.0.0
git checkout -b hotfix/rollback-v1.0.0
```

### Docker 이미지 롤백
```bash
# 이전 버전 이미지로 롤백
docker-compose up -d kakao-map-server:v1.0.0
```

## 8. 모니터링 및 알림

### 배포 알림
- Slack/Discord 웹훅 연동
- 이메일 알림
- 배포 대시보드

### 환경별 모니터링
- 개발: 상세 로그
- 테스트: 성능 메트릭
- 운영: 에러 알림 + APM

---

*이 전략을 통해 코드와 환경을 안전하게 분리하고 관리할 수 있습니다.*