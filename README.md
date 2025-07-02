# 카카오맵 위치 정보 시스템

React + Node.js/Express + PostgreSQL을 사용한 위치 정보 관리 시스템

## 프로젝트 구조

```
.
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/    # UI 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── services/     # API 서비스
│   │   ├── hooks/        # 커스텀 훅
│   │   ├── store/        # 상태 관리
│   │   ├── types/        # TypeScript 타입
│   │   └── utils/        # 유틸리티 함수
│   └── public/           # 정적 파일
├── server/                # Express 백엔드
│   └── src/
│       ├── controllers/  # 컨트롤러
│       ├── services/    # 비즈니스 로직
│       ├── repositories/# 데이터 접근
│       ├── models/      # 데이터베이스 모델
│       ├── middlewares/ # 미들웨어
│       ├── routes/      # API 라우트
│       ├── config/      # 설정
│       ├── types/       # TypeScript 타입
│       └── utils/       # 유틸리티 함수
└── docs/                 # 문서
```

## 시작하기

### 사전 요구사항

- Node.js (v18.18.0 이상)
- PostgreSQL
- npm 또는 yarn

### 설치

1. 의존성 설치

```bash
# 클라이언트
cd client
npm install

# 서버
cd ../server
npm install
```

2. 환경 변수 설정

```bash
# server 디렉토리에서
cp .env.example .env
# .env 파일을 열어 데이터베이스 정보 등을 설정
```

3. 데이터베이스 생성

```sql
CREATE DATABASE kakao_map_db;
```

### 개발 서버 실행

```bash
# 터미널 1 - 백엔드 서버
cd server
npm run dev

# 터미널 2 - 프론트엔드 서버
cd client
npm run dev
```

- 프론트엔드: http://localhost:3000
- 백엔드: http://localhost:5000

## 주요 기능

- 카카오맵 기반 지도 표시
- 거래처 위치 마커 표시
- 영역 표시 및 관리
- 사용자 인증 (JWT)
- 역할 기반 권한 관리 (Admin, Manager, User)

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 거래처
- `GET /api/partners` - 거래처 목록
- `GET /api/partners/:id` - 거래처 상세
- `POST /api/partners` - 거래처 생성
- `PUT /api/partners/:id` - 거래처 수정
- `DELETE /api/partners/:id` - 거래처 삭제

### 영역
- `GET /api/areas` - 영역 목록
- `POST /api/areas` - 영역 생성
- `PUT /api/areas/:id` - 영역 수정
- `DELETE /api/areas/:id` - 영역 삭제

## 테스트

```bash
# 클라이언트 테스트
cd client
npm test

# 서버 테스트
cd server
npm test
```

## 빌드

```bash
# 클라이언트 빌드
cd client
npm run build

# 서버 빌드
cd server
npm run build
```

## 라이선스

ISC