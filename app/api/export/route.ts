import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import TranslationKey from '@/lib/models/TranslationKey'
import Project from '@/lib/models/Project'
import { getUserFromRequest } from '@/lib/auth'
import JSZip from 'jszip'

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
    const language = searchParams.get('language')
    const multiFile = searchParams.get('multiFile') === 'true'

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
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

    // Get all translation keys for the project
    const keys = await TranslationKey.find({ projectId })
      .sort({ createdAt: -1 })
      .lean()

    // Debug: Log the first key to see the data structure
    if (keys.length > 0) {
      console.log('Sample key data:', JSON.stringify(keys[0], null, 2))
    }

    // Filter by language if specified
    const targetLanguages = language ? [language] : project.languages

    if (multiFile) {
      // Multi-file export - create a ZIP file with separate files for each language
      const zip = new JSZip()
      
      targetLanguages.forEach((lang: string) => {
        const langTranslations = generateLanguageExport(keys, [lang])
        const jsonContent = JSON.stringify(langTranslations, null, 2)
        zip.file(`${lang}.json`, jsonContent)
      })
      
      const zipBuffer = await zip.generateAsync({ type: 'uint8array' })
      const filename = `translations-${project.name}-${new Date().toISOString().split('T')[0]}.zip`
      const contentType = 'application/zip'

      const response = new NextResponse(zipBuffer)
      response.headers.set('Content-Type', contentType)
      response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
      
      return response
    } else {
      // Single file export
      const exportData = generateJSONExport(keys, targetLanguages)
      const filename = `translations-${project.name}-${new Date().toISOString().split('T')[0]}.json`
      const contentType = 'application/json'

      const response = new NextResponse(exportData)
      response.headers.set('Content-Type', contentType)
      response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
      
      return response
    }
  } catch (error) {
    console.error('Error exporting translations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateJSONExport(keys: any[], languages: string[]) {
  const translations: any = {}
  
  languages.forEach(lang => {
    translations[lang] = {}
    
    keys.forEach(key => {
      const value = key.values.find((v: any) => v.language === lang)
      if (value) {
        // Handle nested keys (e.g., "common.buttons.save" -> { common: { buttons: { save: value } } })
        const keyParts = key.key.split('.')
        let current = translations[lang]
        
        for (let i = 0; i < keyParts.length - 1; i++) {
          if (!current[keyParts[i]]) {
            current[keyParts[i]] = {}
          }
          current = current[keyParts[i]]
        }
        
        // Ensure the value is properly handled based on its type
        let finalValue = value.value
        
        // Handle different value types and clean up JSON strings
        if (value.valueType === 'text') {
          if (typeof finalValue === 'string') {
            // Remove JSON string quotes if they exist
            finalValue = finalValue.replace(/^"|"$/g, '')
            // Also handle escaped quotes
            finalValue = finalValue.replace(/\\"/g, '"')
          }
        } else if (value.valueType === 'object') {
          // For objects, parse if it's a JSON string
          if (typeof finalValue === 'string') {
            try {
              finalValue = JSON.parse(finalValue)
            } catch (e) {
              // If parsing fails, keep as is
              console.warn('Failed to parse object value:', finalValue)
            }
          }
        } else if (value.valueType === 'array') {
          // For arrays, parse if it's a JSON string
          if (typeof finalValue === 'string') {
            try {
              finalValue = JSON.parse(finalValue)
            } catch (e) {
              // If parsing fails, keep as is
              console.warn('Failed to parse array value:', finalValue)
            }
          }
        }
        
        current[keyParts[keyParts.length - 1]] = finalValue
      }
    })
  })
  
  return JSON.stringify(translations, null, 2)
}

function generateLanguageExport(keys: any[], languages: string[]) {
  const translations: any = {}
  
  languages.forEach(lang => {
    keys.forEach(key => {
      const value = key.values.find((v: any) => v.language === lang)
      if (value) {
        // Handle nested keys (e.g., "common.buttons.save" -> { common: { buttons: { save: value } } })
        const keyParts = key.key.split('.')
        let current = translations
        
        for (let i = 0; i < keyParts.length - 1; i++) {
          if (!current[keyParts[i]]) {
            current[keyParts[i]] = {}
          }
          current = current[keyParts[i]]
        }
        
        // Ensure the value is properly handled based on its type
        let finalValue = value.value
        
        // Handle different value types and clean up JSON strings
        if (value.valueType === 'text') {
          if (typeof finalValue === 'string') {
            // Remove JSON string quotes if they exist
            finalValue = finalValue.replace(/^"|"$/g, '')
            // Also handle escaped quotes
            finalValue = finalValue.replace(/\\"/g, '"')
          }
        } else if (value.valueType === 'object') {
          // For objects, parse if it's a JSON string
          if (typeof finalValue === 'string') {
            try {
              finalValue = JSON.parse(finalValue)
            } catch (e) {
              // If parsing fails, keep as is
              console.warn('Failed to parse object value:', finalValue)
            }
          }
        } else if (value.valueType === 'array') {
          // For arrays, parse if it's a JSON string
          if (typeof finalValue === 'string') {
            try {
              finalValue = JSON.parse(finalValue)
            } catch (e) {
              // If parsing fails, keep as is
              console.warn('Failed to parse array value:', finalValue)
            }
          }
        }
        
        current[keyParts[keyParts.length - 1]] = finalValue
      }
    })
  })
  
  return translations
} 