'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUESTIONS = [
  { icon: '👨‍👩‍👧', text: 'ما هي شروط الطلاق في تونس؟' },
  { icon: '💼', text: 'ما هي حقوقي في حال الطرد التعسفي؟' },
  { icon: '🏠', text: 'كيف يُنظَّم عقد الكراء في القانون التونسي؟' },
  { icon: '📜', text: 'كيف تُقسَّم تركة المتوفى في تونس؟' },
]

const TOPICS = [
  { icon: '👨‍👩‍👧', label: 'قانون الأسرة' },
  { icon: '💼', label: 'قانون العمل' },
  { icon: '🏠', label: 'العقارات' },
  { icon: '⚖️', label: 'القانون الجزائي' },
  { icon: '🏢', label: 'قانون الأعمال' },
  { icon: '🛒', label: 'حقوق المستهلك' },
  { icon: '📋', label: 'الإجراءات الإدارية' },
  { icon: '📜', label: 'الميراث' },
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text?: string) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const userMessage: Message = { role: 'user', content: msg }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages })
      })
      const data = await res.json()
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.answer || data.error
      }])
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ. يرجى المحاولة مجدداً.'
      }])
    }
    setLoading(false)
  }
  return (
    <div className="flex flex-col h-screen bg-stone-50" dir="rtl">
      <header className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-red-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-700 rounded-lg flex items-center justify-center text-lg">⚖️</div>
          <div>
            <div className="font-bold text-lg">المحامي الذكي</div>
            <div className="text-xs text-stone-400 tracking-widest uppercase">Avocat IA Tunisien</div>
          </div>
        </div>
        <div className="bg-red-700 text-white text-xs px-3 py-1 rounded-full">🇹🇳 القانون التونسي</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 bg-stone-100 border-l border-stone-200 flex-col overflow-y-auto hidden md:flex">
          <div className="p-3">
            <div className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-2">المواضيع</div>
            {TOPICS.map((t) => (
              <button key={t.label} onClick={() => sendMessage(`أريد معلومات عن ${t.label}`)}
                className="flex items-center gap-2 w-full text-right px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-red-700 hover:text-white transition-all mb-1">
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <div className="m-3 mt-auto bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-stone-600 leading-relaxed">
            <strong className="text-red-700 block mb-1">⚠️ تنبيه قانوني</strong>
            هذا المساعد يقدم معلومات عامة فقط ولا يعوض عن استشارة محامٍ معتمد.
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-stone-900 text-yellow-400 text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-5">
                🇹🇳 مخصص للقانون التونسي
              </div>
              <h1 className="text-4xl font-black text-stone-900 mb-3 leading-tight">
                مرحباً بك في<br />
                <span className="text-red-700">المحامي الذكي</span>
              </h1>
              <p className="text-stone-500 text-sm max-w-md leading-relaxed mb-8">
                اطرح سؤالك القانوني وسأساعدك في فهم حقوقك وفق التشريعات التونسية.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                {QUICK_QUESTIONS.map((q) => (
                  <button key={q.text} onClick={() => sendMessage(q.text)}
                    className="bg-stone-100 border border-stone-200 rounded-xl p-4 text-right text-sm text-stone-600 hover:border-red-700 hover:bg-red-50 hover:text-red-900 transition-all">
                    <div className="text-xl mb-2">{q.icon}</div>
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${m.role === 'assistant' ? 'bg-stone-900 text-yellow-400' : 'bg-red-700 text-white'}`}>
                    {m.role === 'assistant' ? 'م' : '👤'}
                  </div>
                  <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'assistant' ? 'bg-stone-100 border border-stone-200 text-stone-800 rounded-tr-sm' : 'bg-stone-900 text-white rounded-tl-sm'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-yellow-400 flex items-center justify-center text-sm font-bold">م</div>
                  <div className="bg-stone-100 border border-stone-200 rounded-2xl rounded-tr-sm px-4 py-3 flex gap-1">
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="p-4 border-t border-stone-200 bg-stone-50">
            <div className="flex gap-2 items-end bg-white border border-stone-200 rounded-xl px-4 py-2 focus-within:border-red-700 transition-colors">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }}}
                placeholder="اكتب سؤالك القانوني هنا… (بالعربية أو الفرنسية)"
                className="flex-1 bg-transparent outline-none text-sm text-stone-800 resize-none max-h-28 leading-relaxed"
                rows={1}
                dir="rtl"
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                className="w-9 h-9 bg-red-700 hover:bg-red-800 disabled:bg-stone-300 rounded-lg flex items-center justify-center text-white transition-colors flex-shrink-0">
                ➤
              </button>
            </div>
            <div className="text-center text-xs text-stone-400 mt-2">
              هذه المعلومات للتوعية القانونية فقط وليست استشارة قانونية رسمية
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}