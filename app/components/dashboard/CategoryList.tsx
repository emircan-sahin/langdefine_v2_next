'use client'

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
}

export default function CategoryList({ 
  categories, 
  translationKeys, 
  onCreateKey, 
  onEditKey,
  onDeleteCategory, 
  onDeleteKey 
}: CategoryListProps) {
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
          <span className="text-sm text-gray-700">
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </span>
        )
      
      case 'object':
        return (
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Object
              </span>
              <span className="text-gray-500 text-xs">
                {typeof value === 'object' && value !== null ? Object.keys(value).length : 0} properties
              </span>
            </div>
            {typeof value === 'object' && value !== null && Object.keys(value).length > 0 ? (
              <div className="bg-gray-50 rounded p-3 space-y-2">
                {Object.entries(value).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-gray-700 min-w-0 flex-1 truncate">
                      {key}:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {typeof val === 'string' ? val : JSON.stringify(val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-xs italic">No properties</div>
            )}
          </div>
        )
      
      case 'array':
        return (
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Array
              </span>
              <span className="text-gray-500 text-xs">
                {Array.isArray(value) ? value.length : 0} items
              </span>
            </div>
            {Array.isArray(value) && value.length > 0 ? (
              <div className="bg-gray-50 rounded p-3 space-y-2">
                {value.map((item, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-500 text-xs">
                        [{index}]:
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                        typeof item === 'string' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                      }`}>
                        {typeof item === 'string' ? 'String' : 'Object'}
                      </span>
                    </div>
                    {typeof item === 'string' ? (
                      <span className="text-gray-600 text-xs">{item}</span>
                    ) : (
                      <div className="space-y-1">
                        {Object.entries(item).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-gray-600 min-w-0 flex-1 truncate">
                              {key}:
                            </span>
                            <span className="text-gray-500 flex-1">
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
              <div className="text-gray-500 text-xs italic">No items</div>
            )}
          </div>
        )
      
      default:
        return (
          <span className="text-sm text-gray-700">
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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900" style={{ marginLeft: `${level * 20}px` }}>
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onCreateKey}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Add Key
              </button>
              <button
                onClick={(e) => handleDeleteCategory(e, category._id)}
                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                title="Delete category"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {categoryKeys.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Translation Keys</h4>
              <div className="space-y-3">
                {categoryKeys.map((key) => (
                  <div key={key._id} className="bg-gray-50 rounded p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">{key.title}</h5>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            key.valueType === 'text' ? 'bg-blue-100 text-blue-800' :
                            key.valueType === 'object' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {key.valueType.charAt(0).toUpperCase() + key.valueType.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{key.key}</p>
                        {key.description && (
                          <p className="text-xs text-gray-500 mt-1">{key.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {key.values.length} translation{key.values.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditKey(key)
                          }}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                          title="Edit translation key"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteKey(e, key._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete translation key"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {key.values.map((value, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-700">
                              {value.language.toUpperCase()}:
                            </span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                              value.valueType === 'text' ? 'bg-blue-50 text-blue-700' :
                              value.valueType === 'object' ? 'bg-purple-50 text-purple-700' :
                              'bg-green-50 text-green-700'
                            }`}>
                              {value.valueType}
                            </span>
                          </div>
                          {renderValuePreview(value.value, value.valueType)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {childCategories.length > 0 && (
            <div className="mt-4">
              {childCategories.map(childCategory => renderCategory(childCategory, level + 1))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const rootCategories = getChildCategories(null)

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
        <p className="text-gray-500 mb-4">
          Create your first category to start organizing translation keys.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rootCategories.map(category => renderCategory(category))}
    </div>
  )
} 