# 하이브리드 배포 시스템 사용법

## 📁 새로운 프로젝트 구조

```
New_Map_Project/
├── 📂 src/                        # 소스 코드 (Git 관리)
│   ├── client/                    # React 프론트엔드
│   └── server/                    # Node.js 백엔드
│
├── 📂 deployments/                # 배포된 코드 (Git 제외)
│   ├── dev/                       # 개발 환경 실행 코드
│   ├── test/                      # 테스트 환경 실행 코드
│   └── prod/                      # 운영 환경 실행 코드
│
├── 📂 environments/               # 환경별 설정
│   ├── dev/                       # 개발 환경 설정
│   ├── test/                      # 테스트 환경 설정
│   ├── prod/                      # 운영 환경 설정
│   └── deploy-hybrid.sh           # 하이브리드 배포 스크립트
│
└── 📂 기타 디렉토리들
```

## 🚀 기본 사용법

### 1. 환경 초기화
```bash
cd environments
./deploy-hybrid.sh dev init
```

### 2. 코드 동기화 (src → deployments)
```bash
./deploy-hybrid.sh dev sync
```

### 3. 환경 시작
```bash
./deploy-hybrid.sh dev up
```

### 4. 한 번에 배포 (sync + up)
```bash
./deploy-hybrid.sh dev deploy
```

## 📋 명령어 설명

| 명령어 | 설명 | 사용 예시 |
|--------|------|----------|
| `init` | 환경 초기화 | `./deploy-hybrid.sh dev init` |
| `sync` | 소스 코드 동기화 | `./deploy-hybrid.sh dev sync` |
| `up` | 서비스 시작 | `./deploy-hybrid.sh dev up` |
| `down` | 서비스 중지 | `./deploy-hybrid.sh dev down` |
| `deploy` | 동기화 + 시작 | `./deploy-hybrid.sh dev deploy` |
| `status` | 상태 확인 | `./deploy-hybrid.sh dev status` |
| `logs` | 로그 보기 | `./deploy-hybrid.sh dev logs` |
| `backup` | DB 백업 | `./deploy-hybrid.sh prod backup` |

## 🔄 개발 워크플로우

### 1. 개발 작업
```bash
# src에서 코드 수정
cd src/client
# 코드 작업...

# 또는 개발 서버 직접 실행
npm run dev
```

### 2. 개발 환경 테스트
```bash
# 코드를 개발 환경으로 동기화
./deploy-hybrid.sh dev sync

# 개발 환경 시작
./deploy-hybrid.sh dev up

# 브라우저에서 테스트
# http://localhost:3000
```

### 3. 테스트 환경 배포
```bash
# 코드를 테스트 환경으로 동기화
./deploy-hybrid.sh test sync

# 테스트 환경 시작
./deploy-hybrid.sh test up
```

### 4. 운영 환경 배포
```bash
# 백업 먼저!
./deploy-hybrid.sh prod backup

# 운영 배포 (확인 필요)
./deploy-hybrid.sh prod deploy
```

## 🔐 환경 변수 설정

각 환경별로 설정 파일 수정:
```bash
# 개발 환경
nano environments/dev/.env.server
nano environments/dev/.env.client

# 테스트 환경
nano environments/test/.env.server
nano environments/test/.env.client

# 운영 환경
nano environments/prod/.env.server
nano environments/prod/.env.client
```

## 📌 주의사항

1. **소스 코드 수정은 항상 `src/`에서**
   - deployments 폴더의 코드는 직접 수정하지 마세요
   - 수정 후 `sync` 명령으로 동기화

2. **환경별 독립성**
   - 각 환경은 완전히 독립적으로 실행됩니다
   - 한 환경의 문제가 다른 환경에 영향을 주지 않습니다

3. **운영 배포 시**
   - 항상 백업을 먼저 수행하세요
   - 테스트 환경에서 충분히 검증 후 배포

## 🛠️ 문제 해결

### 동기화가 안 될 때
```bash
# rsync 설치 확인
which rsync

# 수동 동기화
rsync -av --delete src/client/ deployments/dev/client/
```

### Docker 관련 문제
```bash
# Docker 상태 확인
docker ps

# 환경 재시작
./deploy-hybrid.sh dev down
./deploy-hybrid.sh dev up
```

### 포트 충돌
- 개발: 3000, 5001, 3306
- 테스트: 8080
- 운영: 80, 443

## 🎯 장점

1. **안전성**: 각 환경이 완전히 독립적
2. **유연성**: 환경별 다른 버전 배포 가능
3. **롤백 용이**: 이전 배포 상태 유지
4. **개발 편의**: src에서만 작업하면 됨

---

*이제 코드와 환경이 완전히 분리되어 안전하게 관리할 수 있습니다!*