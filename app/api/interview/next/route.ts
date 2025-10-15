import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAIResponse } from '@/lib/openai';
import {
  generateBasicInterviewQuestionPrompt,
  generateTechnicalInterviewQuestionPrompt,
  generateAnswerFeedbackPrompt,
} from '@/lib/prompts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, turnId, answer } = body;

    if (!sessionId || !turnId || !answer) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 현재 턴 업데이트 (답변 저장)
    const currentTurn = await prisma.interviewTurn.findUnique({
      where: { id: turnId },
      include: { session: true },
    });

    if (!currentTurn) {
      return NextResponse.json(
        { error: '면접 턴을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 답변에 대한 피드백 생성
    const feedbackPrompt = generateAnswerFeedbackPrompt(
      currentTurn.question,
      answer,
      currentTurn.session.type as 'BASIC' | 'TECHNICAL'
    );

    const feedback = await generateAIResponse(feedbackPrompt, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    // 답변 및 피드백 저장
    await prisma.interviewTurn.update({
      where: { id: turnId },
      data: {
        answer,
        feedback,
      },
    });

    // 다음 질문 생성 (최대 5개 질문까지)
    const turnCount = await prisma.interviewTurn.count({
      where: { sessionId },
    });

    const maxTurns = 5; // 최대 질문 개수

    if (turnCount >= maxTurns) {
      return NextResponse.json({
        completed: true,
        message: '면접이 완료되었습니다.',
      });
    }

    // 사용자 및 자소서 정보 조회
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
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

    const coverLetter = await prisma.coverLetter.findUnique({
      where: { id: session.coverLetterId || '' },
    });

    if (!coverLetter) {
      return NextResponse.json(
        { error: '자소서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이전 질문들 수집
    const previousQuestions = session.turns.map((turn) => turn.question);

    const userInfo = {
      jobCategory: session.user.jobCategory,
      experience: session.user.experience,
      age: session.user.age,
      gender: session.user.gender,
    };

    const prompt =
      session.type === 'BASIC'
        ? generateBasicInterviewQuestionPrompt(
            userInfo,
            coverLetter.content,
            previousQuestions
          )
        : generateTechnicalInterviewQuestionPrompt(
            userInfo,
            coverLetter.content,
            previousQuestions
          );

    const nextQuestion = await generateAIResponse(prompt, {
      temperature: 0.8,
      maxTokens: 500,
    });

    const timeLimit = session.type === 'BASIC' ? 60 : 180;

    // 다음 질문 저장
    const nextTurn = await prisma.interviewTurn.create({
      data: {
        sessionId,
        question: nextQuestion.trim(),
        timeLimit,
        turnNumber: turnCount + 1,
      },
    });

    return NextResponse.json({
      turn: nextTurn,
      completed: false,
    });
  } catch (error) {
    console.error('Error processing next interview turn:', error);
    return NextResponse.json(
      { error: '다음 질문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

