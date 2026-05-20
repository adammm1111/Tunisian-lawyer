import { groq, SYSTEM_PROMPT, MODEL } from '@/lib/groq'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    // Search relevant law articles from Supabase
    const { data: articles } = await supabase
      .from('law_articles')
      .select('number, topic, text_ar, text_fr, chapter')
      .textSearch('text_ar', message, { type: 'websearch' })
      .limit(5)

    // Build context from found articles
    let context = ''
    if (articles && articles.length > 0) {
      context = `\nمقالات قانونية ذات صلة:\n${articles
        .map(a => `${a.number} - ${a.topic}:\n${a.text_ar}`)
        .join('\n\n')}`
    }

    // Build messages
    const messages = [
      ...history,
      {
        role: 'user',
        content: message + context
      }
    ]

    // Call Groq
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 1024,
      temperature: 0.3
    })

    const answer = response.choices[0].message.content

    return NextResponse.json({ answer })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'حدث خطأ، يرجى المحاولة مجدداً' },
      { status: 500 }
    )
  }
}