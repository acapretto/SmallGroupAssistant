import { useState, useRef, useEffect } from 'react'
import './TutorChat.css'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
}

interface TutorChatProps {
  groupId: string
  topic: string
  onSendMessage?: (text: string) => Promise<string>
}

export default function TutorChat({ groupId, topic, onSendMessage }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: `Hello! I'm your AI tutor for ${topic}. What would you like to learn or ask about today?`,
      timestamp: Date.now(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      // Call AI (placeholder or real API)
      let aiResponse = ''
      if (onSendMessage) {
        aiResponse = await onSendMessage(inputValue)
      } else {
        // Placeholder response
        aiResponse = `Great question about ${inputValue}! Let me think about that...

For ${topic}, it's important to understand the foundational concepts first. Let's break this down:

1. **Core Concept**: Start by understanding what we're trying to solve
2. **Key Strategy**: Apply the relevant approach or technique
3. **Practice**: Work through examples to solidify understanding

What specific part would you like me to explain further?`
      }

      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'ai',
        content: aiResponse,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get response'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="tutor-chat">
      <div className="chat-header">
        <h3>{topic}</h3>
        <span className="group-badge">Group: {groupId}</span>
      </div>

      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <p>{msg.content}</p>
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              {msg.role === 'ai' && (
                <button
                  className="copy-btn"
                  onClick={() => handleCopy(msg.content)}
                  title="Copy response"
                >
                  📋
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message message-ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <p className="loading">
                <span></span>
                <span></span>
                <span></span>
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      <form className="chat-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          disabled={isLoading}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="send-btn"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  )
}
