import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import TranslationKey from '@/lib/models/TranslationKey'
import Project from '@/lib/models/Project'
import { getUserFromRequest } from '@/lib/auth'
import OpenAI from 'openai'
import mongoose from 'mongoose'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.warn('OpenAI API key is not configured. Translation will be disabled.')
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const keys = await TranslationKey.find({ projectId })
      .sort({ createdAt: -1 })
      .lean()

    // Migrate existing keys that don't have valueType
    const migratedKeys = keys.map(key => {
      if (!key.valueType) {
        // Determine valueType based on the first value
        const firstValue = key.values?.[0]?.value
        let valueType = 'text'
        
        if (firstValue) {
          if (Array.isArray(firstValue)) {
            valueType = 'array'
          } else if (typeof firstValue === 'object' && firstValue !== null) {
            valueType = 'object'
          }
        }
        
        return {
          ...key,
          valueType,
          values: key.values?.map((val: any) => ({
            ...val,
            valueType: valueType,
            // Ensure value is properly typed as Mixed
            value: val.value
          })) || []
        }
      }
      return key
    })

    return NextResponse.json({ keys: migratedKeys })
  } catch (error) {
    console.error('Error fetching translation keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { prop, description, value, valueType, categoryId, projectId } = await request.json()

    if (!prop || !value || !valueType || !categoryId || !projectId) {
      return NextResponse.json(
        { error: 'Prop, value, valueType, category ID, and project ID are required' },
        { status: 400 }
      )
    }

    // Debug: Log the incoming data
    console.log('Incoming data:', {
      prop,
      description,
      value,
      valueType,
      categoryId,
      projectId
    })

    // Get project to find available languages
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create values array starting with English
    const values = [{ language: 'en', value, valueType }]

    // Translate to other languages using AI
    const otherLanguages = project.languages.filter((lang: string) => lang !== 'en')
    
    if (otherLanguages.length > 0 && process.env.OPENAI_API_KEY) {
      try {
        const translations = await Promise.all(
          otherLanguages.map(async (language: string) => {
            let translatedValue = value

            if (valueType === 'text') {
              // Simple text translation
              const prompt = `Translate the following English text to ${language}. 
              ${description ? `Context: ${description}` : ''}
              Text: "${value}"
              
              Respond with only the translation, nothing else.`

              try {
                const completion = await openai.chat.completions.create({
                  model: 'gpt-4o-mini',
                  messages: [{ role: 'user', content: prompt }],
                  max_tokens: 150,
                  temperature: 0.3,
                })

                translatedValue = completion.choices[0]?.message?.content?.trim() || value
              } catch (error) {
                console.error(`Translation error for ${language}:`, error)
                translatedValue = value // Use original value if translation fails
              }
            } else if (valueType === 'object') {
              // Object translation - translate all string values
              const translatedObject = await translateObject(value, language, description)
              translatedValue = translatedObject
            } else if (valueType === 'array') {
              // Array translation - translate all string values
              const translatedArray = await translateArray(value, language, description)
              translatedValue = translatedArray
            }

            return {
              language,
              value: translatedValue,
              valueType,
            }
          })
        )

        values.push(...translations)
      } catch (translationError) {
        console.error('Translation error:', translationError)
        // If translation fails, just use the original value for other languages
        otherLanguages.forEach((language: string) => {
          values.push({ language, value, valueType })
        })
      }
    } else if (otherLanguages.length > 0) {
      // If OpenAI is not configured, just use the original value for other languages
      console.log('OpenAI not configured, using original values for other languages')
      otherLanguages.forEach((language: string) => {
        values.push({ language, value, valueType })
      })
    }

    // Create the document object
    const translationKeyData = {
      title: prop, // Keep title field for backward compatibility
      key: prop,
      description: description || '',
      valueType,
      categoryId: new mongoose.Types.ObjectId(categoryId),
      projectId: new mongoose.Types.ObjectId(projectId),
      values,
    }

    const translationKey = new TranslationKey(translationKeyData)

    // Validate before saving
    const validationError = translationKey.validateSync()
    if (validationError) {
      console.error('Validation error:', validationError)
      return NextResponse.json(
        { error: 'Validation failed', details: validationError.message },
        { status: 400 }
      )
    }

    await translationKey.save()

    return NextResponse.json({
      message: 'Translation key created successfully',
      key: translationKey,
    })
  } catch (error) {
    console.error('Error creating translation key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { keyId, prop, description, value, valueType, categoryId, projectId } = await request.json()

    if (!keyId || !prop || !value || !valueType || !categoryId || !projectId) {
      return NextResponse.json(
        { error: 'Key ID, prop, value, valueType, category ID, and project ID are required' },
        { status: 400 }
      )
    }

    // Get project to find available languages
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Find the existing translation key
    const existingKey = await TranslationKey.findById(keyId)
    if (!existingKey) {
      return NextResponse.json(
        { error: 'Translation key not found' },
        { status: 404 }
      )
    }

    // Create values array starting with English
    const values = [{ language: 'en', value, valueType }]

    // Translate to other languages using AI
    const otherLanguages = project.languages.filter((lang: string) => lang !== 'en')
    
    if (otherLanguages.length > 0 && process.env.OPENAI_API_KEY) {
      try {
        const translations = await Promise.all(
          otherLanguages.map(async (language: string) => {
            let translatedValue = value

            if (valueType === 'text') {
              // Simple text translation
              const prompt = `Translate the following English text to ${language}. 
              ${description ? `Context: ${description}` : ''}
              Text: "${value}"
              
              Respond with only the translation, nothing else.`

              try {
                const completion = await openai.chat.completions.create({
                  model: 'gpt-4o-mini',
                  messages: [{ role: 'user', content: prompt }],
                  max_tokens: 150,
                  temperature: 0.3,
                })

                translatedValue = completion.choices[0]?.message?.content?.trim() || value
              } catch (error) {
                console.error(`Translation error for ${language}:`, error)
                translatedValue = value // Use original value if translation fails
              }
            } else if (valueType === 'object') {
              // Object translation - translate all string values
              const translatedObject = await translateObject(value, language, description)
              translatedValue = translatedObject
            } else if (valueType === 'array') {
              // Array translation - translate all string values
              const translatedArray = await translateArray(value, language, description)
              translatedValue = translatedArray
            }

            return {
              language,
              value: translatedValue,
              valueType,
            }
          })
        )

        values.push(...translations)
      } catch (translationError) {
        console.error('Translation error:', translationError)
        // If translation fails, just use the original value for other languages
        otherLanguages.forEach((language: string) => {
          values.push({ language, value, valueType })
        })
      }
    } else if (otherLanguages.length > 0) {
      // If OpenAI is not configured, just use the original value for other languages
      console.log('OpenAI not configured, using original values for other languages')
      otherLanguages.forEach((language: string) => {
        values.push({ language, value, valueType })
      })
    }

    // Update the translation key
    const updatedKey = await TranslationKey.findByIdAndUpdate(
      keyId,
      {
        title: prop,
        key: prop,
        description: description || '',
        valueType,
        categoryId: new mongoose.Types.ObjectId(categoryId),
        projectId: new mongoose.Types.ObjectId(projectId),
        values,
        updatedAt: new Date()
      },
      { new: true }
    )

    return NextResponse.json({
      message: 'Translation key updated successfully',
      key: updatedKey,
    })
  } catch (error) {
    console.error('Error updating translation key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to translate object values
async function translateObject(obj: any, targetLanguage: string, context?: string): Promise<any> {
  const translatedObj = { ...obj }
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const prompt = `Translate the following English text to ${targetLanguage}. 
      ${context ? `Context: ${context}` : ''}
      Text: "${value}"
      
      Respond with only the translation, nothing else.`

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.3,
        })

        translatedObj[key] = completion.choices[0]?.message?.content?.trim() || value
      } catch (error) {
        console.error(`Translation error for key "${key}":`, error)
        // Keep original value if translation fails
        translatedObj[key] = value
      }
    }
  }
  
  return translatedObj
}

