# 개발/테스트/운영 환경 분리 계획

## 1. 환경 구성 개요

### 환경별 목적
- **Development (개발)**: 개발자들이 새로운 기능 개발 및 테스트
- **Testing (테스트)**: QA 및 통합 테스트 수행
- **Production (운영)**: 실제 사용자가 사용하는 환경

### 환경별 접속 정보
```
Development: dev.your-domain.com
Testing: test.your-domain.com  
Production: app.your-domain.com
```

## 2. 환경별 설정 파일 구조

### 백엔드 환경 설정
```
server/
├── .env.development      # 개발 환경 설정
├── .env.testing         # 테스트 환경 설정
├── .env.production      # 운영 환경 설정
├── .env.example         # 환경 변수 템플릿
└── src/
    └── config/
        ├── database.ts   # DB 연결 설정
        └── environment.ts # 환경별 설정 로더
```

### 프론트엔드 환경 설정
```
client/
├── .env.development     # 개발 환경 설정
├── .env.testing        # 테스트 환경 설정
├── .env.production     # 운영 환경 설정
└── src/
    └── config/
        └── environment.ts # 환경별 설정 로더
```

## 3. 데이터베이스 분리

### 데이터베이스 구성
```
kakao_map_dev     # 개발 DB
kakao_map_test    # 테스트 DB  
kakao_map_prod    # 운영 DB
```

### 데이터 동기화 전략
- 운영 → 테스트: 주기적 데이터 복사 (민감정보 마스킹)
- 테스트 → 개발: 필요시 선택적 복사

## 4. Docker 기반 환경 구성

### Docker Compose 파일 구조
```
docker-compose.dev.yml      # 개발 환경
docker-compose.test.yml     # 테스트 환경
docker-compose.prod.yml     # 운영 환경
docker-compose.base.yml     # 공통 설정
```

### 컨테이너 구성
- **nginx**: 리버스 프록시 및 정적 파일 서빙
- **node-server**: Express 백엔드
- **mysql**: 데이터베이스
- **redis**: 캐싱 (운영 환경)

## 5. 배포 파이프라인

### Git 브랜치 전략
```
main → production (운영)
develop → testing (테스트)
feature/* → development (개발)
```

### 배포 프로세스
1. **개발 환경**: feature 브랜치 push 시 자동 배포
2. **테스트 환경**: develop 브랜치 merge 시 자동 배포
3. **운영 환경**: main 브랜치 merge 후 수동 승인 배포

## 6. 환경별 차이점

### 개발 환경
- 디버그 모드 활성화
- 상세 에러 메시지 표시
- Mock 데이터 사용 가능
- CORS 제한 완화

### 테스트 환경
- 운영과 유사한 설정
- 테스트 계정 활성화
- 성능 모니터링 도구 활성화
- 자동화 테스트 지원

### 운영 환경
- 최적화된 빌드
- 에러 메시지 최소화
- 보안 설정 강화
- 실시간 모니터링

## 7. 구현 단계

### Phase 1: 환경 설정 파일 분리 (1일)
- [ ] 환경별 .env 파일 생성
- [ ] 환경 변수 로더 구현
- [ ] 설정 검증 스크립트 작성

### Phase 2: Docker 환경 구성 (2-3일)
- [ ] Docker Compose 파일 작성
- [ ] 환경별 Dockerfile 최적화
- [ ] 네트워크 및 볼륨 설정

### Phase 3: 데이터베이스 분리 (1일)
- [ ] 환경별 데이터베이스 생성
- [ ] 데이터 마이그레이션 스크립트
- [ ] 백업/복원 자동화

### Phase 4: CI/CD 파이프라인 구축 (2-3일)
- [ ] GitHub Actions 워크플로우 작성
- [ ] 환경별 배포 스크립트
- [ ] 롤백 메커니즘 구현

### Phase 5: 모니터링 및 로깅 (1-2일)
- [ ] 환경별 로깅 설정
- [ ] 모니터링 대시보드 구성
- [ ] 알림 시스템 설정

## 8. 보안 고려사항

### 환경별 보안 설정
- **개발**: 내부 네트워크만 접근 가능
- **테스트**: VPN 또는 IP 화이트리스트
- **운영**: HTTPS 필수, WAF 적용

### 시크릿 관리
- 환경 변수는 버전 관리에서 제외
- AWS Secrets Manager 또는 HashiCorp Vault 사용 고려
- 정기적인 키 로테이션

## 9. 백업 및 복구 전략

### 백업 정책
- **운영**: 일일 백업, 30일 보관
- **테스트**: 주간 백업, 7일 보관
- **개발**: 필요시 수동 백업

### 복구 절차
1. 백업 파일 확인
2. 환경별 복구 스크립트 실행
3. 데이터 무결성 검증
4. 서비스 정상 동작 확인

## 10. 예상 일정

총 소요 기간: 7-10일

- Week 1: 환경 설정 및 Docker 구성
- Week 2: CI/CD 구축 및 테스트

## 11. 위험 요소 및 대응 방안

### 주요 위험
1. **데이터 유실**: 철저한 백업 및 테스트
2. **설정 오류**: 환경별 검증 스크립트 작성
3. **배포 실패**: 롤백 메커니즘 구현
4. **보안 취약점**: 정기적인 보안 감사

### 대응 방안
- 단계별 검증 및 테스트
- 충분한 문서화
- 팀원 교육 및 훈련
- 비상 대응 계획 수립

---

*작성일: 2025-06-27*
*작성자: Claude AI*