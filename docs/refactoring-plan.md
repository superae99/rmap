# 카카오맵 프로젝트 리팩토링 계획서

## 1. 프로젝트 개요

### 1.1 프로젝트 정보
- **프로젝트명**: 카카오맵 기반 위치 정보 시스템
- **작성일**: 2025-06-17
- **작성자**: Hyeong-rae

### 1.2 리팩토링 목표 ✅ 완료
- HTML/CSS/JavaScript 기반의 클라이언트 전용 애플리케이션을 React + Node.js/Express 풀스택 애플리케이션으로 전환
- 데이터베이스 연동 및 사용자 인증/권한 시스템 구축
- SOLID 원칙과 Clean Architecture 패턴 적용
- 유지보수성 향상 및 확장 가능한 구조 구축

## 2. 기술 스택 전환

### 2.1 현재 기술 스택
- **프론트엔드**: HTML, CSS, JavaScript
- **백엔드**: 없음 (클라이언트 전용)
- **데이터베이스**: 없음
- **API**: 카카오맵 API

### 2.2 목표 기술 스택 ✅ 구현 완료
- **프론트엔드**: React 18, TypeScript, React.createElement 방식
- **백엔드**: Node.js, Express, TypeScript
- **데이터베이스**: MySQL + TypeORM
- **인증**: JWT (JSON Web Tokens)
- **API**: RESTful API, 카카오맵 API
- **테스트**: Jest, React Testing Library, Supertest (가능)
- **추가**: xlsx 라이브러리 (엑셀 처리)

## 3. 아키텍처 설계

### 3.1 전체 아키텍처
```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│   React App     │────▶│  Express Server  │────▶│   Database     │
│  (TypeScript)   │◀────│  (TypeScript)    │◀────│  (PostgreSQL)  │
└─────────────────┘     └──────────────────┘     └────────────────┘
        │                        │
        └────────────────────────┘
              카카오맵 API
```

### 3.2 프론트엔드 구조 (React)
```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── map/           # 지도 관련 컴포넌트
│   └── auth/          # 인증 관련 컴포넌트
├── pages/             # 페이지 컴포넌트
├── services/          # API 통신 서비스
├── hooks/             # 커스텀 훅
├── store/             # 상태 관리 (Context API/Redux)
├── types/             # TypeScript 타입 정의
├── utils/             # 유틸리티 함수
└── styles/            # 전역 스타일
```

### 3.3 백엔드 구조 (Node.js/Express)
```
src/
├── controllers/       # 컨트롤러 (요청 처리)
├── services/         # 비즈니스 로직
├── repositories/     # 데이터 접근 계층
├── models/          # 데이터베이스 모델
├── middlewares/     # 미들웨어 (인증, 에러 처리 등)
├── routes/          # API 라우트 정의
├── config/          # 설정 파일
├── types/           # TypeScript 타입 정의
└── utils/           # 유틸리티 함수
```

## 4. 주요 기능 설계

### 4.1 지도 기능 ✅ 구현 완료
- **마커 표시**: 지도 위에 위치 정보 표시
  - RTM 채널별 마커 모양 (업소: 네모, 매장: 원, 기타: 다이아몬드)
  - 담당자별 색상 구분 (12가지 색상 팔레트)
  - 마커 클릭 시 지도 중심 이동 및 인포윈도우 표시
- **영역 표시**: 폴리곤으로 구역 경계 표시
  - on/off 토글 기능
  - 마우스 오버/아웃 효과
  - 사용자 지정 색상 및 투명도
- **거래처 관리**: 거래처 정보 CRUD 기능
  - 담당자 변경 시스템 (인포윈도우에서 직접 변경)
  - 엑셀 다운로드 기능
  - 검색, 필터링, 페이지네이션

### 4.2 사용자 인증 및 권한 ✅ 구현 완료
- **로그인/로그아웃**: JWT 기반 인증
- **권한 관리**: 역할 기반 접근 제어 (RBAC)
  - Admin: 모든 기능 접근 가능
  - Manager: 거래처 정보 수정 가능
  - User: 조회만 가능
- **테스트 계정**: admin/manager/user (모두 password123)

### 4.3 데이터베이스 스키마
```sql
-- 사용자 테이블
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 거래처 테이블
CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    category VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 영역 테이블
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    coordinates JSONB NOT NULL,
    topojson JSONB,
    color VARCHAR(7),
    description TEXT,
    properties JSONB,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 영업 사원 영역 테이블
CREATE TABLE sales_territories (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    region_code VARCHAR(20) NOT NULL,
    region_name VARCHAR(200) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. API 설계

### 5.1 인증 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/auth/me` - 현재 사용자 정보