// Helper function to translate array values
async function translateArray(arr: any[], targetLanguage: string, context?: string): Promise<any[]> {
  const translatedArray = []
  
  for (const item of arr) {
    if (typeof item === 'string') {
      // Translate string items
      const prompt = `Translate the following English text to ${targetLanguage}. 
      ${context ? `Context: ${context}` : ''}
      Text: "${item}"
      
      Respond with only the translation, nothing else.`

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.3,
        })

        translatedArray.push(completion.choices[0]?.message?.content?.trim() || item)
      } catch (error) {
        console.error(`Translation error for array item:`, error)
        // Keep original value if translation fails
        translatedArray.push(item)
      }
    } else if (typeof item === 'object' && item !== null) {
      // Translate object items
      try {
        const translatedObject = await translateObject(item, targetLanguage, context)
        translatedArray.push(translatedObject)
      } catch (error) {
        console.error(`Translation error for object item:`, error)
        // Keep original object if translation fails
        translatedArray.push(item)
      }
    } else {
      // Keep non-string, non-object values as-is
      translatedArray.push(item)
    }
  }
  
  return translatedArray
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')

    if (!keyId) {
      return NextResponse.json(
        { error: 'Translation key ID is required' },
        { status: 400 }
      )
    }

    // Find the translation key
    const translationKey = await TranslationKey.findById(keyId)
    if (!translationKey) {
      return NextResponse.json(
        { error: 'Translation key not found' },
        { status: 404 }
      )
    }

    // Verify user owns the project (you might need to import Project model if needed)
    // For now, we'll assume the translation key belongs to the user's project
    // You can add additional verification if needed

    // Delete the translation key
    await TranslationKey.findByIdAndDelete(keyId)

    return NextResponse.json({
      message: 'Translation key deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting translation key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 