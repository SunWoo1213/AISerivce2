# 설치 및 설정 가이드

## 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Vercel 계정 (Vercel Postgres 사용 시)
- OpenAI API 키

## 상세 설치 가이드

### 1. 프로젝트 클론 및 의존성 설치

\`\`\`bash
# 의존성 설치
npm install

# 또는
yarn install
\`\`\`

### 2. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. 로그인 후 API Keys 메뉴로 이동
3. "Create new secret key" 클릭
4. 생성된 키를 안전하게 보관

### 3. Vercel Postgres 설정 (권장)

#### Vercel 대시보드에서 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 생성 또는 선택
3. "Storage" 탭으로 이동
4. "Create Database" → "Postgres" 선택
5. 데이터베이스 이름 입력 후 생성
6. ".env.local" 탭에서 환경 변수 복사

#### 로컬 환경 변수 설정

프로젝트 루트에 \`.env\` 파일 생성:

\`\`\`env
# Vercel Postgres (Vercel에서 자동 생성된 값 사용)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# OpenAI API Key
OPENAI_API_KEY="sk-..."
\`\`\`

### 4. 다른 PostgreSQL 사용 시 (선택)

다른 PostgreSQL 서비스를 사용하는 경우:

\`\`\`env
POSTGRES_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
POSTGRES_PRISMA_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true&connection_limit=1"
POSTGRES_URL_NON_POOLING="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
\`\`\`

**지원 서비스:**
- Supabase
- Railway
- Neon
- AWS RDS
- 기타 PostgreSQL 호환 서비스

### 5. 데이터베이스 마이그레이션

\`\`\`bash
# Prisma 마이그레이션 실행
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate

# (선택) Prisma Studio로 데이터베이스 확인
npx prisma studio
\`\`\`

### 6. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 트러블슈팅

### Prisma 연결 오류

**문제**: "Can't reach database server"

**해결방법**:
1. 환경 변수가 올바르게 설정되었는지 확인
2. 데이터베이스 서버가 실행 중인지 확인
3. 방화벽 설정 확인
4. SSL 연결이 필요한 경우 connection string에 \`?sslmode=require\` 추가

### OpenAI API 오류

**문제**: "Invalid API Key"

**해결방법**:
1. API 키가 \`.env\` 파일에 올바르게 설정되었는지 확인
2. API 키가 유효한지 확인 (OpenAI Dashboard에서)
3. 개발 서버 재시작

**문제**: "Rate limit exceeded"

**해결방법**:
1. OpenAI API 사용량 확인
2. 요청 빈도 조절
3. API 요금제 업그레이드 고려

### Vercel 배포 시 이슈

**문제**: 배포 후 데이터베이스 연결 실패

**해결방법**:
1. Vercel 프로젝트 설정에서 환경 변수 확인
2. 데이터베이스 마이그레이션 실행:
   \`\`\`bash
   # Vercel CLI 설치
   npm i -g vercel
   
   # 배포 후 마이그레이션
   vercel env pull .env.production
   npx prisma migrate deploy
   \`\`\`

## 환경별 설정

### 개발 환경

\`\`\`.env.local
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 프로덕션 환경

Vercel 환경 변수에 다음을 추가:
- \`POSTGRES_URL\`
- \`POSTGRES_PRISMA_URL\`
- \`POSTGRES_URL_NON_POOLING\`
- \`OPENAI_API_KEY\`

## 보안 권장사항

1. **환경 변수 보호**
   - \`.env\` 파일을 절대 Git에 커밋하지 마세요
   - \`.gitignore\`에 \`.env*\` 추가 확인

2. **API 키 관리**
   - OpenAI API 키는 서버 사이드에서만 사용
   - 클라이언트에 노출되지 않도록 주의

3. **데이터베이스 보안**
   - 프로덕션 환경에서는 SSL 연결 사용
   - 강력한 비밀번호 설정
   - IP 화이트리스트 설정 고려

## 다음 단계

설치가 완료되면:

1. [README.md](./README.md)에서 프로젝트 구조 확인
2. 테스트 자소서 제출 및 면접 진행
3. 필요에 따라 프롬프트 커스터마이징 (\`lib/prompts.ts\`)
4. UI 스타일 조정 (Tailwind CSS)

## 문의 및 지원

문제가 발생하면:
1. GitHub Issues에서 유사한 문제 검색
2. 새로운 Issue 생성
3. 프로젝트 문서 재확인

