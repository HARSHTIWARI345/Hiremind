'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar3D from './Avatar3D'

interface InterviewAvatarProps {
  interviewData: {
    interviewId: string
    questions: Array<{ type: string; question: string }>
    answers: any[]
  }
  jobId: string
}

export default function InterviewAvatar({ interviewData, jobId }: InterviewAvatarProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [answers, setAnswers] = useState<any[]>(interviewData.answers || [])
  const [evaluation, setEvaluation] = useState<any>(null)
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis

    // Start with first question
    askQuestion(0)

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  function askQuestion(index: number) {
    if (index >= interviewData.questions.length) {
      setInterviewComplete(true)
      loadFeedback()
      return
    }

    const question = interviewData.questions[index]
    setIsSpeaking(true)
    setTranscript('')
    setEvaluation(null)

    // Speak the question
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(question.question)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      synthRef.current.speak(utterance)
    }
  }

  function startListening() {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  function stopListening() {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  async function submitAnswer() {
    if (!transcript.trim()) return

    const answer = transcript
    setTranscript('')

    try {
      const response = await fetch('/api/interview/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: interviewData.interviewId,
          questionIndex: currentQuestionIndex,
          answer,
        }),
      })

      const data = await response.json()
      setEvaluation(data.evaluation)

      // Update answers
      const newAnswers = [...answers]
      newAnswers[currentQuestionIndex] = {
        question: interviewData.questions[currentQuestionIndex].question,
        answer,
        evaluation: data.evaluation,
      }
      setAnswers(newAnswers)

      // Move to next question after 3 seconds
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1
        setCurrentQuestionIndex(nextIndex)
        setEvaluation(null)
        askQuestion(nextIndex)
      }, 3000)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  async function loadFeedback() {
    try {
      const response = await fetch(`/api/interview/feedback?interviewId=${interviewData.interviewId}`)
      const data = await response.json()
      setFeedback(data)
    } catch (error) {
      console.error('Error loading feedback:', error)
    }
  }

  const currentQuestion = interviewData.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / interviewData.questions.length) * 100

  if (interviewComplete && feedback) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-6 text-center">Interview Complete!</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Overall Score</h3>
              <div className="flex items-center gap-4">
                <Progress value={feedback.score * 10} className="flex-1" />
                <span className="text-2xl font-bold">{feedback.score * 10}%</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Hireability Assessment</h3>
              <p className="text-lg">{feedback.hireability || 'Based on your performance, you show strong potential.'}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Strengths</h3>
              <ul className="list-disc list-inside space-y-1">
                {(feedback.strengths || []).map((strength: string, i: number) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Areas for Improvement</h3>
              <ul className="list-disc list-inside space-y-1">
                {(feedback.weakAreas || []).map((area: string, i: number) => (
                  <li key={i}>{area}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Personalized Roadmap</h3>
              <p className="whitespace-pre-line">{feedback.roadmap || 'Continue practicing and building your skills.'}</p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {interviewData.questions.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Avatar Section */}
          <Card className="h-[500px] flex items-center justify-center">
            <CardContent className="w-full h-full">
              <Avatar3D isSpeaking={isSpeaking} />
            </CardContent>
          </Card>

          {/* Question & Answer Section */}
          <Card>
            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {currentQuestion?.type?.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-6">{currentQuestion?.question}</h2>

                  {/* Answer Input */}
                  <div className="mb-4">
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Your answer will appear here..."
                      className="w-full min-h-[150px] p-4 border rounded-lg resize-none"
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex gap-4 mb-4">
                    <Button
                      onClick={isListening ? stopListening : startListening}
                      variant={isListening ? 'destructive' : 'default'}
                      disabled={isSpeaking}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={submitAnswer}
                      disabled={!transcript.trim() || isListening}
                    >
                      Submit Answer
                    </Button>
                  </div>

                  {/* Evaluation */}
                  {evaluation && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Score: {evaluation.score}/10</span>
                        <span className="text-sm text-muted-foreground">
                          Confidence: {evaluation.confidence || 'High'}
                        </span>
                      </div>
                      {evaluation.strengths && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-green-700">Strengths:</p>
                          <p className="text-sm">{evaluation.strengths}</p>
                        </div>
                      )}
                      {evaluation.weaknesses && (
                        <div>
                          <p className="text-sm font-medium text-orange-700">Areas to improve:</p>
                          <p className="text-sm">{evaluation.weaknesses}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
