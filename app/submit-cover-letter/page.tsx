'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store';
import Button from '@/components/Button';
import Card from '@/components/Card';
import TextArea from '@/components/TextArea';

interface FormData {
  content: string;
}

export default function SubmitCoverLetterPage() {
  const router = useRouter();
  const userId = useUserStore((state) => state.userId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (!userId) {
      router.push('/');
    }
  }, [userId, router]);

  const onSubmit = async (data: FormData) => {
    if (!userId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/cover-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });

      if (!response.ok) {
        throw new Error('자소서 제출 실패');
      }

      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              자소서가 제출되었습니다!
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              AI가 자소서를 분석하여 피드백을 생성하고 있습니다.
            </p>
            <p className="text-sm text-gray-500">
              피드백 생성에는 약 1-2분이 소요됩니다.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/my-page')}
              className="w-full"
              size="lg"
            >
              마이페이지로 이동
            </Button>
            <Button
              onClick={() => router.push('/submit-cover-letter')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              다른 자소서 제출하기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          자기소개서 제출
        </h1>
        <p className="text-gray-600">
          자기소개서를 붙여넣으시면 AI가 전문적인 피드백을 제공합니다.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextArea
            label="자기소개서 내용"
            {...register('content', {
              required: '자소서 내용을 입력해주세요',
              minLength: {
                value: 100,
                message: '최소 100자 이상 입력해주세요',
              },
            })}
            rows={20}
            error={errors.content?.message}
            placeholder="자기소개서 내용을 입력하거나 붙여넣으세요..."
            helperText="최소 100자 이상 작성해주세요"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              이전
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              제출하기
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 p-5 bg-amber-50 rounded-lg border border-amber-100">
        <h3 className="font-semibold text-amber-900 mb-2">💡 작성 팁</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• 구체적인 경험과 성과를 포함하여 작성하세요</li>
          <li>• 지원 직무와 관련된 기술 스택이나 프로젝트 경험을 상세히 기술하세요</li>
          <li>• STAR 기법(Situation, Task, Action, Result)을 활용하세요</li>
          <li>• 본인만의 고유한 경험과 역량을 강조하세요</li>
        </ul>
      </div>
    </div>
  );
}

