# 배포 가이드

## Vercel 배포 (권장)

Vercel은 Next.js의 공식 배포 플랫폼으로, 가장 쉽고 빠른 배포 방법입니다.

### 1. Vercel 프로젝트 생성

#### 방법 A: GitHub 연동 (권장)

1. 코드를 GitHub 리포지토리에 푸시
2. [Vercel Dashboard](https://vercel.com/dashboard) 접속
3. "New Project" 클릭
4. GitHub 리포지토리 선택
5. 프로젝트 설정:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Install Command: `npm install`

#### 방법 B: Vercel CLI

\`\`\`bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel
\`\`\`

### 2. Vercel Postgres 설정

1. Vercel Dashboard에서 프로젝트 선택
2. "Storage" 탭 클릭
3. "Create Database" → "Postgres" 선택
4. 데이터베이스 이름 입력 (예: ai-interview-db)
5. "Create" 클릭

환경 변수가 자동으로 프로젝트에 추가됩니다:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- 기타 Postgres 관련 변수

### 3. 환경 변수 추가

1. Vercel Dashboard → 프로젝트 → Settings → Environment Variables
2. 다음 환경 변수 추가:

\`\`\`
OPENAI_API_KEY = sk-your-api-key-here
\`\`\`

**중요**: 모든 환경(Production, Preview, Development)에 체크

### 4. 데이터베이스 마이그레이션

배포 후 데이터베이스 스키마를 생성해야 합니다.

#### 방법 A: Vercel CLI 사용

\`\`\`bash
# 프로덕션 환경 변수 가져오기
vercel env pull .env.production

# 마이그레이션 실행
npx prisma migrate deploy

# 또는 개발 마이그레이션 (최초 1회)
npx prisma db push
\`\`\`

#### 방법 B: Build Command 수정

Vercel 프로젝트 설정에서 Build Command 수정:

\`\`\`bash
npm run build && npx prisma migrate deploy
\`\`\`

**주의**: 이 방법은 빌드 시간을 증가시킬 수 있습니다.

### 5. 배포 확인

1. Vercel이 자동으로 빌드 및 배포
2. 배포 완료 후 제공되는 URL로 접속
3. 기능 테스트:
   - 사용자 등록
   - 자소서 제출
   - AI 피드백 생성 확인
   - 면접 진행

## 다른 플랫폼 배포

### Netlify

1. Netlify Dashboard에서 "New site from Git" 선택
2. 리포지토리 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. 환경 변수 설정
5. 데이터베이스는 외부 서비스 사용 (Supabase, Neon 등)

### Railway

1. [Railway](https://railway.app/) 접속
2. "New Project" → "Deploy from GitHub repo"
3. PostgreSQL 데이터베이스 자동 생성
4. 환경 변수 설정
5. 자동 배포

\`\`\`bash
# Railway CLI 사용
npm i -g @railway/cli
railway login
railway init
railway up
\`\`\`

### Docker 배포

\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
\`\`\`

\`\`\`bash
# 빌드 및 실행
docker build -t ai-interview .
docker run -p 3000:3000 --env-file .env ai-interview
\`\`\`

## 배포 후 체크리스트

### 필수 확인 사항

- [ ] 데이터베이스 연결 확인
- [ ] Prisma 마이그레이션 완료
- [ ] OpenAI API 키 정상 작동
- [ ] 사용자 등록 기능 테스트
- [ ] 자소서 제출 및 피드백 생성 테스트
- [ ] 면접 시작 및 진행 테스트
- [ ] 면접 결과 조회 테스트

### 성능 최적화

- [ ] Next.js 이미지 최적화 활성화
- [ ] API 라우트 캐싱 전략 수립
- [ ] OpenAI API 요청 제한 설정
- [ ] 데이터베이스 연결 풀링 설정

### 보안 확인

- [ ] 환경 변수 보호 확인
- [ ] API 라우트 보안 검토
- [ ] CORS 설정 확인
- [ ] Rate Limiting 구현 고려

## 모니터링 및 로깅

### Vercel Analytics

Vercel Dashboard에서 Analytics 활성화:
1. 프로젝트 → Analytics 탭
2. "Enable Analytics" 클릭

### 로그 확인

\`\`\`bash
# Vercel CLI로 로그 확인
vercel logs [deployment-url]

# 실시간 로그
vercel logs --follow
\`\`\`

### 에러 추적

프로덕션 환경에서는 에러 추적 서비스 사용 권장:
- [Sentry](https://sentry.io/)
- [LogRocket](https://logrocket.com/)
- Vercel의 기본 에러 로깅

## CI/CD 설정

### GitHub Actions (선택)

\`.github/workflows/ci.yml\`:

\`\`\`yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx prisma generate
      - run: npm run build
\`\`\`

## 비용 최적화

### OpenAI API 비용 절감

1. **토큰 제한 설정**
   - \`lib/openai.ts\`에서 \`maxTokens\` 조정
   - 불필요한 API 호출 최소화

2. **캐싱 전략**
   - 동일한 질문에 대한 응답 캐싱
   - Redis 등을 활용한 임시 저장

3. **사용량 모니터링**
   - OpenAI Dashboard에서 사용량 확인
   - 월별 예산 알림 설정

### 데이터베이스 최적화

1. **쿼리 최적화**
   - 필요한 필드만 SELECT
   - 인덱스 활용

2. **연결 풀링**
   - Prisma의 connection pooling 사용
   - Vercel Postgres의 자동 풀링 활용

## 문제 해결

### 배포 실패

**문제**: Build 실패

**해결**:
\`\`\`bash
# 로컬에서 빌드 테스트
npm run build

# 타입 에러 확인
npm run lint
\`\`\`

**문제**: 환경 변수 인식 안됨

**해결**:
1. Vercel Dashboard에서 환경 변수 재확인
2. 프로젝트 재배포
3. \`vercel env pull\`로 로컬 확인

### 런타임 에러

**문제**: OpenAI API 타임아웃

**해결**:
- Vercel Serverless Function 제한 시간 확인 (Hobby: 10초, Pro: 60초)
- 필요시 Pro 플랜 업그레이드

**문제**: 데이터베이스 연결 풀 고갈

**해결**:
- Prisma connection limit 조정
- Vercel Postgres connection pooling 활용

## 유지보수

### 정기 업데이트

\`\`\`bash
# 의존성 업데이트
npm update

# Prisma 업데이트
npm install @prisma/client@latest prisma@latest
npx prisma generate
\`\`\`

### 백업 전략

1. Vercel Postgres 자동 백업 활성화
2. 정기적인 데이터 export
3. 중요 데이터는 별도 저장소에 복제

## 참고 자료

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

