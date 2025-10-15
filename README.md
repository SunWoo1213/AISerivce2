# AI 자소서 피드백 & 모의 면접 서비스

Next.js, Prisma, Vercel Postgres, OpenAI GPT-4o를 활용한 AI 기반 자기소개서 피드백 및 맞춤형 모의 면접 웹 애플리케이션입니다.

## 주요 기능

### 1. 자기소개서 피드백
- 사용자의 직군, 경력 정보를 기반으로 맞춤형 피드백 제공
- AI가 자동으로 자소서를 분석하여 전문적인 피드백 생성
- 구성, 직무 적합성, 구체성, 문장력 등 4가지 항목 평가

### 2. AI 모의 면접
- **기본 면접**: 인성, 협업, 문제 해결 능력을 평가하는 BEI(행동사건기반) 질문
- **기술 면접**: 자소서의 기술 스택과 프로젝트를 심층 분석하는 기술 질문
- 질문별 제한 시간 (기본: 60초, 기술: 180초)
- 실시간 타이머와 답변 팁 제공

### 3. 종합 피드백
- 각 답변에 대한 개별 피드백
- 전체 면접에 대한 종합 평가
- PDF 저장 및 인쇄 기능

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **데이터베이스**: Vercel Postgres
- **ORM**: Prisma
- **AI**: OpenAI API (GPT-4o)
- **스타일링**: Tailwind CSS
- **폼 관리**: React Hook Form
- **상태 관리**: Zustand

## 시작하기

### 1. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 2. 환경 변수 설정

\`.env\` 파일을 생성하고 다음 환경 변수를 설정하세요:

\`\`\`env
# Vercel Postgres
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database

# OpenAI
OPENAI_API_KEY=your_openai_api_key
\`\`\`

### 3. 데이터베이스 설정

\`\`\`bash
# Prisma 마이그레이션
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
\`\`\`

### 4. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

\`\`\`
├── app/                          # Next.js App Router
│   ├── api/                      # API 라우트
│   │   ├── users/                # 사용자 관리 API
│   │   ├── cover-letters/        # 자소서 관리 API
│   │   └── interview/            # 면접 관리 API
│   ├── interview/                # 면접 페이지
│   │   └── [sessionId]/
│   │       ├── page.tsx          # 면접 진행 페이지
│   │       └── result/
│   │           └── page.tsx      # 면접 결과 페이지
│   ├── my-page/                  # 마이페이지
│   ├── submit-cover-letter/      # 자소서 제출 페이지
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈페이지 (정보 입력)
│   └── globals.css               # 전역 스타일
├── components/                   # 재사용 가능한 컴포넌트
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── TextArea.tsx
│   ├── Timer.tsx
│   └── LoadingSpinner.tsx
├── lib/                          # 유틸리티 함수
│   ├── prisma.ts                 # Prisma 클라이언트
│   ├── openai.ts                 # OpenAI 유틸리티
│   ├── prompts.ts                # AI 프롬프트 템플릿
│   └── store.ts                  # Zustand 스토어
├── prisma/
│   └── schema.prisma             # 데이터베이스 스키마
└── ...
\`\`\`

## 데이터베이스 스키마

### User (사용자)
- 이름, 이메일, 직군, 나이, 경력, 성별

### CoverLetter (자기소개서)
- 내용, 상태 (PENDING/COMPLETED/ERROR), 피드백

### InterviewSession (면접 세션)
- 유형 (BASIC/TECHNICAL), 종합 피드백

### InterviewTurn (면접 턴)
- 질문, 답변, 피드백, 제한 시간

## 사용 흐름

1. **기본 정보 입력** (`/`)
   - 이름, 직군, 경력 등 입력
   
2. **자소서 제출** (`/submit-cover-letter`)
   - 자기소개서 작성 또는 붙여넣기
   - AI가 비동기로 피드백 생성

3. **마이페이지** (`/my-page`)
   - 제출한 자소서 목록 확인
   - 피드백 확인
   - 면접 시작 (기본/기술)

4. **면접 진행** (`/interview/[sessionId]`)
   - 타이머가 있는 질문 답변
   - 최대 5개 질문

5. **결과 확인** (`/interview/[sessionId]/result`)
   - 종합 피드백 및 개별 피드백
   - PDF 저장 가능

## 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. Vercel Postgres 데이터베이스 생성
4. 배포 후 Prisma 마이그레이션 실행:

\`\`\`bash
npx prisma migrate deploy
\`\`\`

## 주의사항

- OpenAI API 사용료가 발생할 수 있습니다
- GPT-4o 모델을 사용하며, 응답 생성에 시간이 소요될 수 있습니다
- 프로덕션 환경에서는 사용자 인증 및 보안 기능을 추가하는 것을 권장합니다

## 라이선스

MIT License

