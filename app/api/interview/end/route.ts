import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAIResponse } from '@/lib/openai';
import { generateComprehensiveFeedbackPrompt } from '@/lib/prompts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, lastTurnId, lastAnswer } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: '세션 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 마지막 답변이 있으면 저장
    if (lastTurnId && lastAnswer) {
      const lastTurn = await prisma.interviewTurn.findUnique({
        where: { id: lastTurnId },
      });

      if (lastTurn) {
        const feedbackPrompt = generateAnswerFeedbackPrompt(
          lastTurn.question,
          lastAnswer,
          lastTurn.session.type as 'BASIC' | 'TECHNICAL'
        );

        const feedback = await generateAIResponse(feedbackPrompt, {
          temperature: 0.7,
          maxTokens: 1000,
        });

        await prisma.interviewTurn.update({
          where: { id: lastTurnId },
          data: {
            answer: lastAnswer,
            feedback,
          },
        });
      }
    }

    // 전체 면접 내용 조회
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        turns: {
          orderBy: { turnNumber: 'asc' },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: '면접 세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 답변이 있는 턴만 필터링
    const answeredTurns = session.turns.filter((turn) => turn.answer);

    if (answeredTurns.length === 0) {
      return NextResponse.json({
        session,
        message: '답변이 없어 종합 피드백을 생성할 수 없습니다.',
      });
    }

    // 종합 피드백 생성
    const qaPairs = answeredTurns.map((turn) => ({
      question: turn.question,
      answer: turn.answer || '',
      feedback: turn.feedback || '',
    }));

    const comprehensivePrompt = generateComprehensiveFeedbackPrompt(
      session.type as 'BASIC' | 'TECHNICAL',
      qaPairs
    );

    const comprehensiveFeedback = await generateAIResponse(comprehensivePrompt, {
      temperature: 0.7,
      maxTokens: 3000,
    });

    // 종합 피드백 저장
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        feedback: comprehensiveFeedback,
      },
    });

    return NextResponse.json({
      session: {
        ...session,
        feedback: comprehensiveFeedback,
      },
      message: '면접이 종료되었습니다.',
    });
  } catch (error) {
    console.error('Error ending interview:', error);
    return NextResponse.json(
      { error: '면접 종료 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

