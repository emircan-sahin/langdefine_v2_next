'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '../../../store/auth'
import { DashboardLayout } from '../../../components/ui/dashboard-layout'
import { PageHeader } from '../../../components/ui/page-header'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { useToast } from '../../../components/ui/use-toast'
import CreateCategoryModal from '../../../components/dashboard/CreateCategoryModal'
import CreateTranslationKeyModal from '../../../components/dashboard/CreateTranslationKeyModal'
import UpdateTranslationKeyModal from '../../../components/dashboard/UpdateTranslationKeyModal'
import ExportModal from '../../../components/dashboard/ExportModal'
import CategoryList from '../../../components/dashboard/CategoryList'
import { 
  ArrowLeft, 
  FolderPlus, 
  Key, 
  Download, 
  BookOpen,
  Globe,
  Languages
} from 'lucide-react'
import { Badge } from '../../../components/ui/badge'

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
  const { toast } = useToast()
  const projectId = params.id as string

  useEffect(() => {
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
      toast({
        title: 'Error',
        description: 'Failed to load project data',
        variant: 'destructive',
      })
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
      toast({
        title: 'Success',
        description: 'Category created successfully',
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      })
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
      toast({
        title: 'Success',
        description: 'Translation key created successfully',
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create translation key',
        variant: 'destructive',
      })
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
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      })
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
      toast({
        title: 'Success',
        description: 'Translation key deleted successfully',
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete translation key',
        variant: 'destructive',
      })
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
      toast({
        title: 'Success',
        description: 'Translation key updated successfully',
        variant: 'success',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update translation key',
        variant: 'destructive',
      })
    }
  }

  const handleEditKey = (key: TranslationKey) => {
    setSelectedKey(key)
    setShowUpdateKey(true)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">Error</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={project.name}
        description={project.description}
      >
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={() => setShowCreateCategory(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
          <Button variant="success" onClick={() => setShowCreateKey(true)}>
            <Key className="mr-2 h-4 w-4" />
            Add Key
          </Button>
          <Button variant="secondary" onClick={() => setShowExportModal(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => router.push('/documentation')}>
            <BookOpen className="mr-2 h-4 w-4" />
            Documentation
          </Button>
        </div>
      </PageHeader>

      {/* Project Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Languages</p>
                <p className="text-2xl font-bold gradient-text">{project.languages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold gradient-text">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Translation Keys</p>
                <p className="text-2xl font-bold gradient-text">{translationKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Languages */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Languages className="mr-2 h-5 w-5" />
            Supported Languages
          </CardTitle>
          <CardDescription>
            Languages configured for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {project.languages.map((language) => (
              <Badge 
                key={language} 
                variant={language === project.mainLanguage ? 'default' : 'secondary'}
                className="text-sm"
              >
                {language}
                {language === project.mainLanguage && (
                  <span className="ml-1 text-xs">(Main)</span>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories and Keys */}
      <CategoryList
        categories={categories}
        translationKeys={translationKeys}
        onCreateKey={() => setShowCreateKey(true)}
        onEditKey={handleEditKey}
        onDeleteCategory={handleDeleteCategory}
        onDeleteKey={handleDeleteKey}
        project={project}
      />

      {/* Modals */}
      <CreateCategoryModal
        isOpen={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onSubmit={handleCreateCategory}
        categories={categories}
      />

      <CreateTranslationKeyModal
        isOpen={showCreateKey}
        onClose={() => setShowCreateKey(false)}
        onSubmit={handleCreateTranslationKey}
        categories={categories}
        project={project}
      />

      {selectedKey && (
        <UpdateTranslationKeyModal
          isOpen={showUpdateKey}
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

      {project && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          projectId={projectId}
          projectName={project.name}
          languages={project.languages}
        />
      )}
    </DashboardLayout>
  )
} 