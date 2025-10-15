import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAIResponse } from '@/lib/openai';
import {
  generateBasicInterviewQuestionPrompt,
  generateTechnicalInterviewQuestionPrompt,
} from '@/lib/prompts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, coverLetterId, type } = body;

    if (!userId || !coverLetterId || !type) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (type !== 'BASIC' && type !== 'TECHNICAL') {
      return NextResponse.json(
        { error: '면접 유형은 BASIC 또는 TECHNICAL이어야 합니다.' },
        { status: 400 }
      );
    }

    // 사용자 및 자소서 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const coverLetter = await prisma.coverLetter.findUnique({
      where: { id: coverLetterId },
    });

    if (!user || !coverLetter) {
      return NextResponse.json(
        { error: '사용자 또는 자소서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 면접 세션 생성
    const session = await prisma.interviewSession.create({
      data: {
        userId,
        coverLetterId,
        type,
      },
    });

    // 첫 번째 질문 생성
    const userInfo = {
      jobCategory: user.jobCategory,
      experience: user.experience,
      age: user.age,
      gender: user.gender,
    };

    const prompt =
      type === 'BASIC'
        ? generateBasicInterviewQuestionPrompt(userInfo, coverLetter.content)
        : generateTechnicalInterviewQuestionPrompt(userInfo, coverLetter.content);

    const question = await generateAIResponse(prompt, {
      temperature: 0.8,
      maxTokens: 500,
    });

    // 시간 제한 설정 (기본 면접: 60초, 기술 면접: 180초)
    const timeLimit = type === 'BASIC' ? 60 : 180;

    // 첫 번째 질문 저장
    const firstTurn = await prisma.interviewTurn.create({
      data: {
        sessionId: session.id,
        question: question.trim(),
        timeLimit,
        turnNumber: 1,
      },
    });

    return NextResponse.json({
      session,
      turn: firstTurn,
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    return NextResponse.json(
      { error: '면접 시작 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

