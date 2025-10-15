'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store';
import Button from '@/components/Button';
import Card from '@/components/Card';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CoverLetter {
  id: string;
  content: string;
  status: string;
  feedback: string | null;
  createdAt: string;
}

export default function MyPage() {
  const router = useRouter();
  const userId = useUserStore((state) => state.userId);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  useEffect(() => {
    if (!userId) {
      router.push('/');
      return;
    }
    fetchCoverLetters();
  }, [userId, router]);

  const fetchCoverLetters = async () => {
    try {
      const response = await fetch(`/api/cover-letters?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCoverLetters(data.coverLetters);
      }
    } catch (error) {
      console.error('Error fetching cover letters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startInterview = async (coverLetterId: string, type: 'BASIC' | 'TECHNICAL') => {
    setIsStartingInterview(true);
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coverLetterId, type }),
      });

      if (!response.ok) {
        throw new Error('면접 시작 실패');
      }

      const data = await response.json();
      router.push(`/interview/${data.session.id}`);
    } catch (error) {
      console.error(error);
      alert('면접 시작 중 오류가 발생했습니다.');
    } finally {
      setIsStartingInterview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
        <Button onClick={() => router.push('/submit-cover-letter')}>
          새 자소서 제출
        </Button>
      </div>

      {coverLetters.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">제출된 자소서가 없습니다.</p>
            <Button onClick={() => router.push('/submit-cover-letter')}>
              자소서 제출하기
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 자소서 목록 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              제출한 자소서 목록
            </h2>
            {coverLetters.map((letter) => (
              <Card key={letter.id} padding="md" className="cursor-pointer hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm text-gray-500">
                    {new Date(letter.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      letter.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : letter.status === 'ERROR'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {letter.status === 'COMPLETED'
                      ? '피드백 완료'
                      : letter.status === 'ERROR'
                      ? '오류 발생'
                      : '처리 중...'}
                  </span>
                </div>

                <p className="text-gray-700 line-clamp-3 mb-4 text-sm">
                  {letter.content}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLetter(letter)}
                    className="flex-1"
                  >
                    {letter.status === 'COMPLETED' ? '피드백 보기' : '내용 보기'}
                  </Button>

                  {letter.status === 'COMPLETED' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => startInterview(letter.id, 'BASIC')}
                        disabled={isStartingInterview}
                        className="flex-1"
                      >
                        기본 면접
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => startInterview(letter.id, 'TECHNICAL')}
                        disabled={isStartingInterview}
                        className="flex-1"
                      >
                        기술 면접
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* 선택된 자소서 상세 */}
          <div className="lg:sticky lg:top-4 lg:h-fit">
            {selectedLetter ? (
              <Card>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedLetter.status === 'COMPLETED'
                      ? '피드백'
                      : '자소서 내용'}
                  </h2>
                  <button
                    onClick={() => setSelectedLetter(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                  {selectedLetter.status === 'COMPLETED' && selectedLetter.feedback ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700">
                        {selectedLetter.feedback}
                      </div>
                    </div>
                  ) : selectedLetter.status === 'PENDING' ? (
                    <div className="text-center py-8">
                      <LoadingSpinner />
                      <p className="mt-4 text-gray-600">피드백 생성 중...</p>
                      <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-gray-700 text-sm">
                      {selectedLetter.content}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-12 text-gray-500">
                  자소서를 선택하면 상세 내용을 볼 수 있습니다
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

