'use client'

import { useState } from 'react'
import { useAuthStore } from '../../store/auth'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
  languages: string[]
}

export default function ExportModal({ isOpen, onClose, projectId, projectName, languages }: ExportModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [exportType, setExportType] = useState('single') // 'single' or 'multi'
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState('')
  
  const { token } = useAuthStore()

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    setError('')

    try {
      const params = new URLSearchParams({
        projectId,
        multiFile: exportType === 'multi' ? 'true' : 'false',
        ...(selectedLanguage !== 'all' && { language: selectedLanguage })
      })

      const response = await fetch(`/api/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 
        `translations-${projectName}-${new Date().toISOString().split('T')[0]}.${exportType === 'multi' ? 'zip' : 'json'}`

      // Get the content based on the response type
      const contentType = response.headers.get('content-type')
      let blob
      
      if (contentType === 'application/zip') {
        // For ZIP files, use arrayBuffer to handle binary data
        const arrayBuffer = await response.arrayBuffer()
        blob = new Blob([arrayBuffer], { type: 'application/zip' })
      } else {
        // For JSON files, use text
        const textContent = await response.text()
        blob = new Blob([textContent], { 
          type: response.headers.get('content-type') || 'text/plain' 
        })
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onClose()
    } catch (err) {
      setError('Failed to export translations')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Export Translations
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Type
            </label>
            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportType"
                  value="single"
                  checked={exportType === 'single'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Single File
                  </div>
                  <div className="text-xs text-gray-500">
                    All languages in one JSON file
                  </div>
                </div>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportType"
                  value="multi"
                  checked={exportType === 'multi'}
                  onChange={(e) => setExportType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Multi-File
                  </div>
                  <div className="text-xs text-gray-500">
                    Separate file for each language (en.json, tr.json, etc.)
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            <p>Export format: <strong>JSON</strong></p>
            <p className="text-xs mt-1">
              {exportType === 'single' 
                ? 'Compatible with React, Next.js, and other JavaScript frameworks'
                : 'Each language will be in its own file (en.json, tr.json, etc.)'
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 