# 카카오맵 위치 정보 시스템 기술 아키텍처

## 📋 시스템 개요

### 프로젝트 정보
- **프로젝트명**: 카카오맵 기반 위치 정보 시스템
- **개발 기간**: 2025-06-17 ~ 2025-06-19 (3일)
- **개발 상태**: ✅ 완료 (운영 준비 완료)
- **사용자 규모**: 약 50명 내외
- **데이터 규모**: 거래처 36,596개, 영업구역 3,554개

---

## 🏗️ 시스템 아키텍처

### 전체 아키텍처
```
Frontend (React)     Backend (Node.js)     Database (MySQL)
    │                       │                      │
    ├─ 카카오맵 API         ├─ Express Server      ├─ Users (519개)
    ├─ JWT 인증            ├─ TypeORM             ├─ Partners (36,596개)
    ├─ 권한별 UI           ├─ JWT 미들웨어        ├─ SalesTerritory (2,394개)
    ├─ 필터링 시스템       ├─ 권한 관리            └─ Areas (3,554개)
    └─ 엑셀 다운로드       └─ CORS 설정
```

### 폴더 구조
```
/New_Map_Project/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── services/      # API 서비스
│   │   ├── hooks/         # 커스텀 훅
│   │   ├── types/         # TypeScript 타입
│   │   └── utils/         # 유틸리티 함수
│   └── public/            # 정적 파일
├── server/                # Node.js 백엔드
│   ├── src/
│   │   ├── controllers/   # API 컨트롤러
│   │   ├── models/        # 데이터베이스 모델
│   │   ├── routes/        # API 라우트
│   │   ├── middlewares/   # 미들웨어
│   │   ├── services/      # 비즈니스 로직
│   │   ├── scripts/       # 데이터 업로드 스크립트
│   │   └── config/        # 설정 파일
├── data/                  # 원본 데이터 파일
└── docs/                  # 프로젝트 문서
```

---

## 💻 기술 스택

### 프론트엔드
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript
- **Map API**: 카카오맵 API
- **Styling**: CSS-in-JS (React.createElement)
- **HTTP Client**: Fetch API
- **File Processing**: xlsx 라이브러리

### 백엔드
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Development**: nodemon, ts-node

### 데이터베이스
- **RDBMS**: MySQL 8.0
- **Connection**: TypeORM
- **Migration**: TypeORM Migration
- **Data Types**: JSON, DECIMAL, VARCHAR

### 개발 도구
- **Package Manager**: npm
- **Code Quality**: ESLint
- **API Testing**: curl, Postman
- **Development**: Hot Reload (Vite + nodemon)

---

## 🗄️ 데이터베이스 설계

### ERD (Entity Relationship Diagram)
```
Users                    Partners                Areas
├─ employeeId (PK)      ├─ partnerCode (PK)     ├─ id (PK)
├─ employeeName         ├─ partnerName          ├─ name
├─ branchName           ├─ businessNumber       ├─ admCd
├─ officeName           ├─ businessAddress      ├─ coordinates (JSON)
├─ position             ├─ channel              ├─ properties (JSON)
├─ jobTitle             ├─ currentManagerId     ├─ salesTerritory (조인)
└─ password             └─ latitude/longitude   └─ isActive

SalesTerritory
├─ territoryId (PK)
├─ admCd (FK → Areas)
├─ branchName
├─ officeName
├─ managerName
├─ managerEmployeeId (FK → Users)
└─ sido/gungu
```

### 주요 관계
- **Users ↔ Partners**: currentManagerEmployeeId로 연결
- **Areas ↔ SalesTerritory**: admCd(행정구역코드)로 조인
- **Users ↔ SalesTerritory**: managerEmployeeId로 연결

---

## 🔐 인증 및 권한 시스템

### JWT 기반 인증
```javascript
// JWT 토큰 구조
{
  "employeeId": "20230001",
  "employeeName": "홍길동",
  "position": "팀장",
  "jobTitle": "영업팀장",
  "branchName": "주류수도권1지사",
  "officeName": "주류강남지점"
}
```

### 권한 레벨
1. **Admin**: 시스템관리자
   - 모든 데이터 접근
   - 모든 필터 사용 가능
   - CRUD 모든 작업 가능

2. **Manager**: 지점장
   - 해당 지점 소속 데이터만 접근
   - 담당자 필터 사용 가능
   - 생성/수정 작업 가능

3. **User**: 일반 사용자
   - 본인 담당 데이터만 접근
   - 조회만 가능

---

## 🗺️ 지도 시스템 아키텍처

### 카카오맵 API 연동
```javascript
// 마커 표시 시스템
마커 타입별 구분:
├─ 업소: 사각형 (square)
├─ 매장: 원형 (circle)
└─ 기타: 다이아몬드 (diamond)

색상 시스템:
├─ 담당자별 고유 색상 (해시 기반)
├─ 12색 팔레트 사용
└─ 담당자 없음: 회색 (#999999)
```

