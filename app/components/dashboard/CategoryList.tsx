'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FolderOpen, 
  Key, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronRight,
  FileText,
  Code,
  Database,
  Eye
} from 'lucide-react'
import { useState } from 'react'

interface Category {
  _id: string
  name: string
  description: string
  parentCategoryId: string | null
}

interface TranslationKey {
  _id: string
  title: string // This will be the prop name
  key: string
  description: string
  valueType: 'text' | 'object' | 'array'
  values: Array<{
    language: string
    value: string | object | any[]
    valueType: 'text' | 'object' | 'array'
  }>
  categoryId: string
}

interface CategoryListProps {
  categories: Category[]
  translationKeys: TranslationKey[]
  onCreateKey: () => void
  onEditKey: (key: TranslationKey) => void
  onDeleteCategory: (categoryId: string) => void
  onDeleteKey: (keyId: string) => void
  project?: { languages: string[] }
}

export default function CategoryList({ 
  categories, 
  translationKeys, 
  onCreateKey, 
  onEditKey,
  onDeleteCategory, 
  onDeleteKey,
  project
}: CategoryListProps) {
  const allLanguages = project?.languages || []
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(allLanguages)
  const [valueModal, setValueModal] = useState<{ value: any, language: string, valueType: string } | null>(null)
  const openValueModal = (valueObj: { value: any, language: string, valueType: string }) => setValueModal(valueObj)
  const closeValueModal = () => setValueModal(null)

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    )
  }
  const selectAll = () => setSelectedLanguages(allLanguages)
  const deselectAll = () => setSelectedLanguages([])

  const getCategoryKeys = (categoryId: string) => {
    return translationKeys.filter(key => key.categoryId === categoryId)
  }

  const getChildCategories = (parentId: string | null) => {
    return categories.filter(category => category.parentCategoryId === parentId)
  }

  const handleDeleteCategory = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this category? This will also delete all translation keys in this category.')) {
      onDeleteCategory(categoryId)
    }
  }

  const handleDeleteKey = (e: React.MouseEvent, keyId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this translation key?')) {
      onDeleteKey(keyId)
    }
  }

  const renderValuePreview = (value: any, valueType: string) => {
    switch (valueType) {
      case 'text':
        return (
          <span className="text-sm text-muted-foreground">
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </span>
        )
      
      case 'object':
        return (
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                Object
              </Badge>
              <span className="text-muted-foreground text-xs">
                {typeof value === 'object' && value !== null ? Object.keys(value).length : 0} properties
              </span>
            </div>
            {typeof value === 'object' && value !== null && Object.keys(value).length > 0 ? (
              <div className="bg-muted rounded p-3 space-y-2">
                {Object.entries(value).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-foreground min-w-0 flex-1 truncate">
                      {key}:
                    </span>
                    <span className="text-muted-foreground flex-1">
                      {typeof val === 'string' ? val : JSON.stringify(val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-xs italic">No properties</div>
            )}
          </div>
        )
      
      case 'array':
        return (
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="success" className="text-xs">
                Array
              </Badge>
              <span className="text-muted-foreground text-xs">
                {Array.isArray(value) ? value.length : 0} items
              </span>
            </div>
            {Array.isArray(value) && value.length > 0 ? (
              <div className="bg-muted rounded p-3 space-y-2">
                {value.map((item, index) => (
                  <div key={index} className="border-l-2 border-border pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-muted-foreground text-xs">
                        [{index}]:
                      </span>
                      <Badge variant={typeof item === 'string' ? 'default' : 'secondary'} className="text-xs">
                        {typeof item === 'string' ? 'String' : 'Object'}
                      </Badge>
                    </div>
                    {typeof item === 'string' ? (
                      <span className="text-muted-foreground text-xs">{item}</span>
                    ) : (
                      <div className="space-y-1">
                        {Object.entries(item).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-muted-foreground min-w-0 flex-1 truncate">
                              {key}:
                            </span>
                            <span className="text-muted-foreground flex-1">
                              {typeof val === 'string' ? val : JSON.stringify(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-xs italic">No items</div>
            )}
          </div>
        )
      
      default:
        return (
          <span className="text-sm text-muted-foreground">
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </span>
        )
    }
  }

  const renderCategory = (category: Category, level: number = 0) => {
    const childCategories = getChildCategories(category._id)
    const categoryKeys = getCategoryKeys(category._id)

    return (
      <div key={category._id} className="mb-6">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg" style={{ marginLeft: `${level * 20}px` }}>
                    {category.name}
                  </CardTitle>
                  {category.description && (
                    <CardDescription className="mt-1">{category.description}</CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCreateKey}
                  className="text-primary hover:text-primary"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Key
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteCategory(e, category._id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Supported Languages Filter */}
          {allLanguages.length > 0 && (
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-2 items-center">
                <span className="text-xs text-muted-foreground mr-2">Filter languages:</span>
                {allLanguages.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    className={`px-2 py-1 rounded text-xs border font-medium transition
                      ${selectedLanguages.includes(lang)
                        ? 'bg-primary text-primary-foreground border-primary shadow'
                        : 'bg-background/80 text-muted-foreground border-border hover:bg-muted/70'}
                    `}
                    onClick={() => toggleLanguage(lang)}
                  >
                    {lang}
                  </button>
                ))}
                <button type="button" className="ml-2 text-xs underline" onClick={selectAll}>Hepsini seç</button>
                <button type="button" className="ml-1 text-xs underline" onClick={deselectAll}>Temizle</button>
              </div>
            </CardContent>
          )}

          {categoryKeys.length > 0 && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryKeys.map((key) => (
                  <Card key={key._id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4 text-primary" />
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">{key.title}</h4>
                            {key.description && (
                              <p className="text-xs text-muted-foreground mb-1 line-clamp-2" title={key.description}>{key.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditKey(key)}
                            className="text-primary hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteKey(e, key._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {key.values.filter(value => selectedLanguages.includes(value.language)).map((value, index) => (
                          <div key={index} className="rounded bg-background border px-2 py-1 flex flex-col min-w-[90px] max-w-[180px] relative group">
                            <div className="flex items-center gap-1 mb-1">
                              <Badge variant="outline" className="text-xs px-1 py-0.5">
                                {value.language}
                              </Badge>
                              <Badge variant="secondary" className="text-xs px-1 py-0.5">
                                {value.valueType}
                              </Badge>
                              <button
                                className="ml-auto opacity-60 hover:opacity-100"
                                onClick={() => openValueModal(value)}
                                title="Detayı gör"
                                type="button"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                            <span
                              className="text-xs text-muted-foreground truncate cursor-help"
                              title={typeof value.value === 'string' ? value.value : JSON.stringify(value.value)}
                            >
                              {typeof value.value === 'string'
                                ? value.value.slice(0, 40)
                                : Array.isArray(value.value)
                                  ? `${value.value.length} item`
                                  : typeof value.value === 'object'
                                    ? `${Object.keys(value.value).length} property`
                                    : JSON.stringify(value.value).slice(0, 40)
                              }
                              {((typeof value.value === 'string' ? value.value : JSON.stringify(value.value)).length > 40) && '...'}
                            </span>
                            {/* Tooltip ile tamamı */}
                            <div className="hidden group-hover:block absolute z-10 left-0 top-full mt-1 w-max max-w-xs bg-background border p-2 rounded shadow text-xs">
                              {typeof value.value === 'string'
                                ? value.value
                                : <pre className="whitespace-pre-wrap">{JSON.stringify(value.value, null, 2)}</pre>
                              }
                            </div>
                          </div>
                        ))}
                        {key.values.filter(value => selectedLanguages.includes(value.language)).length === 0 && (
                          <span className="text-xs text-muted-foreground italic">Seçili dillerde değer yok</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          )}

          {childCategories.length > 0 && (
            <CardContent>
              <div className="space-y-4">
                {childCategories.map((childCategory) => renderCategory(childCategory, level + 1))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    )
  }

  const rootCategories = getChildCategories(null)

  if (rootCategories.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No categories yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first category to organize your translation keys.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {rootCategories.map((category) => renderCategory(category))}
        {/* Value Modal */}
        {valueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-background border rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                onClick={closeValueModal}
                title="Kapat"
                type="button"
              >
                ✕
              </button>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-1 py-0.5">{valueModal.language}</Badge>
                <Badge variant="secondary" className="text-xs px-1 py-0.5">{valueModal.valueType}</Badge>
              </div>
              <div className="overflow-auto max-h-96">
                {typeof valueModal.value === 'string'
                  ? <span className="text-sm">{valueModal.value}</span>
                  : <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(valueModal.value, null, 2)}</pre>
                }
              </div>
            </div>
          </div>
        )}
    </div>
  )
} 