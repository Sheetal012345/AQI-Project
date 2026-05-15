'use client'

import { useState } from 'react'
import { Bot, Send, User, Sparkles } from 'lucide-react'

interface Props {
  aqi: number
  city: string
}

export function AQIChatbot({ aqi, city }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [chat, setChat] = useState<
    {
      role: 'user' | 'bot'
      text: string
    }[]
  >([
    {
      role: 'bot',
      text: `Hi 👋 I'm your AI AQI Assistant. Ask me anything about pollution, health, masks, outdoor safety, or AQI in ${city}.`,
    },
  ])

  const askAI = async () => {
    if (!message.trim()) return

    const userMessage = message

    setChat((prev) => [
      ...prev,
      {
        role: 'user',
        text: userMessage,
      },
    ])

    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          aqi,
          city,
        }),
      })

      const data = await res.json()

      setChat((prev) => [
        ...prev,
        {
          role: 'bot',
          text: data.reply || 'No response from AI',
        },
      ])
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'AI service failed. Please try again.',
        },
      ])
    }

    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Bot className="text-white h-6 w-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            AI AQI Assistant
            
          </h2>

          <p className="text-sm text-gray-400">
            Smart pollution & health assistant
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-[400px] overflow-y-auto space-y-4 pr-2 mb-4">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-sm'
                  : 'bg-white/10 border border-white/10 text-gray-100 rounded-bl-sm'
              }`}
            >
              <div className="flex items-start gap-2">
                {msg.role === 'bot' ? (
                  <Bot className="h-4 w-4 mt-1 text-cyan-400" />
                ) : (
                  <User className="h-4 w-4 mt-1 text-white" />
                )}

                <div className="whitespace-pre-wrap">
                  {msg.text}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/10 text-white px-4 py-3 rounded-2xl rounded-bl-sm animate-pulse">
              AI is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              askAI()
            }
          }}
          placeholder="Ask anything about AQI, pollution, masks..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400"
        />

        <button
          onClick={askAI}
          disabled={loading}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all duration-200 text-white p-3 rounded-xl shadow-lg"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
