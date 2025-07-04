'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '../../../store/auth'
import CreateCategoryModal from '../../../components/dashboard/CreateCategoryModal'
import CreateTranslationKeyModal from '../../../components/dashboard/CreateTranslationKeyModal'
import UpdateTranslationKeyModal from '../../../components/dashboard/UpdateTranslationKeyModal'
import ExportModal from '../../../components/dashboard/ExportModal'
import CategoryList from '../../../components/dashboard/CategoryList'

interface Project {
  _id: string
  name: string
  description: string
  mainLanguage: string
  languages: string[]
}

interface Category {
  _id: string
  name: string
  description: string
  parentCategoryId: string | null
}

interface TranslationKey {
  _id: string
  title: string
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

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [translationKeys, setTranslationKeys] = useState<TranslationKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [showCreateKey, setShowCreateKey] = useState(false)
  const [showUpdateKey, setShowUpdateKey] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedKey, setSelectedKey] = useState<TranslationKey | null>(null)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const params = useParams()
  const { token, isAuthenticated, isLoading: authLoading, logout } = useAuthStore()
  const projectId = params.id as string

  useEffect(() => {
    // Wait for auth store to finish loading before checking authentication
    if (authLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchProjectData()
  }, [isAuthenticated, authLoading, router, projectId])

  const fetchProjectData = async () => {
    try {
      const [projectRes, categoriesRes, keysRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/categories?projectId=${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/keys?projectId=${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ])

      if (projectRes.status === 401) {
        logout()
        router.push('/login')
        return
      }

      if (projectRes.status === 404) {
        setError('Project not found')
        setIsLoading(false)
        return
      }

      if (!projectRes.ok || !categoriesRes.ok || !keysRes.ok) {
        throw new Error('Failed to fetch project data')
      }

      const [projectData, categoriesData, keysData] = await Promise.all([
        projectRes.json(),
        categoriesRes.json(),
        keysRes.json(),
      ])

      setProject(projectData.project)
      setCategories(categoriesData.categories)
      setTranslationKeys(keysData.keys)
    } catch (err) {
      setError('Failed to load project data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async (categoryData: {
    name: string
    description: string
    parentCategoryId?: string
  }) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...categoryData,
          projectId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      await fetchProjectData()
      setShowCreateCategory(false)
    } catch (err) {
      setError('Failed to create category')
    }
  }

  const handleCreateTranslationKey = async (keyData: {
    prop: string
    description?: string
    value: string | object | any[]
    valueType: 'text' | 'object' | 'array'
    categoryId: string
  }) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...keyData,
          projectId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create translation key')
      }

      await fetchProjectData()
      setShowCreateKey(false)
    } catch (err) {
      setError('Failed to create translation key')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories?categoryId=${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      await fetchProjectData()
    } catch (err) {
      setError('Failed to delete category')
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/keys?keyId=${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete translation key')
      }

      await fetchProjectData()
    } catch (err) {
      setError('Failed to delete translation key')
    }
  }

  const handleUpdateTranslationKey = async (keyData: {
    keyId: string
    prop: string
    description?: string
    value: string | object | any[]
    valueType: 'text' | 'object' | 'array'
    categoryId: string
  }) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...keyData,
          projectId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update translation key')
      }

      await fetchProjectData()
      setShowUpdateKey(false)
      setSelectedKey(null)
    } catch (err) {
      setError('Failed to update translation key')
    }
  }

  const handleEditKey = (key: TranslationKey) => {
    setSelectedKey(key)
    setShowUpdateKey(true)
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading project...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-500 hover:text-gray-700 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateCategory(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Create Category
              </button>
              <button
                onClick={() => setShowCreateKey(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add Key
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Export
              </button>
              <button
                onClick={() => router.push('/documentation')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Documentation
              </button>
            </div>
          </div>

          <CategoryList
            categories={categories}
            translationKeys={translationKeys}
            onCreateKey={() => setShowCreateKey(true)}
            onEditKey={handleEditKey}
            onDeleteCategory={handleDeleteCategory}
            onDeleteKey={handleDeleteKey}
          />
        </div>
      </div>

      {showCreateCategory && (
        <CreateCategoryModal
          onClose={() => setShowCreateCategory(false)}
          onSubmit={handleCreateCategory}
          categories={categories}
        />
      )}

      {showCreateKey && (
        <CreateTranslationKeyModal
          onClose={() => setShowCreateKey(false)}
          onSubmit={handleCreateTranslationKey}
          categories={categories}
          project={project}
        />
      )}

      {showUpdateKey && selectedKey && (
        <UpdateTranslationKeyModal
          onClose={() => {
            setShowUpdateKey(false)
            setSelectedKey(null)
          }}
          onSubmit={handleUpdateTranslationKey}
          categories={categories}
          project={project}
          translationKey={selectedKey}
        />
      )}

      {showExportModal && project && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          projectId={projectId}
          projectName={project.name}
          languages={project.languages}
        />
      )}
    </div>
  )
} 