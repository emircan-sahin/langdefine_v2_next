'use client'

import { useState } from 'react'
import { useAuthStore } from '../../store/auth'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Download, FileText, FolderOpen } from 'lucide-react'

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Export Translations
          </DialogTitle>
          <DialogDescription>
            Export your translation keys in JSON format
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Export Type</Label>
            <RadioGroup value={exportType} onValueChange={setExportType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="flex items-center space-x-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Single File</div>
                    <div className="text-xs text-muted-foreground">
                      All languages in one JSON file
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multi" id="multi" />
                <Label htmlFor="multi" className="flex items-center space-x-2 cursor-pointer">
                  <FolderOpen className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Multi-File</div>
                    <div className="text-xs text-muted-foreground">
                      Separate file for each language
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>Export format: <strong>JSON</strong></p>
            <p className="text-xs">
              {exportType === 'single' 
                ? 'Compatible with React, Next.js, and other JavaScript frameworks'
                : 'Each language will be in its own file (en.json, tr.json, etc.)'
              }
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 