### 영역 표시 시스템
```javascript
// 폴리곤 렌더링
좌표 변환: 
GeoJSON {lat, lng} → [lng, lat] → KakaoMap LatLng

영역 인터랙션:
├─ 마우스 오버: 행정구역명 툴팁
├─ 마우스 이동: 툴팁 따라다님
├─ 마우스 아웃: 툴팁 자동 사라짐
└─ 담당자별 색상 적용
```

---

## 🔄 API 설계

### REST API 엔드포인트
```
인증 API:
POST   /api/auth/login     # 로그인
GET    /api/auth/me        # 프로필 조회
POST   /api/auth/logout    # 로그아웃

거래처 API:
GET    /api/partners       # 거래처 목록 (필터링, 페이지네이션)
GET    /api/partners/:id   # 거래처 상세
PUT    /api/partners/:id   # 거래처 수정
POST   /api/partners/bulk  # 일괄 업로드

영역 API:
GET    /api/areas                        # 영역 목록
GET    /api/areas/with-sales-territory   # 영역+담당자 정보

필터 API:
GET    /api/partners/filter-options      # 필터 옵션 조회
```

### 권한별 API 접근 제어
```javascript
// 미들웨어 체인
Router → authenticate → authorize → controller

권한 검증:
├─ JWT 토큰 유효성 검사
├─ 사용자 권한 레벨 확인
└─ 리소스별 접근 권한 검증
```

---

## 📊 성능 최적화

### 프론트엔드 최적화
- **지연 로딩**: 조회 버튼 클릭 시에만 데이터 로드
- **필터링**: 클라이언트 사이드 유효성 검증
- **마커 렌더링**: 유효한 좌표만 렌더링 (한국 영역 내)
- **메모리 관리**: 컴포넌트 언마운트 시 리소스 정리

### 백엔드 최적화
- **데이터베이스 조인**: LEFT JOIN으로 필요한 데이터만 조회
- **페이지네이션**: LIMIT/OFFSET으로 메모리 사용량 제한
- **인덱스**: 검색 필드에 대한 인덱스 활용
- **중복 제거**: Map 구조로 중복 영역 처리

### 데이터베이스 최적화
```sql
-- 자주 사용되는 인덱스
CREATE INDEX idx_partners_manager ON partners(currentManagerEmployeeId);
CREATE INDEX idx_partners_branch ON partners(branchName);
CREATE INDEX idx_salesterritory_admcd ON sales_territories(admCd);
CREATE INDEX idx_areas_admcd ON areas(admCd);
```

---

## 🛡️ 보안 고려사항

### 인증 보안
- **JWT Secret**: 복잡한 시크릿 키 사용
- **토큰 만료**: 7일 자동 만료
- **비밀번호**: bcrypt 해싱 (saltRounds: 10)
- **CORS**: 특정 도메인만 허용

### 데이터 보안
- **개인정보 보호**: 민감한 정보 마스킹
- **SQL Injection**: TypeORM 파라미터 바인딩
- **XSS 방지**: HTML 이스케이핑
- **권한 분리**: 리소스별 세밀한 권한 제어

---

## 🚀 배포 환경

### 개발 환경
```bash
# 백엔드 실행
cd server
npm run dev          # nodemon으로 자동 재시작

# 프론트엔드 실행  
cd client
npm run dev          # Vite 개발 서버
```

### 환경변수 설정
```bash
# 서버 (.env)
DB_HOST=127.0.0.1
DB_DATABASE=kakao_map_db
JWT_SECRET=your_jwt_secret
PORT=5001

# 클라이언트 (.env)
VITE_KAKAO_API_KEY=your_kakao_api_key
VITE_API_URL=http://localhost:5001/api
```

---

## 📈 모니터링 및 로깅

### 로깅 시스템
- **인증 로그**: 로그인/로그아웃 기록
- **API 접근 로그**: 요청/응답 시간 기록
- **에러 로그**: 상세한 스택 트레이스
- **권한 로그**: 권한별 데이터 접근 기록

### 성능 모니터링
- **API 응답 시간**: 평균 100ms 이하 유지
- **데이터베이스 쿼리**: 실행 계획 최적화
- **메모리 사용량**: 서버 리소스 모니터링
- **동시 접속자**: 최대 50명 지원

---

## 🔧 확장 가능성

### 수평 확장
- **로드 밸런서**: nginx 또는 AWS ALB
- **데이터베이스**: MySQL 읽기 전용 복제본
- **캐싱**: Redis 도입 가능
- **CDN**: 정적 파일 캐싱

### 기능 확장
- **실시간 알림**: WebSocket 연동
- **대시보드**: 통계 차트 추가
- **모바일 앱**: React Native 포팅
- **API 버전 관리**: RESTful API 버전닝

---

*작성일: 2025-06-19*
*작성자: Claude AI*
*상태: 운영 준비 완료*