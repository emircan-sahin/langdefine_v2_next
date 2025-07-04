import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUserFromRequest } from '@/lib/auth'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { text, sourceLanguage, targetLanguage, context } = await request.json()

    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text, source language, and target language are required' },
        { status: 400 }
      )
    }

    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}.

${context ? `Context: ${context}\n\n` : ''}Text to translate: "${text}"

Please provide only the translated text without any additional formatting or explanations.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. Provide accurate and natural translations that maintain the original meaning and tone.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    })

    const translatedText = completion.choices[0]?.message?.content?.trim()

    if (!translatedText) {
      return NextResponse.json(
        { error: 'Translation failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      translatedText,
      sourceLanguage,
      targetLanguage,
    })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
} 