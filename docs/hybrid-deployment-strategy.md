# 하이브리드 배포 전략

## 개요
코드의 완전 분리와 공유의 장점을 모두 취하는 전략

## 구조
```
New_Map_Project/
├── src/                    # 공유 소스 코드 (Git으로 관리)
│   ├── client/
│   └── server/
│
├── deployments/           # 환경별 배포 (Git 제외)
│   ├── dev/              # 개발 환경 (src에서 복사)
│   │   ├── client/
│   │   ├── server/
│   │   └── .env
│   ├── test/             # 테스트 환경 (src에서 복사)
│   │   ├── client/
│   │   ├── server/
│   │   └── .env
│   └── prod/             # 운영 환경 (src에서 복사)
│       ├── client/
│       ├── server/
│       └── .env
│
└── environments/          # 환경별 설정 및 스크립트
    ├── dev/
    ├── test/
    └── prod/
```

## 작동 방식

### 1. 개발 프로세스
```bash
# 1. src에서 개발
cd src/client
npm run dev

# 2. 테스트 환경에 배포
./deploy.sh test sync    # src → deployments/test 복사
./deploy.sh test up      # 테스트 환경 실행

# 3. 운영 환경에 배포
./deploy.sh prod sync    # src → deployments/prod 복사
./deploy.sh prod up      # 운영 환경 실행
```

### 2. 브랜치 전략과 연동
```
feature/* → src/ → deployments/dev/
develop   → src/ → deployments/test/
main      → src/ → deployments/prod/
```

## 장점
1. **안전성**: 각 환경이 독립적으로 실행
2. **유연성**: 환경별 다른 버전 배포 가능
3. **롤백 용이**: 이전 배포 버전 보관 가능
4. **테스트**: 운영 영향 없이 테스트 가능

## 구현 방법

### 1. 디렉토리 구조 생성
```bash
mkdir -p deployments/{dev,test,prod}
mkdir -p src/{client,server}
```

### 2. 기존 코드 이동
```bash
# 현재 client, server를 src로 이동
mv client src/
mv server src/
```

### 3. 배포 스크립트 수정
```bash
# sync 명령 추가
sync)
    rsync -av --delete \
        --exclude 'node_modules' \
        --exclude 'dist' \
        --exclude '.env' \
        src/ deployments/$ENVIRONMENT/
    ;;
```

### 4. .gitignore 업데이트
```
# 배포 디렉토리 제외
deployments/
```

## 배포 흐름

1. **개발**: `src/`에서 작업
2. **동기화**: `deploy.sh dev sync`
3. **테스트**: `deployments/dev/`에서 실행
4. **승급**: dev → test → prod 순차 배포

이렇게 하면 코드는 한 곳에서 관리하면서도 
각 환경은 완전히 독립적으로 운영할 수 있습니다.