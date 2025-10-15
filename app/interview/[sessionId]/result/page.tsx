'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';

interface InterviewTurn {
  id: string;
  question: string;
  answer: string | null;
  feedback: string | null;
  turnNumber: number;
}

interface InterviewSession {
  id: string;
  type: 'BASIC' | 'TECHNICAL';
  feedback: string | null;
  user: {
    name: string;
    jobCategory: string;
  };
  turns: InterviewTurn[];
  createdAt: string;
}

export default function InterviewResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/interview/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <p className="text-gray-600">면접 결과를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/my-page')} className="mt-4">
            마이페이지로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  const interviewTypeText = session.type === 'BASIC' ? '기본 면접' : '기술 면접';
  const answeredTurns = session.turns.filter((t) => t.answer);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8 print:mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {interviewTypeText} 결과
            </h1>
            <p className="text-gray-600">
              {session.user.name}님 · {session.user.jobCategory}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(session.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
          <div className="print:hidden space-x-2">
            <Button onClick={handlePrint} variant="outline">
              PDF로 저장
            </Button>
            <Button onClick={() => router.push('/my-page')}>
              마이페이지로
            </Button>
          </div>
        </div>

        {/* 완료 배너 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">
                면접이 완료되었습니다!
              </h3>
              <p className="text-sm text-green-700">
                총 {answeredTurns.length}개의 질문에 답변하셨습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 종합 피드백 */}
      {session.feedback && (
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📊 종합 피드백
          </h2>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {session.feedback}
            </div>
          </div>
        </Card>
      )}

      {/* 질문별 상세 피드백 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          질문별 상세 내역
        </h2>

        {answeredTurns.map((turn, index) => (
          <Card key={turn.id} className="break-inside-avoid">
            <div className="mb-4">
              <span className="text-sm font-medium text-primary-600">
                질문 {turn.turnNumber}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mt-2">
                {turn.question}
              </h3>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                내 답변:
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {turn.answer}
                </p>
              </div>
            </div>

            {turn.feedback && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  피드백:
                </h4>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {turn.feedback}
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* 하단 액션 */}
      <div className="mt-12 print:hidden">
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              다음 단계
            </h3>
            <p className="text-gray-600 mb-6">
              피드백을 바탕으로 더 나은 답변을 준비해보세요!
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push('/my-page')}
                variant="outline"
              >
                마이페이지
              </Button>
              <Button
                onClick={() => window.location.reload()}
              >
                다시 면접보기
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 인쇄 스타일 */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem;
          }
          .break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