### 5.2 거래처 API
- `GET /api/partners` - 거래처 목록 조회
- `GET /api/partners/:id` - 거래처 상세 조회
- `POST /api/partners` - 거래처 생성 (Manager, Admin)
- `PUT /api/partners/:id` - 거래처 수정 (Manager, Admin)
- `DELETE /api/partners/:id` - 거래처 삭제 (Admin)

### 5.3 영역 API
- `GET /api/areas` - 영역 목록 조회
- `POST /api/areas` - 영역 생성 (Manager, Admin)
- `PUT /api/areas/:id` - 영역 수정 (Manager, Admin)
- `DELETE /api/areas/:id` - 영역 삭제 (Admin)

### 5.4 영업 사원 영역 API
- `GET /api/sales-territories` - 영업 사원 영역 목록 조회
- `GET /api/sales-territories/:id` - 영업 사원 영역 상세 조회
- `POST /api/sales-territories` - 영업 사원 영역 생성 (Manager, Admin)
- `PUT /api/sales-territories/:id` - 영업 사원 영역 수정 (Manager, Admin)
- `DELETE /api/sales-territories/:id` - 영업 사원 영역 삭제 (Admin)

## 6. 구현 단계 ✅ 완료

### Phase 1: 프로젝트 초기 설정 ✅
1. React 프로젝트 생성 및 TypeScript 설정
2. Express 서버 생성 및 TypeScript 설정
3. 데이터베이스 연결 설정 (MySQL + TypeORM)
4. 기본 프로젝트 구조 생성

### Phase 2: 인증 시스템 구현 ✅
1. JWT 기반 인증 미들웨어 구현
2. 로그인/로그아웃 API 구현
3. 권한 관리 시스템 구현 (admin/manager/user)
4. React 인증 컴포넌트 개발

### Phase 3: 지도 기능 이식 ✅
1. 카카오맵 React 컴포넌트 개발
2. 마커 표시 기능 구현 (RTM 채널별 모양, 담당자별 색상)
3. 영역 표시 기능 구현 (폴리곤, on/off 토글)
4. 지도 데이터 API 연동
5. 인포윈도우 시스템 및 마커 인터렉션

### Phase 4: 거래처 관리 기능 ✅
1. 거래처 CRUD API 구현
2. 거래처 관리 UI 개발 (테이블, 검색, 필터링, 페이지네이션)
3. 영역 관리 UI 개발 (카드 레이아웃, 색상 프리뷰)
4. 담당자 변경 시스템
5. 엑셀 다운로드 기능

### Phase 5: 테스트 및 문서화 (필요시 추가)
1. 단위 테스트 작성
2. 통합 테스트 작성
3. API 문서 작성
4. 사용자 가이드 작성

## 7. 테스트 전략

### 7.1 프론트엔드 테스트
- **단위 테스트**: Jest, React Testing Library
- **컴포넌트 테스트**: 각 React 컴포넌트의 렌더링 및 동작 테스트
- **통합 테스트**: API 연동 테스트

### 7.2 백엔드 테스트
- **단위 테스트**: Jest
- **API 테스트**: Supertest
- **데이터베이스 테스트**: 테스트 데이터베이스 사용

### 7.3 E2E 테스트
- Cypress 또는 Playwright 사용 고려

## 8. 보안 고려사항

### 8.1 인증 및 권한
- JWT 토큰 만료 시간 설정
- Refresh Token 구현
- HTTPS 사용 필수

### 8.2 데이터 보호
- 개인정보 암호화 저장
- SQL Injection 방지
- XSS 공격 방지
- CORS 설정

### 8.3 API 보안
- Rate Limiting 구현
- API Key 관리
- 입력 데이터 검증

## 9. 성능 최적화

### 9.1 프론트엔드
- React.memo를 활용한 불필요한 리렌더링 방지
- 지도 데이터 lazy loading
- 이미지 최적화

### 9.2 백엔드
- 데이터베이스 인덱싱
- 캐싱 전략 (Redis 고려)
- API 응답 압축

## 10. 유지보수 및 확장성

### 10.1 코드 품질
- ESLint, Prettier 설정
- TypeScript strict mode 사용
- 코드 리뷰 프로세스

### 10.2 모니터링
- 로깅 시스템 구축
- 에러 트래킹 (Sentry 등)
- 성능 모니터링

