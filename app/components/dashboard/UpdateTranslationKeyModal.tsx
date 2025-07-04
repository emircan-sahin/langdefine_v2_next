'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Key, Plus, Trash2, Edit } from 'lucide-react'

interface Category {
  _id: string
  name: string
  description: string
  parentCategoryId: string | null
}

interface Project {
  _id: string
  name: string
  description: string
  mainLanguage: string
  languages: string[]
}

type ValueType = 'text' | 'object' | 'array'

interface KeyValuePair {
  key: string
  value: string
}

interface ArrayItem {
  type: 'string' | 'object'
  value: string | KeyValuePair[]
}

interface TranslationKey {
  _id: string
  title: string
  key: string
  description: string
  valueType: ValueType
  values: Array<{
    language: string
    value: string | object | any[]
    valueType: ValueType
  }>
  categoryId: string
}

interface UpdateTranslationKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (keyData: {
    keyId: string
    prop: string
    description?: string
    value: string | object | any[]
    valueType: ValueType
    categoryId: string
  }) => void
  categories: Category[]
  project: Project
  translationKey: TranslationKey
}

export default function UpdateTranslationKeyModal({ isOpen, onClose, onSubmit, categories, project, translationKey }: UpdateTranslationKeyModalProps) {
  const [prop, setProp] = useState(translationKey.key)
  const [description, setDescription] = useState(translationKey.description)
  const [valueType, setValueType] = useState<ValueType>(translationKey.valueType)
  const [textValue, setTextValue] = useState('')
  const [objectPairs, setObjectPairs] = useState<KeyValuePair[]>([{ key: '', value: '' }])
  const [arrayItems, setArrayItems] = useState<ArrayItem[]>([{ type: 'string', value: '' }])
  const [categoryId, setCategoryId] = useState(translationKey.categoryId)
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Initialize form with existing data
  useEffect(() => {
    const englishValue = translationKey.values.find(v => v.language === 'en')?.value

    if (valueType === 'text' && typeof englishValue === 'string') {
      setTextValue(englishValue)
    } else if (valueType === 'object' && typeof englishValue === 'object' && englishValue !== null) {
      const pairs = Object.entries(englishValue as object).map(([key, value]) => ({
        key,
        value: String(value)
      }))
      setObjectPairs(pairs.length > 0 ? pairs : [{ key: '', value: '' }])
    } else if (valueType === 'array' && Array.isArray(englishValue)) {
      const items = englishValue.map(item => {
        if (typeof item === 'string') {
          return { type: 'string' as const, value: item }
        } else if (typeof item === 'object' && item !== null) {
          const pairs = Object.entries(item).map(([key, value]) => ({
            key,
            value: String(value)
          }))
          return { type: 'object' as const, value: pairs }
        }
        return { type: 'string' as const, value: '' }
      })
      setArrayItems(items.length > 0 ? items : [{ type: 'string', value: '' }])
    }
  }, [translationKey, valueType])

  const getCurrentValue = () => {
    switch (valueType) {
      case 'text':
        return textValue
      case 'object':
        const obj: any = {}
        objectPairs.forEach(pair => {
          if (pair.key.trim() && pair.value.trim()) {
            obj[pair.key.trim()] = pair.value.trim()
          }
        })
        return obj
      case 'array':
        return arrayItems
          .filter(item => {
            if (item.type === 'string') {
              return (item.value as string).trim() !== ''
            } else {
              return (item.value as KeyValuePair[]).some(pair => pair.key.trim() && pair.value.trim())
            }
          })
          .map(item => {
            if (item.type === 'string') {
              return item.value as string
            } else {
              const obj: any = {}
              ;(item.value as KeyValuePair[]).forEach(pair => {
                if (pair.key.trim() && pair.value.trim()) {
                  obj[pair.key.trim()] = pair.value.trim()
                }
              })
              return obj
            }
          })
    }
  }

  const validateValue = () => {
    setValidationError('')
    
    switch (valueType) {
      case 'text':
        if (!textValue.trim()) {
          setValidationError('Text value is required')
          return false
        }
        break
      case 'object':
        const hasValidPairs = objectPairs.some(pair => pair.key.trim() && pair.value.trim())
        if (!hasValidPairs) {
          setValidationError('At least one key-value pair is required')
          return false
        }
        const keys = objectPairs.map(pair => pair.key.trim()).filter(key => key !== '')
        const uniqueKeys = new Set(keys)
        if (keys.length !== uniqueKeys.size) {
          setValidationError('Object keys must be unique')
          return false
        }
        break
      case 'array':
        const hasValidItems = arrayItems.some(item => {
          if (item.type === 'string') {
            return (item.value as string).trim() !== ''
          } else {
            return (item.value as KeyValuePair[]).some(pair => pair.key.trim() && pair.value.trim())
          }
        })
        if (!hasValidItems) {
          setValidationError('At least one array item is required')
          return false
        }
        break
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateValue()) {
      return
    }

    setIsLoading(true)

    try {
      await onSubmit({
        keyId: translationKey._id,
        prop,
        description: description || undefined,
        value: getCurrentValue(),
        valueType,
        categoryId,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const addObjectPair = () => {
    setObjectPairs([...objectPairs, { key: '', value: '' }])
  }

  const removeObjectPair = (index: number) => {
    if (objectPairs.length > 1) {
      setObjectPairs(objectPairs.filter((_, i) => i !== index))
    }
  }

  const updateObjectPair = (index: number, field: 'key' | 'value', value: string) => {
    const newPairs = [...objectPairs]
    newPairs[index][field] = value
    setObjectPairs(newPairs)
  }

  const addArrayItem = () => {
    setArrayItems([...arrayItems, { type: 'string', value: '' }])
  }

  const removeArrayItem = (index: number) => {
    if (arrayItems.length > 1) {
      setArrayItems(arrayItems.filter((_, i) => i !== index))
    }
  }

  const updateArrayItem = (index: number, value: string | KeyValuePair[]) => {
    const newItems = [...arrayItems]
    newItems[index].value = value
    setArrayItems(newItems)
  }

  const updateArrayItemType = (index: number, type: 'string' | 'object') => {
    const newItems = [...arrayItems]
    newItems[index] = { 
      type, 
      value: type === 'string' ? '' : [{ key: '', value: '' }]
    }
    setArrayItems(newItems)
  }

  const addObjectPairToArrayItem = (itemIndex: number) => {
    const newItems = [...arrayItems]
    const currentPairs = newItems[itemIndex].value as KeyValuePair[]
    newItems[itemIndex].value = [...currentPairs, { key: '', value: '' }]
    setArrayItems(newItems)
  }

  const removeObjectPairFromArrayItem = (itemIndex: number, pairIndex: number) => {
    const newItems = [...arrayItems]
    const currentPairs = newItems[itemIndex].value as KeyValuePair[]
    newItems[itemIndex].value = currentPairs.filter((_, i) => i !== pairIndex)
    setArrayItems(newItems)
  }

  const updateObjectPairInArrayItem = (itemIndex: number, pairIndex: number, field: 'key' | 'value', value: string) => {
    const newItems = [...arrayItems]
    const currentPairs = newItems[itemIndex].value as KeyValuePair[]
    currentPairs[pairIndex][field] = value
    setArrayItems(newItems)
  }

  const renderValueInput = () => {
    switch (valueType) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor="textValue">Text Value (English) *</Label>
            <Textarea
              id="textValue"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter the English text that will be translated to other languages..."
              rows={4}
            />
          </div>
        )
      
      case 'object':
        return (
          <div className="space-y-3">
            <Label>Object Properties (English) *</Label>
            <div className="space-y-3">
              {objectPairs.map((pair, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={pair.key}
                    onChange={(e) => updateObjectPair(index, 'key', e.target.value)}
                    placeholder="Property name"
                  />
                  <span className="text-muted-foreground">:</span>
                  <Input
                    type="text"
                    value={pair.value}
                    onChange={(e) => updateObjectPair(index, 'value', e.target.value)}
                    placeholder="Property value"
                  />
                  {objectPairs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjectPair(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjectPair}
                className="w-fit"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Each property value will be translated to other languages.
            </p>
          </div>
        )
      
      case 'array':
        return (
          <div className="space-y-3">
            <Label>Array Items (English) *</Label>
            <div className="space-y-4">
              {arrayItems.map((item, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-muted-foreground text-sm">[{index}]</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={item.type === 'string' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateArrayItemType(index, 'string')}
                      >
                        String
                      </Button>
                      <Button
                        type="button"
                        variant={item.type === 'object' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateArrayItemType(index, 'object')}
                      >
                        Object
                      </Button>
                    </div>
                    {arrayItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(index)}
                        className="text-destructive hover:text-destructive ml-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {item.type === 'string' ? (
                    <Input
                      type="text"
                      value={item.value as string}
                      onChange={(e) => updateArrayItem(index, e.target.value)}
                      placeholder="Array item value"
                    />
                  ) : (
                    <div className="space-y-3">
                      {(item.value as KeyValuePair[]).map((pair, pairIndex) => (
                        <div key={pairIndex} className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={pair.key}
                            onChange={(e) => updateObjectPairInArrayItem(index, pairIndex, 'key', e.target.value)}
                            placeholder="Property name"
                          />
                          <span className="text-muted-foreground">:</span>
                          <Input
                            type="text"
                            value={pair.value}
                            onChange={(e) => updateObjectPairInArrayItem(index, pairIndex, 'value', e.target.value)}
                            placeholder="Property value"
                          />
                          {(item.value as KeyValuePair[]).length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeObjectPairFromArrayItem(index, pairIndex)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addObjectPairToArrayItem(index)}
                        className="w-fit"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Property
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addArrayItem}
                className="w-fit"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Each array item can be a string or object. All string values will be translated.
            </p>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="mr-2 h-5 w-5" />
            Update Translation Key
          </DialogTitle>
          <DialogDescription>
            Update the translation key for your project
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prop">Key Name *</Label>
              <Input
                id="prop"
                value={prop}
                onChange={(e) => setProp(e.target.value)}
                placeholder="Enter key name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valueType">Value Type *</Label>
            <Select value={valueType} onValueChange={(value) => setValueType(value as ValueType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="object">Object</SelectItem>
                <SelectItem value="array">Array</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderValueInput()}

          {validationError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {validationError}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !prop || !categoryId}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isLoading ? 'Updating...' : 'Update Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 