# CLAUDE.md - 프로젝트 컨텍스트

## 프로젝트 개요
카카오맵 기반 위치 정보 시스템을 HTML/CSS/JavaScript에서 React + Node.js/Express 풀스택 애플리케이션으로 리팩토링하는 프로젝트입니다.

## 프로젝트 구조
```
/Users/rae/projects/New_Map_Project/
├── client/                        # React 프론트엔드
│   ├── src/
│   │   ├── components/           # UI 컴포넌트
│   │   ├── pages/               # 페이지 컴포넌트
│   │   ├── services/            # API 서비스
│   │   ├── hooks/               # 커스텀 훅
│   │   ├── store/               # 상태 관리
│   │   ├── types/               # TypeScript 타입
│   │   └── utils/               # 유틸리티 함수
├── server/                        # Express 백엔드
│   ├── src/
│   │   ├── controllers/         # 컨트롤러
│   │   ├── services/           # 비즈니스 로직
│   │   ├── repositories/       # 데이터 접근
│   │   ├── models/             # 데이터베이스 모델
│   │   ├── middlewares/        # 미들웨어
│   │   ├── routes/             # API 라우트
│   │   ├── config/             # 설정
│   │   ├── types/              # TypeScript 타입
│   │   └── utils/              # 유틸리티 함수
├── docs/
│   ├── requirements-definition.md  # 요구사항 정의서
│   └── refactoring-plan.md        # 리팩토링 계획서
└── CLAUDE.md                      # 프로젝트 컨텍스트 (현재 파일)
```

## 소스 프로젝트 정보
- **위치**: /project/map
- **기술**: HTML, CSS, JavaScript
- **주요 기능**: 
  - 카카오맵 API를 사용한 지도 표시
  - 지도 위 마커 표시
  - 영역 표시 기능
  - 서버 없이 클라이언트에서만 동작

## 타겟 프로젝트 정보
- **위치**: /project/server
- **기술**: 
  - Frontend: React
  - Backend: Node.js, Express
  - Database: PostgreSQL 또는 MySQL
- **아키텍처**: MVC, Clean Architecture, SOLID 원칙 준수

## 주요 리팩토링 목표
1. 유지보수성 향상
2. 로그인 기능 및 사용자별 권한 관리 추가
3. 거래처 데이터 관리 기능 개선
4. 데이터베이스 연동
5. 테스트 코드 작성
6. TopoJSON 형식의 공간 데이터 지원 추가

## 예상 사용자
- 약 50명 내외
- 개인정보를 포함한 데이터 처리

## 개발 지침
- SOLID 원칙 준수
- 중간 수준의 모듈화
- 모듈별/기능별 문서화 필요
- API 문서 및 사용자 가이드 작성 필요

## 보안 고려사항
- 개인정보 포함 데이터 처리
- 사용자 인증 및 권한 관리 필수
- JWT 기반 인증 시스템 구현

## 테스트 요구사항
- 단위 테스트 작성 필수
- Jest, React Testing Library, Supertest 사용

## 향후 확장 계획
- 확장 가능한 아키텍처 설계 필요
- 사용자 수 증가에 대비한 성능 최적화 고려

## 개발 명령어
```bash
# 프론트엔드
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run test       # 테스트 실행
npm run lint       # 린트 검사

# 백엔드
npm run dev        # 개발 서버 실행
npm run start      # 프로덕션 서버 실행
npm run test       # 테스트 실행
npm run lint       # 린트 검사
```

## 개발 주의사항
- **서버 관리**: 서버 구동 및 재시작은 사용자가 직접 관리
- **변경 알림**: 서버 재시작이 필요한 경우 Claude가 명시적으로 알림

## 참고 문서
- [요구사항 정의서](./docs/requirements-definition.md)
- [리팩토링 계획서](./docs/refactoring-plan.md)

---
*이 문서는 Claude가 프로젝트 컨텍스트를 이해하고 효율적으로 작업할 수 있도록 돕기 위해 작성되었습니다.*