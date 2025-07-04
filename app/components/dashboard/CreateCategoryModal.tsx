'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Category {
  _id: string
  name: string
  description: string
  parentCategoryId: string | null
}

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (categoryData: {
    name: string
    description: string
    parentCategoryId?: string
  }) => void
  categories: Category[]
}

export default function CreateCategoryModal({ isOpen, onClose, onSubmit, categories }: CreateCategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [parentCategoryId, setParentCategoryId] = useState('none')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        name,
        description,
        parentCategoryId: parentCategoryId === 'none' ? undefined : parentCategoryId,
      })
      // Reset form
      setName('')
      setDescription('')
      setParentCategoryId('none')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setName('')
    setDescription('')
    setParentCategoryId('none')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your translation keys.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
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
              placeholder="Enter category description"
              rows={3}
            />
          </div>

          {categories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parentCategory">Parent Category (Optional)</Label>
              <Select value={parentCategoryId} onValueChange={setParentCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="No parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !name}
            >
              {isLoading ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 