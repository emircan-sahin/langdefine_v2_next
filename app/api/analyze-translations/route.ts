import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ExtractedKey {
  key: string
  value: string
  description?: string
  lineNumber: number
  confidence: number
}

interface AnalysisRequest {
  fileContent: string
  fileName: string
  projectLanguages: string[]
  mainLanguage: string
}

// Tool definition for AI analysis
const translationAnalysisTool = {
  type: 'function' as const,
  function: {
    name: 'extract_translation_keys',
    description: 'Extract translation keys and their English text values from React file content',
    parameters: {
      type: 'object',
      properties: {
        keys: {
          type: 'array',
          description: 'Array of extracted translation keys',
          items: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                description: 'Meaningful translation key name based on the content'
              },
              value: {
                type: 'string',
                description: 'English text content that should be translated'
              },
              description: {
                type: 'string',
                description: 'Brief description of where this was found in the file'
              },
              lineNumber: {
                type: 'number',
                description: 'Line number where this translation key was found'
              },
              confidence: {
                type: 'number',
                description: 'Confidence score (0-1) for how certain this should be translated'
              }
            },
            required: ['key', 'value', 'lineNumber', 'confidence']
          }
        }
      },
      required: ['keys']
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileContent, fileName, projectLanguages, mainLanguage }: AnalysisRequest = await request.json()

    if (!fileContent) {
      return NextResponse.json(
        { error: 'File content is required' },
        { status: 400 }
      )
    }

    const extractedKeys = await analyzeWithFunctions(fileContent, fileName, projectLanguages, mainLanguage)
    
    return NextResponse.json({
      keys: extractedKeys,
      message: `Successfully analyzed ${fileName} and found ${extractedKeys.length} translation keys`
    })

  } catch (error) {
    console.error('Translation analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze file' },
      { status: 500 }
    )
  }
}

