import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAIResponse } from '@/lib/openai';
import { generateCoverLetterFeedbackPrompt } from '@/lib/prompts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, userId } = body;

    if (!content || !userId) {
      return NextResponse.json(
        { error: '자소서 내용과 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 자소서 저장
    const coverLetter = await prisma.coverLetter.create({
      data: {
        content,
        userId,
        status: 'PENDING',
      },
    });

    // 백그라운드에서 AI 피드백 생성 (비동기)
    generateFeedbackAsync(coverLetter.id, user, content);

    return NextResponse.json(
      { 
        coverLetter,
        message: '자소서가 제출되었습니다. 피드백 생성 중입니다.' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating cover letter:', error);
    return NextResponse.json(
      { error: '자소서 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const coverLetterId = searchParams.get('id');

    if (coverLetterId) {
      // 특정 자소서 조회
      const coverLetter = await prisma.coverLetter.findUnique({
        where: { id: coverLetterId },
      });

      if (!coverLetter) {
        return NextResponse.json(
          { error: '자소서를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ coverLetter });
    }

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용자의 모든 자소서 조회
    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ coverLetters });
  } catch (error) {
    console.error('Error fetching cover letters:', error);
    return NextResponse.json(
      { error: '자소서 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 비동기로 피드백 생성
async function generateFeedbackAsync(
  coverLetterId: string,
  user: any,
  content: string
) {
  try {
    const prompt = generateCoverLetterFeedbackPrompt(
      {
        jobCategory: user.jobCategory,
        experience: user.experience,
        age: user.age,
        gender: user.gender,
      },
      content
    );

    const feedback = await generateAIResponse(prompt, {
      temperature: 0.7,
      maxTokens: 2500,
    });

    // 피드백을 DB에 저장
    await prisma.coverLetter.update({
      where: { id: coverLetterId },
      data: {
        feedback,
        status: 'COMPLETED',
      },
    });

    console.log(`Feedback generated for cover letter: ${coverLetterId}`);
  } catch (error) {
    console.error('Error generating feedback:', error);
    
    // 에러 발생 시 상태 업데이트
    await prisma.coverLetter.update({
      where: { id: coverLetterId },
      data: {
        status: 'ERROR',
        feedback: '피드백 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
      },
    });
  }
}

