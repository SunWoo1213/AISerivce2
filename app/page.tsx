'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'

export default function HomePage() {
  const router = useRouter()

  const handleFeedbackClick = () => {
    router.push('/feedback')
  }

  const handleInterviewClick = () => {
    router.push('/interview')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI 자소서 서비스
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI가 제공하는 전문적인 자기소개서 피드백과 모의 면접으로<br />
            당신의 취업 준비를 한 단계 업그레이드하세요
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Feedback Button */}
          <div className="group">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                AI 자소서 피드백
              </h2>
              <p className="text-gray-600 mb-6">
                작성한 자기소개서를 AI가 분석하여<br />
                구체적이고 실용적인 피드백을 제공합니다
              </p>
              <Button
                onClick={handleFeedbackClick}
                size="lg"
                className="w-full"
              >
                피드백 받기
              </Button>
            </div>
          </div>

          {/* Interview Button */}
          <div className="group">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="text-6xl mb-4">🎤</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                AI 모의 면접
              </h2>
              <p className="text-gray-600 mb-6">
                자소서 기반 맞춤형 질문으로<br />
                실전 면접 경험을 쌓아보세요
              </p>
              <Button
                onClick={handleInterviewClick}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                면접 시작하기
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI 기반 분석
            </h3>
            <p className="text-gray-600 text-sm">
              최신 AI 기술로 정확하고 상세한 분석
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              즉시 피드백
            </h3>
            <p className="text-gray-600 text-sm">
              빠른 처리로 시간을 절약하고 효율성 극대화
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              맞춤형 서비스
            </h3>
            <p className="text-gray-600 text-sm">
              개인별 특성에 맞는 개인화된 서비스
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
