'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Select from '@/components/Select';

interface FormData {
  name: string;
  email?: string;
  jobCategory: string;
  age: number;
  experience: string;
  gender: string;
}

const jobCategories = [
  { value: '프론트엔드 개발', label: '프론트엔드 개발' },
  { value: '백엔드 개발', label: '백엔드 개발' },
  { value: '풀스택 개발', label: '풀스택 개발' },
  { value: '데이터 사이언스', label: '데이터 사이언스' },
  { value: 'AI/ML 엔지니어', label: 'AI/ML 엔지니어' },
  { value: 'DevOps', label: 'DevOps' },
  { value: '프로덕트 매니저', label: '프로덕트 매니저' },
  { value: 'UX/UI 디자이너', label: 'UX/UI 디자이너' },
  { value: '기타', label: '기타' },
];

const experienceLevels = [
  { value: '신입', label: '신입 (0년)' },
  { value: '1년차', label: '1년차' },
  { value: '2년차', label: '2년차' },
  { value: '3년차', label: '3년차' },
  { value: '4년차', label: '4년차' },
  { value: '5년 이상', label: '5년 이상' },
];

const genders = [
  { value: '남성', label: '남성' },
  { value: '여성', label: '여성' },
  { value: '선택 안함', label: '선택 안함' },
];

export default function HomePage() {
  const router = useRouter();
  const setUserId = useUserStore((state) => state.setUserId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting user data:', data);
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '사용자 생성 실패');
      }

      console.log('User created:', result.user);
      setUserId(result.user.id);
      router.push('/submit-cover-letter');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI 자소서 피드백 & 모의 면접
        </h1>
        <p className="text-lg text-gray-600">
          당신의 자기소개서에 전문적인 피드백을 받고,
          <br />
          실전같은 AI 모의 면접을 경험해보세요
        </p>
      </div>

      <Card>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          기본 정보 입력
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="이름"
            {...register('name', { required: '이름을 입력해주세요' })}
            error={errors.name?.message}
            placeholder="홍길동"
          />

          <Input
            label="이메일 (선택)"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="example@email.com"
          />

          <Select
            label="지원 직군"
            {...register('jobCategory', { required: '직군을 선택해주세요' })}
            options={jobCategories}
            error={errors.jobCategory?.message}
          />

          <Input
            label="나이"
            type="number"
            {...register('age', {
              required: '나이를 입력해주세요',
              min: { value: 18, message: '18세 이상이어야 합니다' },
              max: { value: 100, message: '유효한 나이를 입력해주세요' },
            })}
            error={errors.age?.message}
            placeholder="25"
          />

          <Select
            label="경력"
            {...register('experience', { required: '경력을 선택해주세요' })}
            options={experienceLevels}
            error={errors.experience?.message}
          />

          <Select
            label="성별"
            {...register('gender', { required: '성별을 선택해주세요' })}
            options={genders}
            error={errors.gender?.message}
          />

          <div className="pt-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full"
              size="lg"
            >
              다음 단계로
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">서비스 이용 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ 자기소개서를 제출하면 AI가 자동으로 피드백을 생성합니다</li>
          <li>✓ 피드백 완료 후 기본 면접과 기술 면접을 진행할 수 있습니다</li>
          <li>✓ 각 질문에는 제한 시간이 있으니 신중하게 답변해주세요</li>
          <li>✓ 면접 종료 후 종합 피드백을 확인할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}

