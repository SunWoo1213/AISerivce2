import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, jobCategory, age, experience, gender } = body;

    console.log('Received user data:', { name, email, jobCategory, age, experience, gender });

    // 필수 필드 검증
    if (!name || !jobCategory || !age || !experience || !gender) {
      return NextResponse.json(
        { error: '모든 필수 정보를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 나이를 안전하게 숫자로 변환
    const ageNumber = typeof age === 'string' ? parseInt(age, 10) : Number(age);
    
    if (isNaN(ageNumber) || ageNumber < 18 || ageNumber > 100) {
      return NextResponse.json(
        { error: '올바른 나이를 입력해주세요 (18-100).' },
        { status: 400 }
      );
    }

    // 이메일이 빈 문자열이면 undefined로 처리 (unique 제약 회피)
    const emailValue = email && email.trim() !== '' ? email.trim() : undefined;

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailValue,
        jobCategory,
        age: ageNumber,
        experience,
        gender,
      },
    });

    console.log('User created successfully:', user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    console.error('Error details:', error.message, error.code);
    
    // Prisma 에러 처리
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '사용자 생성 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        coverLetters: {
          orderBy: { createdAt: 'desc' },
        },
        interviewSessions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: '사용자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

