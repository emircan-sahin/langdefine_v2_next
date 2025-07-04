'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (projectData: {
    name: string
    description: string
    mainLanguage: string
    languages: string[]
  }) => void
}

export default function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mainLanguage, setMainLanguage] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [newLanguage, setNewLanguage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        name,
        description,
        mainLanguage,
        languages: [mainLanguage, ...languages.filter(lang => lang !== mainLanguage)],
      })
      // Reset form
      setName('')
      setDescription('')
      setMainLanguage('')
      setLanguages([])
      setNewLanguage('')
    } finally {
      setIsLoading(false)
    }
  }

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage) && newLanguage !== mainLanguage) {
      setLanguages([...languages, newLanguage])
      setNewLanguage('')
    }
  }

  const removeLanguage = (language: string) => {
    setLanguages(languages.filter(lang => lang !== language))
  }

  const handleClose = () => {
    // Reset form when closing
    setName('')
    setDescription('')
    setMainLanguage('')
    setLanguages([])
    setNewLanguage('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new translation project. Add a name, description, and the languages you want to support.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mainLanguage">Main Language</Label>
            <Input
              id="mainLanguage"
              value={mainLanguage}
              onChange={(e) => setMainLanguage(e.target.value)}
              placeholder="e.g., en, es, fr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Languages</Label>
            <div className="flex space-x-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="e.g., es, fr"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addLanguage()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addLanguage}
                disabled={!newLanguage}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {languages.map((language) => (
                  <Badge key={language} variant="secondary" className="flex items-center gap-1">
                    {language}
                    <button
                      type="button"
                      onClick={() => removeLanguage(language)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !name || !mainLanguage}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 