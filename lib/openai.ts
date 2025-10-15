import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GPT-4o 모델을 사용한 텍스트 생성
export async function generateAIResponse(
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('AI 응답 생성 중 오류가 발생했습니다.');
  }
}

// 스트리밍 응답 생성 (선택적 사용)
export async function generateAIStreamResponse(
  prompt: string,
  onChunk: (chunk: string) => void,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<void> {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('OpenAI API Streaming Error:', error);
    throw new Error('AI 스트리밍 응답 생성 중 오류가 발생했습니다.');
  }
}

