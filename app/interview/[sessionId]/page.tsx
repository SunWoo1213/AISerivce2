'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import TextArea from '@/components/TextArea';
import Timer from '@/components/Timer';
import LoadingSpinner from '@/components/LoadingSpinner';

interface InterviewTurn {
  id: string;
  question: string;
  answer: string | null;
  timeLimit: number;
  turnNumber: number;
}

interface InterviewSession {
  id: string;
  type: 'BASIC' | 'TECHNICAL';
  user: {
    name: string;
  };
  turns: InterviewTurn[];
}

export default function InterviewPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentTurn, setCurrentTurn] = useState<InterviewTurn | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showAnswerTip, setShowAnswerTip] = useState(true);

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
        
        // 현재 턴 설정 (답변이 없는 첫 번째 턴)
        const unansweredTurn = data.session.turns.find((t: InterviewTurn) => !t.answer);
        if (unansweredTurn) {
          setCurrentTurn(unansweredTurn);
          setIsTimerRunning(true);
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      alert('면접 세션을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    setIsTimerRunning(false);
    if (!answer.trim()) {
      alert('시간이 종료되었습니다. 답변을 입력하지 않으셨네요. 다음 질문으로 넘어갑니다.');
      handleSubmitAnswer();
    }
  }, [answer]);

  const handleSubmitAnswer = async () => {
    if (!currentTurn || !session) return;

    if (!answer.trim()) {
      if (!confirm('답변을 입력하지 않았습니다. 그래도 제출하시겠습니까?')) {
        return;
      }
    }

    setIsSubmitting(true);
    setIsTimerRunning(false);

    try {
      const response = await fetch('/api/interview/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          turnId: currentTurn.id,
          answer: answer.trim() || '(답변 없음)',
        }),
      });

      if (!response.ok) {
        throw new Error('답변 제출 실패');
      }

      const data = await response.json();

      if (data.completed) {
        // 면접 완료
        endInterview();
      } else {
        // 다음 질문으로
        setCurrentTurn(data.turn);
        setAnswer('');
        setIsTimerRunning(true);
        setShowAnswerTip(true);
      }
    } catch (error) {
      console.error(error);
      alert('답변 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const endInterview = async () => {
    if (!session || !currentTurn) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/interview/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          lastTurnId: currentTurn.id,
          lastAnswer: answer.trim() || '(답변 없음)',
        }),
      });

      if (!response.ok) {
        throw new Error('면접 종료 실패');
      }

      router.push(`/interview/${session.id}/result`);
    } catch (error) {
      console.error(error);
      alert('면접 종료 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session || !currentTurn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <p className="text-gray-600">면접 정보를 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/my-page')} className="mt-4">
            마이페이지로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  const interviewTypeText = session.type === 'BASIC' ? '기본 면접' : '기술 면접';
  const totalQuestions = 5;
  const currentQuestion = currentTurn.turnNumber;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {interviewTypeText} 진행 중
            </h1>
            <p className="text-gray-600 mt-1">
              {session.user.name}님의 면접
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              질문 {currentQuestion} / {totalQuestions}
            </p>
          </div>
        </div>
      </div>

      {/* 타이머 */}
      <Card className="mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">남은 시간</p>
          <Timer
            initialTime={currentTurn.timeLimit}
            onTimeUp={handleTimeUp}
            isRunning={isTimerRunning}
          />
        </div>
      </Card>

      {/* 질문 */}
      <Card className="mb-6">
        <div className="mb-4">
          <span className="text-sm font-medium text-primary-600">
            질문 {currentQuestion}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
          {currentTurn.question}
        </h2>
      </Card>

      {/* 답변 팁 */}
      {showAnswerTip && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">💡 답변 팁</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {session.type === 'BASIC' ? (
                  <>
                    <li>• STAR 기법을 활용하세요 (상황, 과제, 행동, 결과)</li>
                    <li>• 구체적인 경험과 수치를 포함하세요</li>
                    <li>• 본인의 역할과 기여도를 명확히 설명하세요</li>
                  </>
                ) : (
                  <>
                    <li>• 기술 선택의 이유와 트레이드오프를 설명하세요</li>
                    <li>• 구현 과정과 해결한 문제를 구체적으로 서술하세요</li>
                    <li>• 기술에 대한 깊이 있는 이해를 보여주세요</li>
                  </>
                )}
              </ul>
            </div>
            <button
              onClick={() => setShowAnswerTip(false)}
              className="text-blue-400 hover:text-blue-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 답변 입력 */}
      <Card className="mb-6">
        <TextArea
          label="답변"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={12}
          placeholder="답변을 입력하세요..."
          helperText={`${answer.length}자 입력됨`}
        />
      </Card>

      {/* 액션 버튼 */}
      <div className="flex gap-4">
        <Button
          onClick={handleSubmitAnswer}
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="flex-1"
          size="lg"
        >
          {currentQuestion >= totalQuestions ? '면접 완료' : '다음 질문'}
        </Button>
        <Button
          onClick={() => {
            if (confirm('면접을 종료하시겠습니까?')) {
              endInterview();
            }
          }}
          variant="danger"
          disabled={isSubmitting}
          size="lg"
        >
          면접 종료
        </Button>
      </div>
    </div>
  );
}

