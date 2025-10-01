'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/Button'
import TextArea from '@/components/TextArea'
import Card from '@/components/Card'
import LoadingSpinner from '@/components/LoadingSpinner'
import ChatMessage from '@/components/ChatMessage'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface InterviewResponse {
  response: string
}

export default function InterviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [coverLetter, setCoverLetter] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // URL 파라미터에서 자소서 내용 가져오기
  useEffect(() => {
    const coverLetterParam = searchParams.get('coverLetter')
    if (coverLetterParam) {
      setCoverLetter(decodeURIComponent(coverLetterParam))
    }
  }, [searchParams])

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startInterview = async () => {
    if (!coverLetter.trim()) {
      setError('자기소개서 내용을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          coverLetter,
          isFirstQuestion: true 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '면접 시작에 실패했습니다.')
      }

      const firstMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      }

      setMessages([firstMessage])
      setIsInterviewStarted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const sendAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('답변을 입력해주세요.')
      return
    }

    // 사용자 답변을 메시지에 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentAnswer,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentAnswer('')
    setIsLoading(true)
    setError('')

    try {
      // 대화 이력을 API 형식으로 변환
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }))

      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          coverLetter,
          conversationHistory,
          isFirstQuestion: false
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '답변 처리에 실패했습니다.')
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetInterview = () => {
    setMessages([])
    setIsInterviewStarted(false)
    setCurrentAnswer('')
    setError('')
  }

  const goToFeedback = () => {
    const encodedCoverLetter = encodeURIComponent(coverLetter)
    router.push(`/feedback?coverLetter=${encodedCoverLetter}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI 모의 면접
        </h1>
        <p className="text-gray-600">
          자소서 기반 맞춤형 질문으로 실전 면접 경험을 쌓아보세요
        </p>
      </div>

      {!isInterviewStarted ? (
        /* 면접 시작 전 화면 */
        <div className="grid lg:grid-cols-2 gap-8">
          <Card title="자기소개서 입력">
            <TextArea
              value={coverLetter}
              onChange={setCoverLetter}
              placeholder="자기소개서 내용을 입력해주세요..."
              rows={10}
              label="자기소개서 내용"
            />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <Button
                onClick={startInterview}
                disabled={isLoading || !coverLetter.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    면접 준비 중...
                  </div>
                ) : (
                  '면접 시작'
                )}
              </Button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card title="면접 안내">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">맞춤형 질문</h4>
                    <p className="text-sm text-gray-600">
                      자소서 내용을 바탕으로 개인화된 질문을 제공합니다
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💬</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">실시간 피드백</h4>
                    <p className="text-sm text-gray-600">
                      답변에 대한 즉시 피드백과 다음 질문을 제공합니다
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📈</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">실전 연습</h4>
                    <p className="text-sm text-gray-600">
                      실제 면접과 유사한 환경에서 연습할 수 있습니다
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {coverLetter && (
              <Card title="추가 옵션">
                <Button
                  onClick={goToFeedback}
                  variant="outline"
                  className="w-full"
                >
                  이 자소서로 피드백 받기
                </Button>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* 면접 진행 중 화면 */
        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                면접 진행 중
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={resetInterview}
                  variant="outline"
                  size="sm"
                >
                  면접 종료
                </Button>
                <Button
                  onClick={goToFeedback}
                  variant="outline"
                  size="sm"
                >
                  피드백 보기
                </Button>
              </div>
            </div>

            {/* 채팅 메시지 영역 */}
            <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm text-gray-600">답변을 분석하고 있습니다...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* 답변 입력 영역 */}
            <div className="mt-4 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <TextArea
                value={currentAnswer}
                onChange={setCurrentAnswer}
                placeholder="답변을 입력해주세요..."
                rows={3}
              />
              
              <div className="flex justify-end">
                <Button
                  onClick={sendAnswer}
                  disabled={isLoading || !currentAnswer.trim()}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      전송 중...
                    </div>
                  ) : (
                    '답변 전송'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
