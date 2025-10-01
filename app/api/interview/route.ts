import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // 디버깅: 환경 변수 확인
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0)
    
    const { coverLetter, conversationHistory, isFirstQuestion } = await request.json()

    if (!coverLetter || coverLetter.trim().length === 0) {
      return NextResponse.json(
        { error: '자기소개서 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    let prompt = ''
    let messages: any[] = [
      {
        role: "system",
        content: "당신은 경력이 풍부한 면접관입니다. 자기소개서를 바탕으로 적절한 난이도의 면접 질문을 하고, 지원자의 답변에 대해 간단한 피드백을 제공한 후 다음 질문을 이어갑니다. 질문은 구체적이고 실무에 도움이 되는 내용으로 구성해주세요."
      }
    ]

    if (isFirstQuestion) {
      // 첫 번째 질문 생성
      prompt = `
다음 자기소개서를 바탕으로 면접 첫 번째 질문을 생성해주세요.

자기소개서 내용:
${coverLetter}

면접 질문은 다음 형식으로 작성해주세요:
- 질문 내용 (구체적이고 실무에 도움이 되는 질문)
- 질문 의도 (이 질문을 통해 무엇을 확인하려는지)

질문은 자기소개서의 핵심 내용과 관련된 것으로 하되, 지원자가 자신의 경험과 역량을 구체적으로 설명할 수 있도록 해주세요.
`
      messages.push({
        role: "user",
        content: prompt
      })
    } else {
      // 대화 이력이 있는 경우
      const historyText = conversationHistory.map((msg: any) => 
        `${msg.role === 'user' ? '지원자' : '면접관'}: ${msg.content}`
      ).join('\n')

      prompt = `
다음은 면접 대화 내용입니다:

자기소개서 내용:
${coverLetter}

대화 이력:
${historyText}

지원자의 마지막 답변에 대해 간단한 피드백(1-2문장)을 제공하고, 이어서 다음 질문을 해주세요.

응답 형식:
피드백: [지원자 답변에 대한 간단한 피드백]
다음 질문: [자기소개서와 이전 대화를 고려한 다음 질문]
`
      messages.push({
        role: "user",
        content: prompt
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 800,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('AI 응답 생성에 실패했습니다.')
    }

    return NextResponse.json({ response })

  } catch (error) {
    console.error('Interview API Error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
