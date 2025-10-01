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
    
    const { coverLetter } = await request.json()

    if (!coverLetter || coverLetter.trim().length === 0) {
      return NextResponse.json(
        { error: '자기소개서 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    const prompt = `
다음 자기소개서를 분석하여 구체적이고 실용적인 피드백을 제공해주세요.

자기소개서 내용:
${coverLetter}

다음 항목들을 포함하여 피드백을 작성해주세요:

1. **전체적인 인상** (100자 이내)
2. **강점 분석** (구체적인 예시와 함께)
3. **개선점** (구체적인 수정 방안 제시)
4. **추천 수정사항** (실제로 적용할 수 있는 구체적인 제안)
5. **점수** (100점 만점)

피드백은 건설적이고 격려적인 톤으로 작성하며, 구체적인 예시와 함께 제시해주세요.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 경력이 풍부한 HR 전문가이자 취업 컨설턴트입니다. 자기소개서를 분석하여 구체적이고 실용적인 피드백을 제공하는 것이 전문 분야입니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const feedback = completion.choices[0]?.message?.content

    if (!feedback) {
      throw new Error('AI 피드백 생성에 실패했습니다.')
    }

    return NextResponse.json({ feedback })

  } catch (error) {
    console.error('Feedback API Error:', error)
    
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
