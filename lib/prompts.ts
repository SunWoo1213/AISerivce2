// AI 프롬프트 템플릿 관리

interface UserInfo {
  jobCategory: string;
  experience: string;
  age: number;
  gender: string;
}

export const generateCoverLetterFeedbackPrompt = (
  userInfo: UserInfo,
  coverLetterContent: string
): string => {
  return `당신은 ${userInfo.jobCategory} 분야의 채용 전문가입니다.

다음 지원자의 자기소개서를 면밀히 분석하여 전문적이고 구체적인 피드백을 제공해주세요.

지원자 정보:
- 직군: ${userInfo.jobCategory}
- 경력: ${userInfo.experience}
- 나이: ${userInfo.age}세
- 성별: ${userInfo.gender}

자기소개서 내용:
${coverLetterContent}

다음 항목에 대해 피드백을 제공해주세요:

1. **전체 구성 및 논리성** (5점 만점)
   - 글의 흐름과 구조
   - 논리적 전개

2. **직무 적합성** (5점 만점)
   - 직무 이해도
   - 관련 경험/역량 제시

3. **구체성 및 진정성** (5점 만점)
   - 구체적인 사례 제시
   - 진정성 있는 표현

4. **문장력 및 표현** (5점 만점)
   - 맞춤법, 문법
   - 가독성

각 항목별로:
- 점수 (X/5)
- 잘한 점 2가지
- 개선할 점 2가지
- 구체적인 수정 제안

마지막으로 종합 의견과 총점을 제시해주세요.

친절하지만 전문적인 말투로, 지원자가 실질적으로 개선할 수 있는 구체적인 피드백을 제공해주세요.`;
};

export const generateBasicInterviewQuestionPrompt = (
  userInfo: UserInfo,
  coverLetterContent: string,
  previousQuestions: string[] = []
): string => {
  return `당신은 ${userInfo.jobCategory} 분야의 베테랑 면접관입니다.

지원자 정보:
- 직군: ${userInfo.jobCategory}
- 경력: ${userInfo.experience}

자기소개서:
${coverLetterContent}

${previousQuestions.length > 0 ? `이전 질문들:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n` : ''}

지원자의 자기소개서 내용을 바탕으로, 다음 특성을 평가할 수 있는 **행동사건기반(BEI) 질문을 1개만** 생성해주세요:
- 인성 및 가치관
- 협업 능력 및 커뮤니케이션
- 문제 해결 능력
- 조직 적응력

질문 생성 가이드라인:
1. 자기소개서에 언급된 구체적인 경험을 기반으로 질문
2. "~했던 경험에 대해 말씀해주세요" 형식의 구체적 질문
3. STAR 기법으로 답변할 수 있는 질문
4. 지원자의 실제 행동과 사고방식을 파악할 수 있는 질문
5. 이전 질문과 중복되지 않는 새로운 관점의 질문

질문만 출력해주세요. (부가 설명 없이 질문만)`;
};

export const generateTechnicalInterviewQuestionPrompt = (
  userInfo: UserInfo,
  coverLetterContent: string,
  previousQuestions: string[] = []
): string => {
  return `당신은 ${userInfo.jobCategory} 분야의 시니어 기술 면접관입니다.

지원자 정보:
- 직군: ${userInfo.jobCategory}
- 경력: ${userInfo.experience}

자기소개서:
${coverLetterContent}

${previousQuestions.length > 0 ? `이전 질문들:\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n` : ''}

지원자의 자기소개서에 언급된 프로젝트 경험과 기술 스택을 바탕으로, 다음을 평가할 수 있는 **심화 기술 질문을 1개만** 생성해주세요:
- 기술에 대한 깊이 있는 이해
- 기술 선택의 이유와 트레이드오프
- 문제 해결 과정에서의 기술적 의사결정
- 실제 구현 경험

질문 생성 가이드라인:
1. 자기소개서에 언급된 구체적인 기술이나 프로젝트를 기반으로 질문
2. "왜 그 기술을 선택했나요?", "어떤 문제가 있었고 어떻게 해결했나요?" 등 깊이 있는 질문
3. 단순 암기 지식이 아닌, 실제 이해도와 경험을 파악할 수 있는 질문
4. 경력 수준에 맞는 적절한 난이도
5. 이전 질문과 중복되지 않는 새로운 기술 영역의 질문

질문만 출력해주세요. (부가 설명 없이 질문만)`;
};

export const generateAnswerFeedbackPrompt = (
  question: string,
  answer: string,
  interviewType: 'BASIC' | 'TECHNICAL'
): string => {
  const typeText = interviewType === 'BASIC' ? '인성/기본' : '기술';
  
  return `당신은 전문 면접관입니다. 다음 ${typeText} 면접 질문과 답변을 평가해주세요.

질문: ${question}

답변: ${answer}

다음 기준으로 피드백을 제공해주세요:

1. **잘한 점** (1-2가지)
   - 구체적으로 어떤 부분이 좋았는지

2. **개선할 점** (1-2가지)
   - 구체적으로 어떻게 개선하면 좋을지

3. **추천 답변 구조**
   - 이 질문에 대한 더 나은 답변 방식 제안

${interviewType === 'BASIC' ? 'STAR 기법(Situation, Task, Action, Result)을 기준으로 평가해주세요.' : '기술적 깊이와 정확성, 실무 경험의 구체성을 기준으로 평가해주세요.'}

친절하지만 전문적인 말투로 작성해주세요.`;
};

export const generateComprehensiveFeedbackPrompt = (
  interviewType: 'BASIC' | 'TECHNICAL',
  qaPairs: Array<{ question: string; answer: string; feedback: string }>
): string => {
  const typeText = interviewType === 'BASIC' ? '인성/기본' : '기술';
  
  return `당신은 전문 면접관입니다. 다음은 ${typeText} 면접의 전체 대화 내용입니다.

${qaPairs.map((qa, i) => `
[질문 ${i + 1}]
${qa.question}

[답변 ${i + 1}]
${qa.answer}

[개별 피드백 ${i + 1}]
${qa.feedback}
`).join('\n---\n')}

전체 면접을 종합하여 다음 내용을 포함한 종합 피드백을 작성해주세요:

1. **전체 면접 평가** (5점 만점)
   - 전반적인 답변 품질
   - 일관성 있는 태도

2. **강점** (3가지)
   - 지원자가 잘 보여준 역량이나 태도

3. **개선이 필요한 영역** (3가지)
   - 구체적인 개선 방법 포함

4. **면접 준비 조언**
   - 다음 면접을 위한 실질적인 팁

5. **최종 의견**
   - 채용 관점에서의 종합 평가

전문적이고 건설적인 톤으로 작성해주세요.`;
};