async function analyzeWithFunctions(fileContent: string, fileName: string, projectLanguages: string[], mainLanguage: string): Promise<ExtractedKey[]> {
  try {
    // Use OpenAI library with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert web developer and internationalization specialist. 
          Analyze web files (React, HTML, JavaScript, TypeScript) and extract translation keys with their English text values.
          
          Project Languages: ${projectLanguages.join(', ')}
          Main Language: ${mainLanguage}
          
          Look for:
          1. Hardcoded English text in HTML elements (h1, h2, p, span, div, label, button, a, etc.)
          2. HTML attributes with English text (placeholder, title, alt, aria-label, etc.)
          3. Existing translation function calls (t(), useTranslation(), translate(), etc.)
          4. Object properties with English text values
          5. Array items with English text
          6. Form labels, buttons, error messages, status messages
          7. JSX text content that should be translated
          
          Generate meaningful key names based on the content and context.`
        },
                  {
            role: 'user',
            content: `Analyze this web file and extract all translation keys:
            
            File: ${fileName}
            
            ${fileContent}`
          }
      ],
      tools: [translationAnalysisTool],
      tool_choice: { type: 'function', function: { name: 'extract_translation_keys' } },
      temperature: 0.1,
      max_tokens: 2000
    })

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    
    if (toolCall && toolCall.function.name === 'extract_translation_keys') {
      const args = JSON.parse(toolCall.function.arguments)
      return args.keys || []
    }

  } catch (aiError) {
    console.error('AI analysis failed:', aiError)
  }

  // Fallback to regex-based analysis
  return fallbackAnalysis(fileContent, fileName)
}

function fallbackAnalysis(fileContent: string, fileName: string): ExtractedKey[] {
  const lines = fileContent.split('\n')
  const keys: ExtractedKey[] = []
  
  // Enhanced regex patterns for better detection (including HTML)
  const patterns = [
    // Translation function calls
    { regex: /t\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\s*\)/g, confidence: 0.95, type: 'translation_function' },
    { regex: /t\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g, confidence: 0.9, type: 'translation_function' },
    { regex: /useTranslation\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g, confidence: 0.9, type: 'translation_function' },
    { regex: /translate\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g, confidence: 0.9, type: 'translation_function' },
    { regex: /\$t\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g, confidence: 0.9, type: 'translation_function' },
    { regex: /i18n\.t\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g, confidence: 0.9, type: 'translation_function' },
    
    // HTML text content
    { regex: />\s*([A-Z][a-z\s]+[a-z])\s*</g, confidence: 0.8, type: 'html_text' },
    { regex: /<[^>]*>\s*([A-Z][a-z\s]+[a-z])\s*</g, confidence: 0.8, type: 'html_text' },
    { regex: /<h[1-6][^>]*>\s*([^<]+)\s*<\/h[1-6]>/g, confidence: 0.9, type: 'html_heading' },
    { regex: /<p[^>]*>\s*([^<]+)\s*<\/p>/g, confidence: 0.8, type: 'html_paragraph' },
    { regex: /<span[^>]*>\s*([^<]+)\s*<\/span>/g, confidence: 0.7, type: 'html_span' },
    { regex: /<div[^>]*>\s*([^<]+)\s*<\/div>/g, confidence: 0.7, type: 'html_div' },
    { regex: /<label[^>]*>\s*([^<]+)\s*<\/label>/g, confidence: 0.9, type: 'html_label' },
    { regex: /<button[^>]*>\s*([^<]+)\s*<\/button>/g, confidence: 0.9, type: 'html_button' },
    { regex: /<a[^>]*>\s*([^<]+)\s*<\/a>/g, confidence: 0.8, type: 'html_link' },
    
    // HTML attributes
    { regex: /placeholder\s*=\s*['"`]([^'"`]+)['"`]/g, confidence: 0.8, type: 'html_placeholder' },
    { regex: /title\s*=\s*['"`]([^'"`]+)['"`]/g, confidence: 0.8, type: 'html_title' },
    { regex: /alt\s*=\s*['"`]([^'"`]+)['"`]/g, confidence: 0.8, type: 'html_alt' },
    { regex: /aria-label\s*=\s*['"`]([^'"`]+)['"`]/g, confidence: 0.8, type: 'html_aria_label' },
    
    // JSX text content (more specific patterns)
    { regex: />\s*([A-Z][a-z\s]+[a-z])\s*</g, confidence: 0.7, type: 'jsx_text' },
    { regex: /<[^>]*>\s*([A-Z][a-z\s]+[a-z])\s*</g, confidence: 0.7, type: 'jsx_text' },
    
    // Object properties with English text
    { regex: /['"`]([^'"`]+)['"`]\s*:\s*['"`]([^'"`]+)['"`]/g, confidence: 0.8, type: 'object_property' },
    
    // Array items with English text
    { regex: /['"`]([^'"`]+)['"`]\s*,/g, confidence: 0.6, type: 'array_item' },
    
    // Form labels and placeholders
    { regex: /label\s*=\s*['"`]([^'"`]+)['"`]/g, confidence: 0.8, type: 'form_label' },
    { regex: /placeholder\s*=\s*['"`]([^'"`]+)['"`]/g, confidence: 0.8, type: 'placeholder' },
    
    // Button text
    { regex: /<button[^>]*>\s*([^<]+)\s*<\/button>/g, confidence: 0.8, type: 'button_text' },
    
    // Error messages
    { regex: /error\s*=\s*['"`]([^'"`]+)['"`]/g, confidence: 0.8, type: 'error_message' },
  ]

  lines.forEach((line, lineNumber) => {
    patterns.forEach((pattern) => {
      let match
      while ((match = pattern.regex.exec(line)) !== null) {
        const key = match[1]
        const value = match[2] || key
        
        if (key && key.length > 0 && !isCodeOrComment(line) && isValidTranslationText(value)) {
          // Avoid duplicates
          const existingKey = keys.find(k => k.key === key || k.value === value)
          if (!existingKey) {
            keys.push({
              key: generateKeyName(key, value, pattern.type),
              value: value,
              description: `${pattern.type} found in ${fileName} at line ${lineNumber + 1}`,
              lineNumber: lineNumber + 1,
              confidence: pattern.confidence
            })
          }
        }
      }
    })
  })

  return keys
}

function isCodeOrComment(line: string): boolean {
  const trimmedLine = line.trim()
  return trimmedLine.startsWith('//') || 
         trimmedLine.startsWith('/*') || 
         trimmedLine.startsWith('*') ||
         trimmedLine.startsWith('import') ||
         trimmedLine.startsWith('export') ||
         trimmedLine.startsWith('const') ||
         trimmedLine.startsWith('let') ||
         trimmedLine.startsWith('var') ||
         trimmedLine.startsWith('function') ||
         trimmedLine.startsWith('return') ||
         trimmedLine.includes('console.log') ||
         trimmedLine.includes('//') ||
         trimmedLine.includes('className=') ||
         trimmedLine.includes('style=') ||
         trimmedLine.includes('onClick=') ||
         trimmedLine.includes('onChange=')
}

function isValidTranslationText(text: string): boolean {
  // Check if text looks like it should be translated
  const trimmedText = text.trim()
  
  // Must have at least 2 characters
  if (trimmedText.length < 2) return false
  
  // Must contain letters
  if (!/[a-zA-Z]/.test(trimmedText)) return false
  
  // Common code patterns to exclude
  const codePatterns = [
    /^[A-Z_]+$/, // ALL_CAPS constants
    /^[a-z_]+$/, // snake_case variables
    /^[a-z]+[A-Z][a-z]+$/, // camelCase variables
    /^[0-9]+$/, // numbers only
    /^[^a-zA-Z]*$/, // no letters
    /^[<>\/\s]+$/, // HTML tags
    /^[{}[\]]+$/, // brackets only
    /^[;:,()]+$/, // punctuation only
  ]
  
  return !codePatterns.some(pattern => pattern.test(trimmedText))
}

function generateKeyName(key: string, value: string, type: string): string {
  // Use the value if it's more descriptive than the key
  const source = key !== value ? value : key
  
  let keyName = source
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 50)
  
  // Add type prefix for better organization
  const typePrefix = {
    'translation_function': 't_',
    'jsx_text': 'text_',
    'html_text': 'html_',
    'html_heading': 'heading_',
    'html_paragraph': 'paragraph_',
    'html_span': 'span_',
    'html_div': 'div_',
    'html_label': 'label_',
    'html_button': 'button_',
    'html_link': 'link_',
    'html_placeholder': 'placeholder_',
    'html_title': 'title_',
    'html_alt': 'alt_',
    'html_aria_label': 'aria_',
    'object_property': 'prop_',
    'array_item': 'item_',
    'form_label': 'label_',
    'placeholder': 'placeholder_',
    'button_text': 'button_',
    'error_message': 'error_'
  }[type] || ''
  
  return typePrefix + keyName
} 