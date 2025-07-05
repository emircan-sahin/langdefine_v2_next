'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Key, Plus, Trash2, Upload, FileText, AlertCircle, Bot } from 'lucide-react'

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

interface ExtractedKey {
  key: string
  value: string
  description?: string
  lineNumber: number
  confidence: number
}

interface CreateTranslationKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (keyData: {
    prop: string
    description?: string
    value: string | object | any[]
    valueType: ValueType
    categoryId: string
  }) => void
  categories: Category[]
  project: Project
}

export default function CreateTranslationKeyModal({ isOpen, onClose, onSubmit, categories, project }: CreateTranslationKeyModalProps) {
  const [prop, setProp] = useState('')
  const [description, setDescription] = useState('')
  const [valueType, setValueType] = useState<ValueType>('text')
  const [textValue, setTextValue] = useState('')
  const [objectPairs, setObjectPairs] = useState<KeyValuePair[]>([{ key: '', value: '' }])
  const [arrayItems, setArrayItems] = useState<ArrayItem[]>([{ type: 'string', value: '' }])
  const [categoryId, setCategoryId] = useState('')
  const [validationError, setValidationError] = useState('')
  
  // File upload and AI analysis states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedKeys, setExtractedKeys] = useState<ExtractedKey[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)

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

  const resetForm = () => {
    setProp('')
    setDescription('')
    setTextValue('')
    setObjectPairs([{ key: '', value: '' }])
    setArrayItems([{ type: 'string', value: '' }])
    setCategoryId('')
    setValidationError('')
    setUploadedFile(null)
    setExtractedKeys([])
    setIsAnalyzing(false)
    setAnalysisError('')
    setShowFileUpload(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateValue()) {
      return
    }

    // Clear form immediately
    const formData = {
      prop,
      description: description || undefined,
      value: getCurrentValue(),
      valueType,
      categoryId,
    }
    
    resetForm()

    try {
      await onSubmit(formData)
    } catch (error) {
      // If there's an error, we don't need to do anything here
      // The parent component will handle the error toast
    }
  }

  const handleClose = () => {
    resetForm()
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

  // AI-powered file analysis using functions & tools
  const analyzeFileWithAI = async (file: File): Promise<ExtractedKey[]> => {
    const fileContent = await file.text()
    
    try {
      const response = await fetch('/api/analyze-translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent,
          fileName: file.name,
          projectLanguages: project.languages,
          mainLanguage: project.mainLanguage
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze file')
      }

      const data = await response.json()
      return data.keys || []
    } catch (error) {
      console.error('AI analysis failed:', error)
      throw new Error('Failed to analyze file with AI')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type - now includes HTML files
    const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.htm']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedExtensions.includes(fileExtension)) {
      setAnalysisError('Please upload a supported file type (.js, .jsx, .ts, .tsx, .html, .htm)')
      return
    }

    setUploadedFile(file)
    setIsAnalyzing(true)
    setAnalysisError('')

    try {
      const keys = await analyzeFileWithAI(file)
      setExtractedKeys(keys)
      
      if (keys.length === 0) {
        setAnalysisError('No translation keys found in the file. The AI analysis didn\'t detect any translatable content.')
      }
    } catch (error) {
      setAnalysisError('Failed to analyze the file. Please check if it\'s a valid React file.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const selectExtractedKey = (extractedKey: ExtractedKey) => {
    setProp(extractedKey.key)
    setTextValue(extractedKey.value)
    setDescription(extractedKey.description || '')
    setValueType('text')
  }

  const generateKeysFromFile = async () => {
    if (extractedKeys.length === 0) return

    for (const key of extractedKeys) {
      try {
        await onSubmit({
          prop: key.key,
          description: key.description,
          value: key.value,
          valueType: 'text' as ValueType,
          categoryId: categoryId || categories[0]?._id || '',
        })
      } catch (error) {
        console.error(`Failed to create key: ${key.key}`, error)
      }
    }

    // Clear the form after generating all keys
    resetForm()
    onClose()
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            Create Translation Key
          </DialogTitle>
          <DialogDescription>
            Create a new translation key for your project or upload a React file for AI-powered analysis
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">AI-Powered File Analysis</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFileUpload(!showFileUpload)}
              >
                {showFileUpload ? 'Hide' : 'Show'} File Upload
              </Button>
            </div>
            
            {showFileUpload && (
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileUpload" className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload React File for AI Analysis
                  </Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    accept=".js,.jsx,.ts,.tsx,.html,.htm"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a file (.js, .jsx, .ts, .tsx, .html, .htm) and AI will automatically extract translation keys
                  </p>
                </div>

                {isAnalyzing && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>AI is analyzing your file...</span>
                  </div>
                )}

                {uploadedFile && !isAnalyzing && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{uploadedFile.name}</span>
                  </div>
                )}

                {analysisError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{analysisError}</span>
                  </div>
                )}

                {extractedKeys.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        <Bot className="mr-2 h-4 w-4 inline" />
                        AI Extracted Keys ({extractedKeys.length})
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateKeysFromFile}
                        disabled={!categoryId}
                      >
                        Generate All Keys
                      </Button>
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {extractedKeys.map((key, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border border-border rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => selectExtractedKey(key)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{key.key}</span>
                              <span className="text-xs text-muted-foreground">
                                (Line {key.lineNumber})
                              </span>
                              {key.confidence && (
                                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                  {Math.round(key.confidence * 100)}%
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {key.value}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              selectExtractedKey(key)
                            }}
                          >
                            Use
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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
              disabled={!prop || !categoryId}
            >
              <Key className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 