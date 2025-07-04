'use client'

import { useState, useEffect } from 'react'

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

export default function UpdateTranslationKeyModal({ onClose, onSubmit, categories, project, translationKey }: UpdateTranslationKeyModalProps) {
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
        // Check for duplicate keys
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
    if (currentPairs.length > 1) {
      newItems[itemIndex].value = currentPairs.filter((_, i) => i !== pairIndex)
      setArrayItems(newItems)
    }
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
          <div>
            <label htmlFor="textValue" className="block text-sm font-medium text-gray-700">
              Text Value (English) *
            </label>
            <textarea
              id="textValue"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Enter the English text that will be translated to other languages..."
              required
            />
          </div>
        )
      
      case 'object':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Object Properties (English) *
            </label>
            <div className="space-y-3">
              {objectPairs.map((pair, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pair.key}
                    onChange={(e) => updateObjectPair(index, 'key', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Property name"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="text"
                    value={pair.value}
                    onChange={(e) => updateObjectPair(index, 'value', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Property value"
                  />
                  {objectPairs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjectPair(index)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addObjectPair}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Property
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Each property value will be translated to other languages.
            </p>
          </div>
        )
      
      case 'array':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Array Items (English) *
            </label>
            <div className="space-y-4">
              {arrayItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-500 text-sm">[{index}]</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateArrayItemType(index, 'string')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          item.type === 'string'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        String
                      </button>
                      <button
                        type="button"
                        onClick={() => updateArrayItemType(index, 'object')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          item.type === 'object'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        Object
                      </button>
                    </div>
                    {arrayItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors ml-auto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {item.type === 'string' ? (
                    <input
                      type="text"
                      value={item.value as string}
                      onChange={(e) => updateArrayItem(index, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Array item value"
                    />
                  ) : (
                    <div className="space-y-3">
                      {(item.value as KeyValuePair[]).map((pair, pairIndex) => (
                        <div key={pairIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={pair.key}
                            onChange={(e) => updateObjectPairInArrayItem(index, pairIndex, 'key', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Property name"
                          />
                          <span className="text-gray-500">:</span>
                          <input
                            type="text"
                            value={pair.value}
                            onChange={(e) => updateObjectPairInArrayItem(index, pairIndex, 'value', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Property value"
                          />
                          {(item.value as KeyValuePair[]).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeObjectPairFromArrayItem(index, pairIndex)}
                              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addObjectPairToArrayItem(index)}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Property
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addArrayItem}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Item
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Each array item can be a string or object. All string values will be translated.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Update Translation Key</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prop" className="block text-sm font-medium text-gray-700">
                  Prop *
                </label>
                <input
                  type="text"
                  id="prop"
                  value={prop}
                  onChange={(e) => setProp(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., welcome_message"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Provide context for better AI translation..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setValueType('text')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    valueType === 'text'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setValueType('object')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    valueType === 'object'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  Object
                </button>
                <button
                  type="button"
                  onClick={() => setValueType('array')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                    valueType === 'array'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  Array
                </button>
              </div>
            </div>

            {renderValueInput()}

            {validationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {validationError}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Auto Translation</h4>
              <p className="text-sm text-blue-700">
                This English {valueType} will be automatically translated to: {project.languages.filter(lang => lang !== 'en').join(', ')}
              </p>
              {valueType !== 'text' && (
                <p className="text-sm text-blue-600 mt-1">
                  Only string values within the {valueType} will be translated.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !prop || !categoryId || !getCurrentValue()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Key'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 