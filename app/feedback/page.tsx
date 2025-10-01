'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/Button'
import TextArea from '@/components/TextArea'
import Card from '@/components/Card'
import LoadingSpinner from '@/components/LoadingSpinner'

interface FeedbackResponse {
  feedback: string
}

export default function FeedbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [coverLetter, setCoverLetter] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // URL 파라미터에서 자소서 내용 가져오기 (모의면접에서 돌아온 경우)
  React.useEffect(() => {
    const coverLetterParam = searchParams.get('coverLetter')
    if (coverLetterParam) {
      setCoverLetter(decodeURIComponent(coverLetterParam))
    }
  }, [searchParams])

  const handleSubmit = async () => {
    if (!coverLetter.trim()) {
      setError('자기소개서 내용을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')
    setFeedback('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coverLetter }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '피드백 요청에 실패했습니다.')
      }

      setFeedback(data.feedback)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartInterview = () => {
    if (!coverLetter.trim()) {
      setError('자기소개서 내용을 입력해주세요.')
      return
    }
    
    // 자소서 내용을 URL 파라미터로 전달하여 면접 페이지로 이동
    const encodedCoverLetter = encodeURIComponent(coverLetter)
    router.push(`/interview?coverLetter=${encodedCoverLetter}`)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI 자소서 피드백
        </h1>
        <p className="text-gray-600">
          작성한 자기소개서를 AI가 분석하여 구체적인 피드백을 제공합니다
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 입력 섹션 */}
        <div className="space-y-6">
          <Card title="자기소개서 입력">
            <TextArea
              value={coverLetter}
              onChange={setCoverLetter}
              placeholder="자기소개서 내용을 입력해주세요..."
              rows={12}
              label="자기소개서 내용"
            />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !coverLetter.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    분석 중...
                  </div>
                ) : (
                  '피드백 요청'
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-6">
          <Card title="AI 피드백 결과">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">AI가 자소서를 분석하고 있습니다...</p>
              </div>
            ) : feedback ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {feedback}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleStartInterview}
                    variant="outline"
                    className="w-full"
                  >
                    이 내용으로 모의 면접 보기
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500">
                  왼쪽에 자기소개서를 입력하고<br />
                  피드백을 요청해보세요
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="font-semibold text-gray-900 mb-2">정확한 분석</h3>
          <p className="text-sm text-gray-600">
            AI가 자소서의 강점과 개선점을 정확히 분석합니다
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-3xl mb-3">💡</div>
          <h3 className="font-semibold text-gray-900 mb-2">구체적 제안</h3>
          <p className="text-sm text-gray-600">
            실제로 적용할 수 있는 구체적인 수정 방안을 제시합니다
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-3xl mb-3">📈</div>
          <h3 className="font-semibold text-gray-900 mb-2">점수 제공</h3>
          <p className="text-sm text-gray-600">
            객관적인 점수로 현재 수준을 파악할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}
