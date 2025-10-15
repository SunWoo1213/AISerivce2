import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

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

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching interview session:', error);
    return NextResponse.json(
      { error: '면접 세션 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

