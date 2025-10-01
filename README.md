# AI 자소서 피드백 & 모의 면접 서비스

Next.js App Router 기반의 AI 자기소개서 피드백 및 모의 면접 웹 서비스입니다.

## 주요 기능

### 🎯 AI 자소서 피드백
- 작성한 자기소개서를 AI가 분석하여 구체적인 피드백 제공
- 강점 분석, 개선점, 구체적인 수정 방안 제시
- 100점 만점 점수 제공

### 🎤 AI 모의 면접
- 자소서 기반 맞춤형 면접 질문 생성
- 실시간 채팅 형식의 면접 진행
- 답변에 대한 즉시 피드백과 다음 질문 제공

### 🔄 연동 기능
- 피드백 페이지에서 바로 모의 면접으로 이동 가능
- 자소서 내용 자동 전달 및 연속성 보장

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Deployment**: Vercel (권장)

## 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd ai-cover-letter-service
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# OpenAI API Key (필수)
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**OpenAI API 키 발급 방법:**
1. [OpenAI 웹사이트](https://platform.openai.com/)에 가입
2. API Keys 섹션에서 새 API 키 생성
3. 생성된 키를 `.env.local` 파일에 추가

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── feedback/      # 자소서 피드백 API
│   │   └── interview/     # 모의 면접 API
│   ├── feedback/          # 피드백 페이지
│   ├── interview/         # 모의 면접 페이지
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ChatMessage.tsx
│   ├── LoadingSpinner.tsx
│   └── TextArea.tsx
├── public/               # 정적 파일
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 주요 컴포넌트

### Button
재사용 가능한 버튼 컴포넌트 (primary, secondary, outline 스타일 지원)

### TextArea
텍스트 입력을 위한 textarea 컴포넌트

### ChatMessage
채팅 메시지 표시를 위한 컴포넌트

### LoadingSpinner
로딩 상태 표시를 위한 스피너 컴포넌트

### Card
콘텐츠를 감싸는 카드 컴포넌트

## API 엔드포인트

### POST /api/feedback
자기소개서 피드백을 요청합니다.

**Request Body:**
```json
{
  "coverLetter": "자기소개서 내용"
}
```

**Response:**
```json
{
  "feedback": "AI가 생성한 피드백 내용"
}
```

### POST /api/interview
모의 면접 질문을 요청합니다.

**Request Body:**
```json
{
  "coverLetter": "자기소개서 내용",
  "conversationHistory": [
    {
      "role": "user|assistant",
      "content": "메시지 내용"
    }
  ],
  "isFirstQuestion": true|false
}
```

**Response:**
```json
{
  "response": "AI가 생성한 질문 또는 피드백"
}
```

## 배포

### Vercel 배포 (권장)

1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `OPENAI_API_KEY`: OpenAI API 키
   - `NEXT_PUBLIC_APP_URL`: 배포된 도메인 URL
4. 배포 완료

### 다른 플랫폼 배포

```bash
npm run build
npm start
```

## 사용법

1. **메인 페이지**: 두 개의 주요 기능 버튼 선택
2. **피드백 페이지**: 자소서 입력 → 피드백 요청 → 결과 확인 → 모의 면접으로 이동
3. **모의 면접 페이지**: 자소서 입력 → 면접 시작 → 질문에 답변 → 실시간 피드백

## 주의사항

- OpenAI API 사용량에 따라 비용이 발생할 수 있습니다
- API 키는 절대 공개하지 마세요
- 개발 환경에서는 `.env.local` 파일을 `.gitignore`에 추가하세요

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
