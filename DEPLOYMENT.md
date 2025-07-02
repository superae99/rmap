# 배포 가이드

## 개요
이 문서는 카카오맵 프로젝트의 프로덕션 환경 배포를 위한 가이드입니다.

## 시스템 요구사항

### 최소 사양
- **CPU**: 2 코어 이상
- **메모리**: 4GB 이상 (권장: 8GB)
- **저장공간**: 20GB 이상
- **운영체제**: Ubuntu 20.04 LTS 이상 또는 CentOS 8 이상

### 필수 소프트웨어
- Docker 20.10 이상
- Docker Compose 2.0 이상
- Git
- Curl

## 배포 전 준비사항

### 1. 환경 변수 설정
```bash
# .env.production.example을 복사하여 환경 설정 파일 생성
cp .env.production.example .env.production

# 환경 변수 편집
nano .env.production
```

### 2. 필수 환경 변수
```bash
# 데이터베이스 설정
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=your_db_username
DB_PASSWORD=your_secure_db_password
DB_DATABASE=kakao_map_production

# JWT 보안 설정
JWT_SECRET=your_very_secure_jwt_secret_key_here_please_change_this
JWT_EXPIRES_IN=7d

# 애플리케이션 설정
NODE_ENV=production
PORT=5001
CORS_ORIGIN=https://your-domain.com

# 카카오맵 API 키
KAKAO_API_KEY=your_kakao_map_api_key_here
```

### 3. SSL 인증서 설정 (선택사항)
HTTPS를 사용하려면 SSL 인증서를 준비하세요:
```bash
# SSL 디렉토리 생성
mkdir -p ssl

# 인증서 파일 복사
cp your-cert.pem ssl/cert.pem
cp your-private-key.key ssl/private.key
```

## 배포 방법

### 1. 기본 배포
```bash
# 배포 스크립트 실행
./deploy.sh deploy
```

### 2. 단계별 배포
```bash
# 1단계: 환경 확인
./deploy.sh status

# 2단계: 데이터베이스 백업
./deploy.sh backup

# 3단계: 배포 실행
./deploy.sh deploy
```

## 배포 스크립트 명령어

### 기본 명령어
```bash
./deploy.sh deploy    # 전체 배포 프로세스 실행
./deploy.sh status    # 서비스 상태 확인
./deploy.sh backup    # 데이터베이스 백업
./deploy.sh rollback  # 롤백 수행
./deploy.sh logs      # 전체 로그 확인
./deploy.sh stop      # 모든 서비스 중지
./deploy.sh restart   # 서비스 재시작
```

### 개별 서비스 관리
```bash
./deploy.sh logs server    # 서버 로그만 확인
./deploy.sh logs client    # 클라이언트 로그만 확인
./deploy.sh logs mysql     # 데이터베이스 로그만 확인
./deploy.sh restart server # 서버만 재시작
```

## 서비스 접속 정보

배포 완료 후 다음 주소로 서비스에 접속할 수 있습니다:

- **프론트엔드**: http://your-server-ip:80
- **백엔드 API**: http://your-server-ip:5001
- **데이터베이스**: your-server-ip:3306 (내부 접속만)

## 모니터링 및 로그

### 실시간 로그 확인
```bash
# 전체 서비스 로그
docker-compose -f docker-compose.production.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.production.yml logs -f server
docker-compose -f docker-compose.production.yml logs -f client
docker-compose -f docker-compose.production.yml logs -f mysql
```

### 서비스 상태 확인
```bash
# Docker 컨테이너 상태
docker-compose -f docker-compose.production.yml ps

# 시스템 리소스 사용량
docker stats
```

### 헬스체크 엔드포인트
- **백엔드**: `GET http://your-server-ip:5001/api/health`
- **프론트엔드**: `GET http://your-server-ip:80`

## 백업 및 복원

### 자동 백업
배포 스크립트는 배포 전 자동으로 데이터베이스를 백업합니다.
백업 파일은 `./backups/` 디렉토리에 저장됩니다.

### 수동 백업
```bash
# 데이터베이스 백업
./deploy.sh backup

# 백업 파일 확인
ls -la backups/
```

### 복원
```bash
# 최신 백업으로 롤백
./deploy.sh rollback

# 특정 백업 파일로 복원 (수동)
source .env.production
docker-compose -f docker-compose.production.yml exec -T mysql mysql \
  -u$DB_USERNAME -p$DB_PASSWORD $DB_DATABASE < backups/db_backup_YYYYMMDD_HHMMSS.sql
```

## 보안 설정

### 1. 방화벽 설정
```bash
# 필요한 포트만 개방
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. SSL/TLS 설정
프로덕션 환경에서는 HTTPS를 사용하는 것을 강력히 권장합니다.

```bash
# Let's Encrypt 인증서 사용 (권장)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

### 3. 환경 변수 보안
- `.env.production` 파일의 권한을 제한하세요
- 강력한 비밀번호와 JWT 시크릿을 사용하세요
- 정기적으로 비밀번호를 변경하세요

## 성능 최적화

### 1. 데이터베이스 최적화
```sql
-- 인덱스 확인 및 최적화
SHOW INDEX FROM partners;
SHOW INDEX FROM areas;
SHOW INDEX FROM users;
```

### 2. 애플리케이션 캐싱
- Redis 캐시 활성화 (docker-compose.production.yml에 포함됨)
- API 응답 캐싱 설정

### 3. 리소스 모니터링
```bash
# 메모리 사용량
free -h

# 디스크 사용량
df -h

# CPU 사용량
htop
```

## 문제 해결

### 일반적인 문제

#### 1. 컨테이너 시작 실패
```bash
# 로그 확인
./deploy.sh logs

# 개별 컨테이너 상태 확인
docker-compose -f docker-compose.production.yml ps
```

#### 2. 데이터베이스 연결 실패
- 환경 변수 확인 (DB_HOST, DB_USERNAME, DB_PASSWORD)
- MySQL 컨테이너 상태 확인
- 방화벽 설정 확인

#### 3. API 요청 실패
- CORS 설정 확인 (CORS_ORIGIN)
- 백엔드 서버 로그 확인
- 네트워크 연결 상태 확인

#### 4. 프론트엔드 접속 불가
- Nginx 설정 확인
- 포트 80, 443 개방 확인
- 클라이언트 빌드 상태 확인

### 긴급 복구
```bash
# 모든 서비스 중지
./deploy.sh stop

# 롤백 수행
./deploy.sh rollback

# 이전 버전으로 복구
docker-compose -f docker-compose.production.yml up -d
```

## 업데이트 및 유지보수

### 정기 업데이트
1. 코드 업데이트 후 배포
2. 데이터베이스 백업 확인
3. 보안 패치 적용
4. 성능 모니터링

### 주의사항
- 프로덕션 배포 전 테스트 환경에서 충분한 검증 수행
- 배포 중 서비스 중단 시간 고려
- 중요한 업데이트는 사용자 트래픽이 적은 시간에 수행

## 지원 및 문의

문제 발생 시 다음 정보를 포함하여 문의하세요:
1. 에러 메시지 및 로그
2. 시스템 환경 정보
3. 재현 가능한 단계
4. 백업 파일 위치

---

*이 문서는 카카오맵 프로젝트의 안전하고 효율적인 배포를 위해 작성되었습니다.*