### 10.3 배포
- CI/CD 파이프라인 구축
- Docker 컨테이너화
- 환경별 설정 관리

## 11. 일정 및 마일스톤 ✅ 완료

- **총 실제 기간**: 2주 (2025-06-17 ~ 2025-06-18)
- **Week 1 (2025-06-17)**: 프로젝트 초기 설정 + 인증 시스템 구현
- **Week 2 (2025-06-18)**: 지도 기능 이식 + 거래처 관리 기능 + UI 개선

**실제 성과**: 예상보다 빠른 개발 속도로 모든 핵심 기능 구현 완료

## 12. 리스크 관리

### 12.1 기술적 리스크
- 카카오맵 API React 통합 복잡도
- 대용량 지도 데이터 처리
- 실시간 업데이트 요구사항

### 12.2 대응 방안
- 프로토타입 개발을 통한 기술 검증
- 단계별 구현 및 테스트
- 성능 테스트 및 최적화

## 13. 문서화 계획

### 13.1 기술 문서
- API 명세서 (Swagger/OpenAPI)
- 데이터베이스 ERD
- 아키텍처 다이어그램

### 13.2 사용자 문서
- 사용자 가이드
- 관리자 가이드
- FAQ

### 13.3 개발자 문서
- 설치 가이드
- 개발 환경 설정
- 코드 컨벤션

## 14. 최종 구현 결과 요약 ✅

### 14.1 기술적 성과
- ✅ **풀스택 애플리케이션**: React + Node.js/Express + MySQL
- ✅ **인증 시스템**: JWT 기반 역할별 접근 제어
- ✅ **지도 기능**: 카카오맵 API 완전 통합
- ✅ **데이터 관리**: CRUD + 검색 + 필터링 + 페이지네이션
- ✅ **엑셀 연동**: 데이터 내보내기 및 템플릿 지원

### 14.2 사용자 경험 개선
- ✅ **실시간 인터랙션**: 마커 클릭 시 즉시 지도 이동
- ✅ **직관적 UI**: 담당자별 색상 구분, 채널별 마커 모양
- ✅ **효율적 작업흐름**: 인포윈도우에서 담당자 직접 변경
- ✅ **데이터 접근성**: 엑셀 다운로드로 신속한 데이터 추출

### 14.3 기술적 특징
- ✅ **TypeScript**: 타입 안전성 보장
- ✅ **React.createElement**: JSX 없이 순수 React 개발
- ✅ **TypeORM**: 데이터베이스 ORM
- ✅ **모듈화**: Clean Architecture 패턴 적용
- ✅ **성능 최적화**: 이벤트 처리 및 메모리 관리

### 14.4 확장성
- ✅ **새로운 기능 추가 용이**: 모듈화된 구조
- ✅ **사용자 수 확장**: 반응형 UI 및 페이지네이션
- ✅ **데이터 확장**: 엑셀 다운로드 및 일괄 업로드 지원
- ✅ **기능 확장**: API 기반 아키텍처로 새로운 클라이언트 연동 가능

## 15. 운영 데이터 반영 현황 ✅ (2025-06-19 업데이트)

### 15.1 데이터 업로드 완료 현황
- ✅ **Users**: 519개 (사용자 계정 정보)
- ✅ **Partners**: 36,596개 (거래처 정보, upsert 방식)
- ✅ **SalesTerritory**: 2,394개 (영업구역 정보)
- ⏳ **Areas**: TopoJSON 파싱 진행 중

### 15.2 데이터 품질 및 무결성
- ✅ **외래키 참조**: 모든 관계 데이터 정합성 확보
- ✅ **중복 제거**: 사업자번호 중복 294개 정상 처리
- ✅ **타입 안전성**: TypeScript로 컴파일 타임 검증
- ✅ **업로드 검증**: 필수 필드, 데이터 형식 100% 통과

### 15.3 시스템 안정성
- ✅ **트랜잭션 처리**: 각 레코드별 개별 트랜잭션
- ✅ **에러 핸들링**: 실패 시 롤백 및 상세 로깅
- ✅ **성능 최적화**: 일괄 처리 및 진행률 표시
- ✅ **데이터 백업**: 기존 데이터 보존 후 업데이트

---

**프로젝트 상태**: 95% 완료, 운영 데이터 반영 진행 중, 배포 준비 완료

*마지막 업데이트: 2025-06-19 (운영 데이터 반영 Phase 4)*